import { useEffect, useMemo, useState } from "react";

import loadPlayerStats from "../data/loadPlayerStats.js";
import loadGoalieStats from "../data/loadGoalieStats.js";
import PlayerLink from "../components/PlayerLink.jsx";
import { findTeamByFeedCode } from "../data/teamCodes.js";

function teamAbbr(code) {
  const team = findTeamByFeedCode(code);
  return team ? team.abbreviation : code;
}

function RookiesPage() {
  const [skaters, setSkaters] = useState([]);
  const [goalies, setGoalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [skaterRows, goalieRows] = await Promise.all([
          loadPlayerStats(),
          loadGoalieStats(),
        ]);

        if (!cancelled) {
          setSkaters(skaterRows);
          setGoalies(goalieRows);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Could not load rookie stats right now.");
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

  const rookieSkaters = useMemo(() => {
    return skaters
      .filter((player) => player.rookie)
      .sort((a, b) => b.points - a.points || b.goals - a.goals);
  }, [skaters]);

  const rookieGoalies = useMemo(() => {
    return goalies
      .filter((goalie) => goalie.rookie)
      .sort((a, b) => b.wins - a.wins || a.goalsAgainstAverage - b.goalsAgainstAverage);
  }, [goalies]);

  return (
    <>
      <section className="page-title">
        <p className="home-dateline">QMJHL 2026&ndash;27</p>
        <h2>Rookie Race</h2>
        <p>First-year players leading the way this season.</p>
      </section>

      {loading && <p className="home-status">Loading rookies&hellip;</p>}
      {!loading && error && <p className="home-status">{error}</p>}

      {!loading && !error && (
        <>
          <section className="rookies-card">
            <h3>Skaters</h3>
            {rookieSkaters.length === 0 ? (
              <p className="home-status">No rookie skaters found.</p>
            ) : (
              <div className="table-scroll">
                <table className="rookies-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
                      <th>Team</th>
                      <th>Pos</th>
                      <th>GP</th>
                      <th>G</th>
                      <th>A</th>
                      <th>PTS</th>
                      <th>+/-</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rookieSkaters.map((player, index) => (
                      <tr
                        key={player.id || `${player.name}-${index}`}
                        className="team-row-subtle"
                        style={{
                          "--team-color":
                            findTeamByFeedCode(player.teamCode)?.primary ||
                            "transparent",
                        }}
                      >
                        <td>{index + 1}</td>
                        <td>
                          <PlayerLink playerId={player.id} name={player.name} />
                        </td>
                        <td>{teamAbbr(player.teamCode)}</td>
                        <td>{player.position}</td>
                        <td>{player.gamesPlayed}</td>
                        <td>{player.goals}</td>
                        <td>{player.assists}</td>
                        <td>
                          <strong>{player.points}</strong>
                        </td>
                        <td>{player.plusMinus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {rookieGoalies.length > 0 && (
            <section className="rookies-card">
              <h3>Goalies</h3>
              <div className="table-scroll">
                <table className="rookies-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Goalie</th>
                      <th>Team</th>
                      <th>GP</th>
                      <th>W</th>
                      <th>GAA</th>
                      <th>SV%</th>
                      <th>SO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rookieGoalies.map((goalie, index) => (
                      <tr
                        key={goalie.id || `${goalie.name}-${index}`}
                        className="team-row-subtle"
                        style={{
                          "--team-color":
                            findTeamByFeedCode(goalie.teamCode)?.primary ||
                            "transparent",
                        }}
                      >
                        <td>{index + 1}</td>
                        <td>
                          <PlayerLink playerId={goalie.id} name={goalie.name} />
                        </td>
                        <td>{teamAbbr(goalie.teamCode)}</td>
                        <td>{goalie.gamesPlayed}</td>
                        <td>{goalie.wins}</td>
                        <td>{goalie.goalsAgainstAverage.toFixed(2)}</td>
                        <td>
                          {goalie.savePercentage > 0
                            ? goalie.savePercentage.toFixed(3).replace(/^0/, "")
                            : "—"}
                        </td>
                        <td>{goalie.shutouts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

export default RookiesPage;
