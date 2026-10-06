import { useEffect, useMemo, useState } from "react";

import loadSchedule from "../data/loadSchedule.js";
import loadGameEvents from "../data/loadGameEvents.js";
import loadPlayerStats from "../data/loadPlayerStats.js";
import {
  buildPlayerNameIndex,
  flipEventName,
} from "../data/playerNames.js";
import PlayerLink from "../components/PlayerLink.jsx";
import { findTeamByFeedCode } from "../data/teamCodes.js";

function teamAbbr(code) {
  const team = findTeamByFeedCode(code);
  return team ? team.abbreviation : code;
}

// Current W/L streak per team from completed games (newest first).
function computeTeamStreaks(schedule) {
  const finals = schedule
    .filter((game) => game.isFinal && game.date)
    .sort((a, b) => b.date - a.date);

  const seen = new Map();

  for (const game of finals) {
    for (const side of ["home", "away"]) {
      const code = side === "home" ? game.homeCode : game.awayCode;

      if (!code || seen.has(code)) {
        continue;
      }

      const mine = side === "home" ? game.homeScore : game.awayScore;
      const theirs = side === "home" ? game.awayScore : game.homeScore;
      const won = mine > theirs;

      // Peek further back to extend the streak.
      let count = 0;
      let streakWon = won;

      for (const past of finals) {
        const pastSide =
          past.homeCode === code ? "home" : past.awayCode === code ? "away" : null;

        if (!pastSide) {
          continue;
        }

        const pastMine = pastSide === "home" ? past.homeScore : past.awayScore;
        const pastTheirs = pastSide === "home" ? past.awayScore : past.homeScore;
        const pastWon = pastMine > pastTheirs;

        if (pastWon !== streakWon) {
          break;
        }

        count += 1;
      }

      seen.set(code, { code, won: streakWon, count });
    }
  }

  return [...seen.values()].sort((a, b) => {
    if (a.won !== b.won) {
      return a.won ? -1 : 1;
    }

    return b.count - a.count;
  });
}

// Active point streaks: consecutive team games (with tracked scoring data,
// newest first) in which the skater recorded a point.
function computePointStreaks(schedule, eventsByGame, players, nameIndex) {
  const finals = schedule
    .filter((game) => game.isFinal && game.date)
    .sort((a, b) => a.date - b.date);

  const gamesWithEvents = new Set(Object.keys(eventsByGame));

  // player_id -> { name, teamCode, pointsByGame: Map(gameId -> points) }
  const skaters = new Map();

  for (const player of players) {
    skaters.set(String(player.id), {
      id: String(player.id),
      name: player.name,
      teamCode: player.teamCode,
      pointsByGame: new Map(),
      totalPoints: 0,
    });
  }

  for (const [gameId, events] of Object.entries(eventsByGame)) {
    for (const event of events) {
      if (event.kind !== "goal") {
        continue;
      }

      const entries = [
        { name: event.scorer, points: 1 },
        { name: event.assist1, points: 1 },
        { name: event.assist2, points: 1 },
      ];

      for (const entry of entries) {
        if (!entry.name) {
          continue;
        }

        const id = findPlayerIdSafe(entry.name, nameIndex);
        const skater = id ? skaters.get(id) : null;

        if (!skater) {
          continue;
        }

        skater.pointsByGame.set(
          gameId,
          (skater.pointsByGame.get(gameId) || 0) + entry.points
        );
        skater.totalPoints += entry.points;
      }
    }
  }

  const streaks = [];

  for (const skater of skaters.values()) {
    const teamGames = finals
      .filter(
        (game) =>
          (game.homeCode === skater.teamCode ||
            game.awayCode === skater.teamCode) &&
          gamesWithEvents.has(String(game.id))
      )
      .sort((a, b) => b.date - a.date);

    if (teamGames.length === 0) {
      continue;
    }

    let streak = 0;
    let streakPoints = 0;

    for (const game of teamGames) {
      const gamePoints = skater.pointsByGame.get(String(game.id)) || 0;

      if (gamePoints > 0) {
        streak += 1;
        streakPoints += gamePoints;
      } else {
        break;
      }
    }

    if (streak >= 3) {
      streaks.push({ ...skater, streak, streakPoints });
    }
  }

  streaks.sort((a, b) => b.streak - a.streak || b.totalPoints - a.totalPoints);

  const hottest = [...skaters.values()]
    .filter((skater) => skater.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 10);

  return { streaks: streaks.slice(0, 15), hottest };
}

