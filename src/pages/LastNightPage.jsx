import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import loadSchedule from "../data/loadSchedule.js";
import loadGameEvents from "../data/loadGameEvents.js";
import loadPlayerStats from "../data/loadPlayerStats.js";
import {
  buildPlayerNameIndex,
  findPlayerId,
} from "../data/playerNames.js";
import PlayerLink from "../components/PlayerLink.jsx";
import { findTeamByFeedCode } from "../data/teamCodes.js";

function formatDayLabel(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function TeamMark({ code }) {
  const team = findTeamByFeedCode(code);

  if (!team) {
    return <span className="lastnight-team">{code}</span>;
  }

  const logo = team.logo
    ? `${import.meta.env.BASE_URL}${String(team.logo).replace(/^\/+/, "")}`
    : "";

  return (
    <span className="lastnight-team">
      {logo && <img src={logo} alt={`${team.fullName} logo`} />}
      <span>{team.abbreviation}</span>
    </span>
  );
}

// Top three point-getters from a game's scoring events.
function pickStars(events, nameIndex) {
  const tally = new Map();

  for (const event of events || []) {
    if (event.kind !== "goal") {
      continue;
    }

    const entries = [
      { name: event.scorer, goals: 1, assists: 0 },
      { name: event.assist1, goals: 0, assists: 1 },
      { name: event.assist2, goals: 0, assists: 1 },
    ];

    for (const entry of entries) {
      if (!entry.name) {
        continue;
      }

      const key = entry.name;
      const current = tally.get(key) || {
        name: entry.name,
        goals: 0,
        assists: 0,
        playerId: findPlayerId(entry.name, nameIndex),
      };

      current.goals += entry.goals;
      current.assists += entry.assists;
      tally.set(key, current);
    }
  }

  return [...tally.values()]
    .map((star) => ({ ...star, points: star.goals + star.assists }))
    .sort((a, b) => b.points - a.points || b.goals - a.goals)
    .slice(0, 3);
}

function LastNightPage() {
  const [schedule, setSchedule] = useState([]);
  const [eventsByGame, setEventsByGame] = useState({});
  const [nameIndex, setNameIndex] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [games, events, players] = await Promise.all([
          loadSchedule(),
          loadGameEvents(),
          loadPlayerStats(),
        ]);

        if (!cancelled) {
          setSchedule(games);
          setEventsByGame(events);
          setNameIndex(buildPlayerNameIndex(players));
        }
      } catch (err) {
        if (!cancelled) {
          setError("Could not load last night's games right now.");
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

  const { dateKey, games, isLastNight } = useMemo(() => {
    const finals = schedule.filter((game) => game.isFinal && game.date);

    if (finals.length === 0) {
      return { dateKey: "", games: [], isLastNight: false };
    }

    const keys = finals.map((game) =>
      game.date.toISOString().slice(0, 10)
    );
    const latest = keys.sort().reverse()[0];

    const nightGames = finals.filter(
      (game) => game.date.toISOString().slice(0, 10) === latest
    );

    const todayKey = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    return {
      dateKey: latest,
      games: nightGames,
      isLastNight: latest === yesterdayKey || latest === todayKey,
    };
  }, [schedule]);

  return (
    <>
      <section className="page-title">
        <p className="home-dateline">QMJHL 2026&ndash;27</p>
        <h2>Last Night in the Q</h2>
        <p>
          {loading
            ? "Loading…"
            : dateKey
              ? `${isLastNight ? "Last night" : "Most recent games"} — ${formatDayLabel(dateKey)}`
              : "No finals yet this season."}
        </p>
      </section>

      {loading && <p className="home-status">Loading last night&hellip;</p>}
      {!loading && error && <p className="home-status">{error}</p>}

      {!loading && !error && games.length > 0 && (
        <div className="lastnight-list">
          {games.map((game) => {
            const stars = pickStars(eventsByGame[game.id], nameIndex);
            const status = game.status.replace(/^final\s*/i, "").trim();

            return (
              <article key={game.id} className="lastnight-card">
                <div className="lastnight-main">
                  <div className="lastnight-matchup">
                    <TeamMark code={game.awayCode} />
                    <span className="lastnight-score">
                      <strong>{game.awayScore}</strong>
                      <span className="scores-game-dash">&ndash;</span>
                      <strong>{game.homeScore}</strong>
                    </span>
                    <TeamMark code={game.homeCode} />
                  </div>
                  <div className="lastnight-meta">
                    <span className="lastnight-status">
                      Final{status ? ` ${status}` : ""}
                    </span>
                    {game.venue && (
                      <span className="lastnight-venue">{game.venue}</span>
                    )}
                  </div>
                </div>

                {stars.length > 0 && (
                  <div className="lastnight-stars">
                    <h4>Three stars</h4>
                    <ol>
                      {stars.map((star, index) => (
                        <li key={`${star.name}-${index}`}>
                          <span className="lastnight-star-rank">
                            {index + 1}
                          </span>
                          <PlayerLink
                            playerId={star.playerId}
                            name={star.name}
                          />
                          <span className="lastnight-star-line">
                            {star.goals}G, {star.assists}A
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <Link className="lastnight-boxscore" to={`/game/${game.id}`}>
                  Box score &rarr;
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

export default LastNightPage;
