import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { teams } from "../data/teams.js";
import loadSchedule from "../data/loadSchedule.js";

function logoUrl(logo) {
  if (!logo) {
    return "";
  }

  const cleanPath = String(logo).replace(/^\/+/, "");

  return `${import.meta.env.BASE_URL}${cleanPath}`;
}

function formatDay(date) {
  return date.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function TeamMark({ team }) {
  if (!team) {
    return null;
  }

  return (
    <span className="scores-team">
      {logoUrl(team.logo) && (
        <img src={logoUrl(team.logo)} alt={`${team.fullName} logo`} />
      )}
      <span>{team.abbreviation}</span>
    </span>
  );
}

function GameCard({ game, showDate }) {
  const content = (
    <>
      <div className="scores-game-main">
        {showDate && (
          <span className="scores-game-date">
            {formatDay(game.date)}
            {game.timeLabel && (
              <span className="scores-game-time"> · {game.timeLabel}</span>
            )}
          </span>
        )}

        <span className="scores-game-matchup">
          <TeamMark team={game.awayTeam} />
          <span className="scores-game-score">
            {game.isFinal ? (
              <>
                <strong>{game.awayScore}</strong>
                <span className="scores-game-dash">&ndash;</span>
                <strong>{game.homeScore}</strong>
              </>
            ) : (
              <span className="scores-game-vs">at</span>
            )}
          </span>
          <TeamMark team={game.homeTeam} />
        </span>

        {game.venue && (
          <span className="scores-game-venue">{game.venue}</span>
        )}
      </div>

      {game.isFinal && (
        <span className="scores-game-link">Box score &rarr;</span>
      )}
    </>
  );

  if (game.isFinal) {
    return (
      <Link className="scores-game" to={`/game/${game.id}`}>
        {content}
      </Link>
    );
  }

  return <div className="scores-game">{content}</div>;
}

function ScoresPage() {
  const [games, setGames] = useState([]);
  const [teamFilter, setTeamFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let pageIsActive = true;

    async function load() {
      try {
        setLoading(true);
        setErrorMessage("");

        const rows = await loadSchedule();

        if (pageIsActive) {
          setGames(rows);
        }
      } catch (error) {
        console.error(error);

        if (pageIsActive) {
          setErrorMessage(
            "The schedule could not be loaded. Please try again later."
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
  }, []);

  const filteredGames = useMemo(() => {
    if (teamFilter === "all") {
      return games;
    }

    return games.filter((game) => {
      return (
        game.awayTeam?.slug === teamFilter || game.homeTeam?.slug === teamFilter
      );
    });
  }, [games, teamFilter]);

  const { upcoming, finalsByDay } = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const upcomingGames = filteredGames.filter(
      (game) => !game.isFinal && game.date >= todayStart
    );

    const finals = filteredGames
      .filter((game) => game.isFinal)
      .slice()
      .reverse();

    const grouped = [];
    const byDay = new Map();

    finals.forEach((game) => {
      const dayKey = game.date.toISOString().slice(0, 10);

      if (!byDay.has(dayKey)) {
        byDay.set(dayKey, { date: game.date, games: [] });
        grouped.push(byDay.get(dayKey));
      }

      byDay.get(dayKey).games.push(game);
    });

    return { upcoming: upcomingGames, finalsByDay: grouped.slice(0, 14) };
  }, [filteredGames]);

  return (
    <>
      <section className="page-title">
        <p className="section-label">QMJHL &middot; 2026&ndash;27</p>
        <h2>Scores &amp; Schedule</h2>
        <p>
          Every QMJHL game this season: final scores with full scoring
          summaries, plus upcoming matchups and venues. Refreshed every
          morning from official league data.
        </p>
      </section>

      <section className="standings-controls">
        <div>
          <label>Team</label>
          <select
            value={teamFilter}
            onChange={(event) => setTeamFilter(event.target.value)}
          >
            <option value="all">All Teams</option>
            {teams.map((team) => (
              <option value={team.slug} key={team.slug}>
                {team.fullName}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading && <p className="loading-note">Loading the schedule&hellip;</p>}

      {errorMessage && <p className="error-note">{errorMessage}</p>}

      {!loading && !errorMessage && (
        <>
          <section className="scores-section">
            <h3>Upcoming Games</h3>

            {upcoming.length === 0 && (
              <p className="scores-empty">
                No upcoming games on the schedule.
              </p>
            )}

            {upcoming.slice(0, 12).map((game) => (
              <GameCard key={game.id} game={game} showDate />
            ))}
          </section>

          <section className="scores-section">
            <h3>Recent Finals</h3>

            {finalsByDay.length === 0 && (
              <p className="scores-empty">No final scores yet.</p>
            )}

            {finalsByDay.map((day) => (
              <div key={day.date.toISOString()} className="scores-day">
                <h4>{formatDay(day.date)}</h4>
                {day.games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ))}
          </section>
        </>
      )}
    </>
  );
}

export default ScoresPage;
