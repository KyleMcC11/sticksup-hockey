import { useEffect, useMemo, useState } from "react";

import { teams } from "../data/teams.js";
import loadGoalieStats from "../data/loadGoalieStats.js";
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

const sortOptions = [
  { value: "wins", label: "Wins" },
  { value: "savePercentage", label: "Save %" },
  { value: "goalsAgainstAverage", label: "GAA" },
  { value: "shutouts", label: "Shutouts" },
  { value: "gamesPlayed", label: "Games Played" },
];

const MIN_GAMES_FOR_RATE_STATS = 2;

function teamName(code) {
  const team = teamByCode[code];

  return team ? team.fullName : code;
}

function formatSavePercentage(value) {
  const numeric = Number(value) || 0;

  return numeric.toFixed(3).replace(/^0/, "");
}

function formatGaa(value) {
  const numeric = Number(value) || 0;

  return numeric.toFixed(2);
}

function sortGoalies(goaliesList, sortBy, direction) {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...goaliesList].sort((a, b) => {
    const aValue = Number(a[sortBy]) || 0;
    const bValue = Number(b[sortBy]) || 0;

    if (aValue !== bValue) {
      return (aValue - bValue) * multiplier;
    }

    return (
      b.gamesPlayed - a.gamesPlayed || a.name.localeCompare(b.name)
    );
  });
}

function bestBy(goaliesList, field, lowestWins, minGames) {
  const eligible = goaliesList.filter(
    (goalie) => goalie.gamesPlayed >= minGames
  );

  const pool = eligible.length > 0 ? eligible : goaliesList;

  if (pool.length === 0) {
    return null;
  }

  return [...pool].sort((a, b) => {
    const diff =
      (Number(a[field]) || 0) - (Number(b[field]) || 0);

    return lowestWins ? diff : -diff;
  })[0];
}

function GoaliesPage() {
  const [goalies, setGoalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("wins");
  const [direction, setDirection] = useState("desc");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const stats = await loadGoalieStats();

        if (cancelled) {
          return;
        }

        const active = stats.filter(
          (goalie) => goalie.gamesPlayed > 0
        );

        setGoalies(active);
      } catch (err) {
        if (!cancelled) {
          setError("Could not load goalie stats right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedGoalies = useMemo(() => {
    return sortGoalies(goalies, sortBy, direction);
  }, [goalies, sortBy, direction]);

  const bestSavePercentage = useMemo(() => {
    return bestBy(goalies, "savePercentage", false, MIN_GAMES_FOR_RATE_STATS);
  }, [goalies]);

  const mostWins = useMemo(() => {
    return bestBy(goalies, "wins", false, 0);
  }, [goalies]);

  const bestGaa = useMemo(() => {
    return bestBy(
      goalies,
      "goalsAgainstAverage",
      true,
      MIN_GAMES_FOR_RATE_STATS
    );
  }, [goalies]);

  return (
    <>
      <section className="page-title goalie-page-title">
        <p className="section-label">Goaltending</p>
        <h2>QMJHL Goalie Stats</h2>
        <p>
          Live goaltending numbers from around the league &mdash; updated
          daily.
        </p>
      </section>

      {loading && <p className="home-status">Loading goalie stats&hellip;</p>}

      {!loading && error && <p className="home-status">{error}</p>}

      {!loading && !error && goalies.length === 0 && (
        <p className="home-status">No goalie stats available yet.</p>
      )}

      {!loading && !error && goalies.length > 0 && (
        <>
          <section className="goalie-leader-row">
            <article
              className="goalie-leader-card team-row"
              style={teamRowStyle(teamByCode[bestSavePercentage?.teamCode])}
            >
              <TeamWatermark team={teamByCode[bestSavePercentage?.teamCode]} />
              <span>Best Save Percentage</span>
              {bestSavePercentage ? (
                <>
                  <h3>{bestSavePercentage.name}</h3>
                  <p>
                    {formatSavePercentage(
                      bestSavePercentage.savePercentage
                    )}{" "}
                    SV% &mdash; {teamName(bestSavePercentage.teamCode)}
                  </p>
                </>
              ) : (
                <p>Not available yet.</p>
              )}
            </article>

            <article
              className="goalie-leader-card team-row"
              style={teamRowStyle(teamByCode[mostWins?.teamCode])}
            >
              <TeamWatermark team={teamByCode[mostWins?.teamCode]} />
              <span>Most Wins</span>
              {mostWins ? (
                <>
                  <h3>{mostWins.name}</h3>
                  <p>
                    {mostWins.wins} wins &mdash;{" "}
                    {teamName(mostWins.teamCode)}
                  </p>
                </>
              ) : (
                <p>Not available yet.</p>
              )}
            </article>

            <article
              className="goalie-leader-card team-row"
              style={teamRowStyle(teamByCode[bestGaa?.teamCode])}
            >
              <TeamWatermark team={teamByCode[bestGaa?.teamCode]} />
              <span>Lowest GAA</span>
              {bestGaa ? (
                <>
                  <h3>{bestGaa.name}</h3>
                  <p>
                    {formatGaa(bestGaa.goalsAgainstAverage)} GAA &mdash;{" "}
                    {teamName(bestGaa.teamCode)}
                  </p>
                </>
              ) : (
                <p>Not available yet.</p>
              )}
            </article>
          </section>

          <section className="goalie-table-card">
            <div className="section-header">
              <h2>Goalie Stats</h2>

              <div className="standings-controls">
                <label>
                  Sort by
                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value)
                    }
                  >
                    {sortOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setDirection((current) =>
                      current === "desc" ? "asc" : "desc"
                    )
                  }
                >
                  {direction === "desc"
                    ? "Highest first"
                    : "Lowest first"}
                </button>
              </div>
            </div>

            <div className="goalie-table-wrap">
              <table className="goalie-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Goalie</th>
                    <th>Team</th>
                    <th>GP</th>
                    <th>W</th>
                    <th>L</th>
                    <th>OTL</th>
                    <th>SV%</th>
                    <th>GAA</th>
                    <th>SO</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedGoalies.map((goalie, index) => (
                    <tr
                      key={goalie.id || `${goalie.name}-${index}`}
                      className="team-row-subtle"
                      style={{
                        "--team-color":
                          teamByCode[goalie.teamCode]?.primary || "transparent",
                      }}
                    >
                      <td>{index + 1}</td>
                      <td>
                        <strong>
                          <PlayerLink playerId={goalie.id} name={goalie.name} />
                        </strong>
                      </td>
                      <td>{teamName(goalie.teamCode)}</td>
                      <td>{goalie.gamesPlayed}</td>
                      <td>{goalie.wins}</td>
                      <td>{goalie.losses}</td>
                      <td>{goalie.otLosses}</td>
                      <td>
                        {formatSavePercentage(goalie.savePercentage)}
                      </td>
                      <td>{formatGaa(goalie.goalsAgainstAverage)}</td>
                      <td>{goalie.shutouts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}

export default GoaliesPage;
