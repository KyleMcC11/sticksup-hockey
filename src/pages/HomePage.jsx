import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { teams } from "../data/teams.js";
import loadPlayerStats from "../data/loadPlayerStats.js";
import loadStandings from "../data/loadStandings.js";
import PlayerLink from "../components/PlayerLink.jsx";

const TEAM_STATS_CODES = {
  halifax: "Hal",
  moncton: "Mon",
  "cape-breton": "Cap",
  charlottetown: "Cha",
  "saint-john": "SNB",
  newfoundland: "NFL",
  "baie-comeau": "BaC",
  chicoutimi: "Chi",
  quebec: "Que",
  rimouski: "Rim",
  "blainville-boisbriand": "BLB",
  drummondville: "Dru",
  gatineau: "Gat",
  "rouyn-noranda": "Rou",
  shawinigan: "Sha",
  sherbrooke: "She",
  "val-dor": "VdO",
  victoriaville: "Vic",
};

const teamByCode = {};

Object.entries(TEAM_STATS_CODES).forEach(([slug, code]) => {
  const team = teams.find((entry) => entry.slug === slug);

  if (team) {
    teamByCode[code] = team;
  }
});

function logoUrl(logo) {
  if (!logo) {
    return "";
  }

  const cleanPath = String(logo).replace(/^\/+/, "");

  return `${import.meta.env.BASE_URL}${cleanPath}`;
}

function teamLabel(code) {
  const team = teamByCode[code];

  return team ? team.abbreviation : code;
}

function formatStatsUpdated(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    .toUpperCase();
}

function HomePage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const [leaders, setLeaders] = useState([]);
  const [standings, setStandings] = useState([]);
  const [showAllLeaders, setShowAllLeaders] = useState(false);
  const [statsUpdated, setStatsUpdated] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHomeData() {
      try {
        const [players, table] = await Promise.all([
          loadPlayerStats(),
          loadStandings(),
        ]);

        if (cancelled) {
          return;
        }

        const rankedSkaters = [...players]
          .filter((player) => (player.gamesPlayed || 0) > 0)
          .sort((a, b) => {
            return (
              b.points - a.points ||
              b.goals - a.goals ||
              b.gamesPlayed - a.gamesPlayed
            );
          })
          .slice(0, 50);

        const rankedTeams = [...table]
          .sort((a, b) => {
            return b.pts - a.pts || b.w - a.w || b.diff - a.diff;
          })
          .slice(0, 5);

        setLeaders(rankedSkaters);
        setStandings(rankedTeams);
        setStatsUpdated(formatStatsUpdated(players[0]?.scrapedAt));
      } catch (err) {
        if (!cancelled) {
          setError("Could not load live stats right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="home-hero">
        <p className="home-dateline">
          {today} &middot; QMJHL 2026&ndash;27
          {statsUpdated && (
            <>
              {" "}
              &middot;{" "}
              <span className="home-dateline-fresh">
                Stats updated {statsUpdated}
              </span>
            </>
          )}
        </p>
        <h2>Sticks Up Hockey</h2>
        <p>
          Live player stats, projected lineups and standings for all 18
          QMJHL teams &mdash; refreshed daily.
        </p>
      </section>

      {loading && <p className="home-status">Loading live stats&hellip;</p>}

      {!loading && error && <p className="home-status">{error}</p>}

      {!loading && !error && (
        <div className="home-grid-2">
          <section className="home-card">
            <div className="home-card-head">
              <h3>Scoring Leaders</h3>
              <Link to="/teams">All teams</Link>
            </div>

            <ol className="leaders-list">
              {(showAllLeaders ? leaders : leaders.slice(0, 10)).map(
                (player, index) => {
                  const team = teamByCode[player.teamCode];
                  const primary = team?.primary || "#1c1c21";
                  const logo = logoUrl(team?.logo);

                  return (
                    <li
                      key={player.id || `${player.name}-${index}`}
                      className="leader-row-team"
                      style={{
                        "--team-color": primary,
                        background: `linear-gradient(90deg, ${primary}26 0%, transparent 70%)`,
                      }}
                    >
                      {logo && (
                        <img
                          className="leader-team-watermark"
                          src={logo}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                        />
                      )}

                      <span className="leader-rank">{index + 1}</span>

                      <span className="leader-main">
                        <strong>
                          <PlayerLink
                            playerId={player.id}
                            name={player.name}
                          />
                        </strong>
                        <span>
                          {teamLabel(player.teamCode)}
                          {player.position
                            ? ` \u00B7 ${player.position}`
                            : ""}
                        </span>
                      </span>

                      <span className="leader-line">
                        {player.goals}G &middot; {player.assists}A
                      </span>

                      <strong className="leader-points">
                        {player.points} PTS
                      </strong>
                    </li>
                  );
                }
              )}
            </ol>

            {leaders.length > 10 && (
              <button
                type="button"
                className="leaders-toggle"
                onClick={() => setShowAllLeaders((open) => !open)}
              >
                {showAllLeaders ? "Show top 10" : "View top 50"}
              </button>
            )}
          </section>

          <section className="home-card">
            <div className="home-card-head">
              <h3>Standings &mdash; Top 5</h3>
              <Link to="/standings">Full standings</Link>
            </div>

            <table className="home-mini-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>GP</th>
                  <th>W</th>
                  <th>PTS</th>
                </tr>
              </thead>

              <tbody>
                {standings.map((team, index) => (
                  <tr key={team.id || `${team.code}-${index}`}>
                    <td>
                      <strong>{team.team}</strong>
                    </td>
                    <td>{team.gp}</td>
                    <td>{team.w}</td>
                    <td className="home-pts">{team.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      <section className="home-teams">
        <div className="home-card-head">
          <h3>All Teams</h3>
        </div>

        <div className="teams-grid">
          {teams.map((team) => (
            <Link
              key={team.slug}
              to={`/lineups/${team.slug}`}
              className="team-tile"
            >
              {logoUrl(team.logo) && (
                <img
                  src={logoUrl(team.logo)}
                  alt={`${team.fullName} logo`}
                  loading="lazy"
                />
              )}

              <strong>{team.fullName}</strong>
              <span>{team.division}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export default HomePage;
