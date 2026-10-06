import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { teams } from "../data/teams.js";
import loadPlayerStats from "../data/loadPlayerStats.js";
import loadStandings from "../data/loadStandings.js";
import loadSchedule from "../data/loadSchedule.js";
import PlayerLink from "../components/PlayerLink.jsx";
import { teamRowStyle, TeamWatermark } from "../components/TeamStyle.jsx";

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

function startOfDay(value) {
  const day = new Date(value);
  day.setHours(0, 0, 0, 0);
  return day;
}

function pickSpotlightGames(schedule) {
  const todayStart = startOfDay(new Date()).getTime();

  const upcoming = schedule.filter(
    (game) => !game.isFinal && game.date && game.date >= new Date(todayStart)
  );

  const tonight = upcoming.filter(
    (game) => startOfDay(game.date).getTime() === todayStart
  );

  if (tonight.length > 0) {
    return { label: "Tonight", games: tonight };
  }

  if (upcoming.length === 0) {
    return { label: "Tonight", games: [] };
  }

  const nextDay = startOfDay(upcoming[0].date).getTime();
  const games = upcoming.filter(
    (game) => startOfDay(game.date).getTime() === nextDay
  );
  const diffDays = Math.round((nextDay - todayStart) / 86400000);

  const label =
    diffDays === 1
      ? "Tomorrow"
      : new Date(nextDay).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });

  return { label, games };
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
  const [spotlight, setSpotlight] = useState({ label: "Tonight", games: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHomeData() {
      try {
        const [players, table, schedule] = await Promise.all([
          loadPlayerStats(),
          loadStandings(),
          loadSchedule(),
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
        setSpotlight(pickSpotlightGames(schedule));
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

                  return (
                    <li
                      key={player.id || `${player.name}-${index}`}
                      className="team-row"
                      style={teamRowStyle(team)}
                    >
                      <TeamWatermark team={team} />

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

          <div className="home-col">
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
                  {standings.map((team, index) => {
                    const teamEntry = teamByCode[team.code];

                    return (
                      <tr
                        key={team.id || `${team.code}-${index}`}
                        className="team-row-subtle"
                        style={{
                          "--team-color": teamEntry?.primary || "transparent",
                        }}
                      >
                        <td>
                          <strong>{team.team}</strong>
                        </td>
                        <td>{team.gp}</td>
                        <td>{team.w}</td>
                        <td className="home-pts">{team.pts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            <section className="home-card">
              <div className="home-card-head">
                <h3>{spotlight.label}</h3>
                <Link to="/scores">Full schedule</Link>
              </div>

              {spotlight.games.length === 0 ? (
                <p className="scores-empty">No games scheduled.</p>
              ) : (
                <ul className="tonight-list">
                  {spotlight.games.map((game) => (
                    <li key={game.id} className="tonight-game">
                      <span className="tonight-matchup">
                        {logoUrl(game.awayTeam?.logo) && (
                          <img
                            src={logoUrl(game.awayTeam.logo)}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                          />
                        )}
                        <strong>
                          {game.awayTeam?.abbreviation || game.awayCode}
                        </strong>
                        <span className="tonight-at">at</span>
                        <strong>
                          {game.homeTeam?.abbreviation || game.homeCode}
                        </strong>
                        {logoUrl(game.homeTeam?.logo) && (
                          <img
                            src={logoUrl(game.homeTeam.logo)}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                          />
                        )}
                      </span>
                      <span className="tonight-meta">
                        {game.timeLabel}
                        {game.venue ? ` \u00B7 ${game.venue}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
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
