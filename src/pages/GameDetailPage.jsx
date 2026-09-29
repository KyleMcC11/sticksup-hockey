import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import loadSchedule from "../data/loadSchedule.js";
import loadGameEvents from "../data/loadGameEvents.js";
import { findTeamByFeedCode } from "../data/teamCodes.js";

function logoUrl(logo) {
  if (!logo) {
    return "";
  }

  const cleanPath = String(logo).replace(/^\/+/, "");

  return `${import.meta.env.BASE_URL}${cleanPath}`;
}

function ordinalPeriod(period) {
  if (period === 4) return "OT";
  if (period > 4) return `${period - 3}OT`;
  return `${period}${period === 1 ? "st" : period === 2 ? "nd" : "rd"}`;
}

function GoalRow({ event, homeTeam, awayTeam }) {
  const team = findTeamByFeedCode(event.teamCode);
  const assists = [event.assist1, event.assist2].filter(Boolean).join(", ");

  return (
    <li className="game-event">
      <span className="game-event-time">
        {ordinalPeriod(event.period)} · {event.time}
      </span>

      <span className="game-event-team">
        {team && logoUrl(team.logo) && (
          <img src={logoUrl(team.logo)} alt={`${team.fullName} logo`} />
        )}
        <strong>{event.scorer}</strong>
        {assists && <span className="game-event-assists"> ({assists})</span>}
      </span>

      <span className="game-event-badges">
        {event.badges.map((badge) => (
          <span className="game-badge" key={badge}>
            {badge}
          </span>
        ))}
      </span>

      <span className="game-event-score">
        {awayTeam?.abbreviation} {event.scoreAway} – {event.scoreHome}{" "}
        {homeTeam?.abbreviation}
      </span>
    </li>
  );
}

function PenaltyRow({ event }) {
  const team = findTeamByFeedCode(event.teamCode);

  return (
    <li className="game-event">
      <span className="game-event-time">
        {ordinalPeriod(event.period)} · {event.time}
      </span>

      <span className="game-event-team">
        {team && logoUrl(team.logo) && (
          <img src={logoUrl(team.logo)} alt={`${team.fullName} logo`} />
        )}
        <strong>{event.penalizedPlayer}</strong>
        <span className="game-event-assists">
          {" "}
          — {event.offence}
          {event.minutes > 0 && ` (${event.minutes} min)`}
        </span>
      </span>
    </li>
  );
}

function GameDetailPage() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let pageIsActive = true;

    async function load() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [schedule, eventsByGame] = await Promise.all([
          loadSchedule(),
          loadGameEvents(),
        ]);

        if (!pageIsActive) {
          return;
        }

        const found = schedule.find((item) => item.id === gameId);

        if (!found) {
          setErrorMessage("That game could not be found.");
        } else {
          setGame(found);
          setEvents(eventsByGame[gameId] || []);
        }
      } catch (error) {
        console.error(error);

        if (pageIsActive) {
          setErrorMessage(
            "The game details could not be loaded. Please try again later."
          );
        }
      } finally {
        if (pageIsActive) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      pageIsActive = false;
    };
  }, [gameId]);

  const { goals, penalties } = useMemo(() => {
    return {
      goals: events.filter((event) => event.kind === "goal"),
      penalties: events.filter((event) => event.kind === "penalty"),
    };
  }, [events]);

  if (loading) {
    return <p className="loading-note">Loading game details&hellip;</p>;
  }

  if (errorMessage || !game) {
    return (
      <>
        <Link className="back-link" to="/scores">
          &larr; Back to scores
        </Link>
        <p className="error-note">{errorMessage}</p>
      </>
    );
  }

  const gameDate = game.date.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Link className="back-link" to="/scores">
        &larr; Back to scores
      </Link>

      <section className="page-title game-title">
        <p className="section-label">
          {game.isFinal ? "Final" : "Scheduled"} &middot; {gameDate}
          {game.venue && ` · ${game.venue}`}
        </p>

        <div className="game-header">
          <div className="game-header-team">
            {game.awayTeam && logoUrl(game.awayTeam.logo) && (
              <img
                src={logoUrl(game.awayTeam.logo)}
                alt={`${game.awayTeam.fullName} logo`}
              />
            )}
            <h2>{game.awayTeam?.fullName || game.awayCode}</h2>
          </div>

          <div className="game-header-score">
            {game.isFinal ? (
              <>
                {game.awayScore} <span>&ndash;</span> {game.homeScore}
              </>
            ) : (
              <span className="game-header-vs">vs</span>
            )}
          </div>

          <div className="game-header-team">
            {game.homeTeam && logoUrl(game.homeTeam.logo) && (
              <img
                src={logoUrl(game.homeTeam.logo)}
                alt={`${game.homeTeam.fullName} logo`}
              />
            )}
            <h2>{game.homeTeam?.fullName || game.homeCode}</h2>
          </div>
        </div>
      </section>

      {events.length === 0 && game.isFinal && (
        <p className="scores-empty">
          The full scoring summary for this game is not available yet — it
          appears with the next morning refresh.
        </p>
      )}

      {goals.length > 0 && (
        <section className="scores-section">
          <h3>Scoring Summary</h3>
          <ul className="game-events">
            {goals.map((event, index) => (
              <GoalRow
                key={`${event.period}-${event.time}-${index}`}
                event={event}
                homeTeam={game.homeTeam}
                awayTeam={game.awayTeam}
              />
            ))}
          </ul>
        </section>
      )}

      {penalties.length > 0 && (
        <section className="scores-section">
          <h3>Penalties</h3>
          <ul className="game-events">
            {penalties.map((event, index) => (
              <PenaltyRow
                key={`${event.period}-${event.time}-${index}`}
                event={event}
              />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default GameDetailPage;
