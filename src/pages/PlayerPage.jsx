import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import loadPlayerStats from "../data/loadPlayerStats.js";
import loadGoalieStats from "../data/loadGoalieStats.js";
import loadRosters from "../data/loadRosters.js";
import loadGameEvents from "../data/loadGameEvents.js";
import loadSchedule from "../data/loadSchedule.js";
import { flipEventName } from "../data/playerNames.js";
import { findTeamByFeedCode } from "../data/teamCodes.js";

function logoUrl(logo) {
  if (!logo) {
    return "";
  }

  return `${import.meta.env.BASE_URL}${String(logo).replace(/^\/+/, "")}`;
}

function flattenRosters(byTeam) {
  const players = [];

  for (const teamPlayers of Object.values(byTeam || {})) {
    players.push(...teamPlayers);
  }

  return players;
}

function formatDate(dateKey) {
  if (!dateKey) {
    return "";
  }

  const [year, month, day] = String(dateKey).split("-").map(Number);

  if (!year || !month || !day) {
    return String(dateKey);
  }

  return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

function StatChip({ label, value }) {
  return (
    <div className="player-stat-chip">
      <span className="player-stat-value">{value}</span>
      <span className="player-stat-label">{label}</span>
    </div>
  );
}

function PlayerPage() {
  const { playerId } = useParams();
  const [skaters, setSkaters] = useState([]);
  const [goalies, setGoalies] = useState([]);
  const [rosterPlayers, setRosterPlayers] = useState([]);
  const [eventsByGame, setEventsByGame] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [skaterRows, goalieRows, rosters, events, games] =
          await Promise.all([
            loadPlayerStats(),
            loadGoalieStats(),
            loadRosters(),
            loadGameEvents(),
            loadSchedule(),
          ]);

        if (!cancelled) {
          setSkaters(skaterRows);
          setGoalies(goalieRows);
          setRosterPlayers(flattenRosters(rosters));
          setEventsByGame(events);
          setSchedule(games);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Could not load this player right now.");
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

  const player = useMemo(() => {
    const id = String(playerId || "");
    const skater = skaters.find((p) => String(p.id) === id);

    if (skater) {
      return { ...skater, isGoalie: false };
    }

    const goalie = goalies.find((g) => String(g.id) === id);

    if (goalie) {
      return { ...goalie, isGoalie: true };
    }

    return null;
  }, [skaters, goalies, playerId]);

  const bio = useMemo(() => {
    if (!player) {
      return null;
    }

    return (
      rosterPlayers.find((p) => String(p.id) === String(player.id)) || null
    );
  }, [rosterPlayers, player]);

  const team = player ? findTeamByFeedCode(player.teamCode) : null;

  // Game log for skaters: every scoring event involving this player.
  const gameLog = useMemo(() => {
    if (!player || player.isGoalie) {
      return [];
    }

    const targetKey = flipEventName(player.name);
    const gamesById = new Map(schedule.map((game) => [String(game.id), game]));
    const log = [];

    for (const [gameId, events] of Object.entries(eventsByGame)) {
      const game = gamesById.get(String(gameId));
      const dateKey = game ? game.date.toISOString().slice(0, 10) : "";

      let goals = 0;
      let assists = 0;
      const notes = new Set();

      for (const event of events) {
        if (event.kind !== "goal") {
          continue;
        }

        const involved = [
          { name: event.scorer, role: "G" },
          { name: event.assist1, role: "A" },
          { name: event.assist2, role: "A" },
        ];

        for (const entry of involved) {
          if (!entry.name || flipEventName(entry.name) !== targetKey) {
            continue;
          }

          if (entry.role === "G") {
            goals += 1;
          } else {
            assists += 1;
          }

          if (event.isPP) notes.add("PP");
          if (event.isSH) notes.add("SH");
          if (event.isEN) notes.add("EN");
          if (event.isGW) notes.add("GWG");
        }
      }

      if (goals === 0 && assists === 0) {
        continue;
      }

      const homeCode = game ? game.homeCode : "";
      const awayCode = game ? game.awayCode : "";
      const isHome = player.teamCode && player.teamCode === homeCode;
      const rawOpponent = isHome ? awayCode : homeCode;
      const opponentTeam = findTeamByFeedCode(rawOpponent);
      const opponent = opponentTeam ? opponentTeam.abbreviation : rawOpponent;

      let result = "";
      if (game && game.isFinal) {
        const mine = isHome ? game.homeScore : game.awayScore;
        const theirs = isHome ? game.awayScore : game.homeScore;
        result = `${mine > theirs ? "W" : "L"} ${mine}-${theirs}`;
      }

      log.push({
        gameId,
        dateKey,
        opponent,
        atHome: isHome,
        result,
        goals,
        assists,
        points: goals + assists,
        notes: [...notes].join(", "),
      });
    }

    return log.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
  }, [player, eventsByGame, schedule]);

  return (
    <>
      {loading && <p className="home-status">Loading player&hellip;</p>}
      {!loading && error && <p className="home-status">{error}</p>}

      {!loading && !error && !player && (
        <p className="home-status">Player not found.</p>
      )}

      {!loading && !error && player && (
        <>
          <section className="player-hero">
            <div className="player-hero-main">
              {team && team.logo && (
                <img
                  className="player-team-logo"
                  src={logoUrl(team.logo)}
                  alt={`${team.fullName} logo`}
                />
              )}
              <div>
                <p className="home-dateline">
                  {team ? team.fullName : player.teamCode} &middot;{" "}
                  {player.position}
                  {bio?.jersey ? ` · #${bio.jersey}` : ""}
                </p>
                <h2>{player.name}</h2>
                {bio?.rookie && <span className="rookie-badge">Rookie</span>}
              </div>
            </div>

            <div className="player-bio-grid">
              {bio?.age && (
                <div>
                  <span>Age</span>
                  <strong>{bio.age}</strong>
                </div>
              )}
              {bio?.height && (
                <div>
                  <span>Height</span>
                  <strong>{bio.height}</strong>
                </div>
              )}
              {bio?.weight && (
                <div>
                  <span>Weight</span>
                  <strong>{bio.weight}</strong>
                </div>
              )}
              {bio?.shoots && (
                <div>
                  <span>{player.isGoalie ? "Catches" : "Shoots"}</span>
                  <strong>{bio.shoots}</strong>
                </div>
              )}
              {bio?.birthplace && (
                <div>
                  <span>Birthplace</span>
                  <strong>{bio.birthplace}</strong>
                </div>
              )}
              {team && (
                <div>
                  <span>Team</span>
                  <strong>
                    <Link to={`/lineups/${team.slug}`}>{team.abbreviation}</Link>
                  </strong>
                </div>
              )}
            </div>
          </section>

          <section className="player-stats-card">
            <h3>2026&ndash;27 Season</h3>
            {player.isGoalie ? (
              <div className="player-stat-row">
                <StatChip label="GP" value={player.gamesPlayed} />
                <StatChip label="W" value={player.wins} />
                <StatChip label="L" value={player.losses} />
                <StatChip label="OTL" value={player.otLosses} />
                <StatChip label="GAA" value={player.goalsAgainstAverage.toFixed(2)} />
                <StatChip
                  label="SV%"
                  value={
                    player.savePercentage > 0
                      ? player.savePercentage.toFixed(3).replace(/^0/, "")
                      : "—"
                  }
                />
                <StatChip label="SO" value={player.shutouts} />
              </div>
            ) : (
              <div className="player-stat-row">
                <StatChip label="GP" value={player.gamesPlayed} />
                <StatChip label="G" value={player.goals} />
                <StatChip label="A" value={player.assists} />
                <StatChip label="PTS" value={player.points} />
                <StatChip label="+/-" value={player.plusMinus} />
                <StatChip label="PIM" value={player.penaltyMinutes} />
                <StatChip label="PPG" value={player.powerPlayGoals} />
                <StatChip label="SHG" value={player.shortHandedGoals} />
                <StatChip label="GWG" value={player.gameWinningGoals} />
              </div>
            )}
          </section>

          {!player.isGoalie && (
            <section className="player-gamelog-card">
              <h3>Game Log</h3>
              {gameLog.length === 0 ? (
                <p className="home-status">
                  No tracked scoring games in the last 14 days.
                </p>
              ) : (
                <div className="table-scroll">
                  <table className="player-gamelog-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Opp</th>
                        <th>Result</th>
                        <th>G</th>
                        <th>A</th>
                        <th>PTS</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gameLog.map((game) => (
                        <tr key={game.gameId}>
                          <td>{formatDate(game.dateKey)}</td>
                          <td>
                            {game.atHome ? "vs " : "@ "}
                            {game.opponent}
                          </td>
                          <td>{game.result}</td>
                          <td>{game.goals}</td>
                          <td>{game.assists}</td>
                          <td>
                            <strong>{game.points}</strong>
                          </td>
                          <td>{game.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="player-gamelog-note">
                Scoring events are tracked for the last 14 days.
              </p>
            </section>
          )}
        </>
      )}
    </>
  );
}

export default PlayerPage;