function findPlayerIdSafe(eventName, nameIndex) {
  if (!eventName || !nameIndex) {
    return null;
  }

  return nameIndex.get(flipEventName(eventName)) || null;
}

function StreaksPage() {
  const [schedule, setSchedule] = useState([]);
  const [eventsByGame, setEventsByGame] = useState({});
  const [players, setPlayers] = useState([]);
  const [nameIndex, setNameIndex] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [games, events, skaterRows] = await Promise.all([
          loadSchedule(),
          loadGameEvents(),
          loadPlayerStats(),
        ]);

        if (!cancelled) {
          setSchedule(games);
          setEventsByGame(events);
          setPlayers(skaterRows);
          setNameIndex(buildPlayerNameIndex(skaterRows));
        }
      } catch (err) {
        if (!cancelled) {
          setError("Could not load streaks right now.");
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

  const teamStreaks = useMemo(() => computeTeamStreaks(schedule), [schedule]);

  const { streaks, hottest } = useMemo(
    () => computePointStreaks(schedule, eventsByGame, players, nameIndex),
    [schedule, eventsByGame, players, nameIndex]
  );

  return (
    <>
      <section className="page-title">
        <p className="home-dateline">QMJHL 2026&ndash;27</p>
        <h2>Streaks</h2>
        <p>Who&apos;s hot and who&apos;s not around the league.</p>
      </section>

      {loading && <p className="home-status">Loading streaks&hellip;</p>}
      {!loading && error && <p className="home-status">{error}</p>}

      {!loading && !error && (
        <>
          <section className="streaks-card">
            <h3>Team Streaks</h3>
            <div className="streaks-grid">
              {teamStreaks.map((team) => (
                <div
                  key={team.code}
                  className={`streak-chip ${team.won ? "streak-win" : "streak-loss"}`}
                >
                  <span className="streak-team">{teamAbbr(team.code)}</span>
                  <span className="streak-count">
                    {team.won ? "W" : "L"}
                    {team.count}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="streaks-card">
            <h3>Active Point Streaks</h3>
            {streaks.length === 0 ? (
              <p className="home-status">
                No active 3+ game point streaks in tracked games.
              </p>
            ) : (
              <div className="table-scroll">
                <table className="streaks-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Team</th>
                      <th>Streak</th>
                      <th>PTS in streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {streaks.map((skater) => (
                      <tr
                        key={skater.id}
                        className="team-row-subtle"
                        style={{
                          "--team-color":
                            findTeamByFeedCode(skater.teamCode)?.primary ||
                            "transparent",
                        }}
                      >
                        <td>
                          <PlayerLink playerId={skater.id} name={skater.name} />
                        </td>
                        <td>{teamAbbr(skater.teamCode)}</td>
                        <td>
                          <strong>{skater.streak} games</strong>
                        </td>
                        <td>{skater.streakPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="player-gamelog-note">
              Based on tracked scoring events from the last 14 days.
            </p>
          </section>

          <section className="streaks-card">
            <h3>Hottest Skaters &mdash; Last 14 Days</h3>
            {hottest.length === 0 ? (
              <p className="home-status">No scoring data in the window.</p>
            ) : (
              <div className="table-scroll">
                <table className="streaks-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
                      <th>Team</th>
                      <th>PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hottest.map((skater, index) => (
                      <tr
                        key={skater.id}
                        className="team-row-subtle"
                        style={{
                          "--team-color":
                            findTeamByFeedCode(skater.teamCode)?.primary ||
                            "transparent",
                        }}
                      >
                        <td>{index + 1}</td>
                        <td>
                          <PlayerLink playerId={skater.id} name={skater.name} />
                        </td>
                        <td>{teamAbbr(skater.teamCode)}</td>
                        <td>
                          <strong>{skater.totalPoints}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

export default StreaksPage;
