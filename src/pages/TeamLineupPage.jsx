import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { lineupTeams } from "../data/lineups.js";
import loadPlayerStats from "../data/loadPlayerStats.js";
import LineupCard from "../components/LineupCard.jsx";

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

function normalizeName(name) {
  if (!name) {
    return "";
  }

  return String(name)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[-]/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getLineupPlayerName(player) {
  if (typeof player === "string") {
    return player.trim();
  }

  return player.name?.trim() || "";
}

function getLineupPlayerNumber(player) {
  if (typeof player === "string") {
    return null;
  }

  return player.number ?? null;
}

function attachPlayerStats(lineupPlayer, teamStats) {
  const lineupName = getLineupPlayerName(lineupPlayer);
  const normalizedLineupName = normalizeName(lineupName);

  const matchedPlayer = teamStats.find((statsPlayer) => {
    return normalizeName(statsPlayer.name) === normalizedLineupName;
  });

  if (!matchedPlayer) {
    console.warn(`No CSV match found for: ${lineupName}`);

    return {
      id: `unmatched-${normalizedLineupName}`,
      name: lineupName,
      number: getLineupPlayerNumber(lineupPlayer) ?? "--",
      position: "",
      gamesPlayed: 0,
      goals: 0,
      assists: 0,
      points: 0,
      matched: false,
    };
  }

  return {
    id: matchedPlayer.id,
    name: lineupName,
    number:
      matchedPlayer.jerseyNumber ??
      getLineupPlayerNumber(lineupPlayer) ??
      "--",

    position: matchedPlayer.position,
    gamesPlayed: matchedPlayer.gamesPlayed,
    goals: matchedPlayer.goals,
    assists: matchedPlayer.assists,
    points: matchedPlayer.points,
    pointsPerGame: matchedPlayer.pointsPerGame,
    plusMinus: matchedPlayer.plusMinus,
    shots: matchedPlayer.shots,
    shootingPercentage: matchedPlayer.shootingPercentage,
    penaltyMinutes: matchedPlayer.penaltyMinutes,
    powerPlayGoals: matchedPlayer.powerPlayGoals,
    powerPlayAssists: matchedPlayer.powerPlayAssists,
    shortHandedGoals: matchedPlayer.shortHandedGoals,
    shortHandedAssists: matchedPlayer.shortHandedAssists,
    gameWinningGoals: matchedPlayer.gameWinningGoals,
    rookie: matchedPlayer.rookie,
    season: matchedPlayer.season,
    matched: true,
  };
}

function attachStatsToRows(rows, teamStats) {
  return rows.map((row) => {
    return row.map((player) => {
      return attachPlayerStats(player, teamStats);
    });
  });
}

function TeamLineupPage() {
  const { teamSlug } = useParams();

  const lineupTeam = lineupTeams.find((team) => {
    return team.slug === teamSlug;
  });

  const [displayTeam, setDisplayTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let pageIsActive = true;

    if (!lineupTeam) {
      setLoading(false);
      return undefined;
    }

    async function prepareLineup() {
      try {
        setLoading(true);
        setErrorMessage("");

        const allPlayers = await loadPlayerStats();

        if (!pageIsActive) {
          return;
        }

        const statsCode = TEAM_STATS_CODES[lineupTeam.slug];

        const teamStats = allPlayers.filter((player) => {
          return player.teamCode === statsCode;
        });

        const forwardsWithStats = attachStatsToRows(
          lineupTeam.forwards || [],
          teamStats
        );

        const defenseWithStats = attachStatsToRows(
          lineupTeam.defense || [],
          teamStats
        );

        const unmatchedPlayers = [
          ...forwardsWithStats.flat(),
          ...defenseWithStats.flat(),
        ].filter((player) => !player.matched);

        if (unmatchedPlayers.length > 0) {
          console.warn(
            "Players not matched to the CSV:",
            unmatchedPlayers.map((player) => player.name)
          );
        }

        setDisplayTeam({
          ...lineupTeam,
          forwards: forwardsWithStats,
          defense: defenseWithStats,
          status: lineupTeam.status || "Projected",
          unmatchedPlayers,
        });
      } catch (error) {
        console.error(error);

        if (pageIsActive) {
          setErrorMessage(
            "The lineup was found, but the CSV statistics could not be loaded."
          );
        }
      } finally {
        if (pageIsActive) {
          setLoading(false);
        }
      }
    }

    prepareLineup();

    return () => {
      pageIsActive = false;
    };
  }, [lineupTeam]);

  if (!lineupTeam) {
    return (
      <>
        <section className="page-title">
          <p className="section-label">Lineup Not Found</p>
          <h2>Team not found</h2>
          <p>This team does not have a lineup available yet.</p>
        </section>

        <Link className="back-link" to="/lineups">
          ← Back to all teams
        </Link>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <section
          className="lineup-page-header no-logo"
          style={{
            "--primary": lineupTeam.primary,
            "--secondary": lineupTeam.secondary,
          }}
        >
          <div>
            <p className="section-label">Team Lineup</p>
            <h2>{lineupTeam.team || lineupTeam.fullName}</h2>
            <p>Loading player statistics...</p>
          </div>
        </section>

        <Link className="back-link" to="/lineups">
          ← Back to all teams
        </Link>
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
        <section className="page-title">
          <p className="section-label">Lineup Error</p>
          <h2>{lineupTeam.team || lineupTeam.fullName}</h2>
          <p>{errorMessage}</p>
        </section>

        <Link className="back-link" to="/lineups">
          ← Back to all teams
        </Link>
      </>
    );
  }

  return (
    <>
      <section
        className="lineup-page-header no-logo"
        style={{
          "--primary": displayTeam.primary,
          "--secondary": displayTeam.secondary,
        }}
      >
        <div>
          <p className="section-label">Team Lineup</p>
          <h2>{displayTeam.team || displayTeam.fullName}</h2>

          <p>
            Line combinations are set manually. Player statistics are loaded
            from the CSV file.
          </p>
        </div>
      </section>

      <Link className="back-link" to="/lineups">
        ← Back to all teams
      </Link>

      <section className="single-lineup-page">
        <LineupCard team={displayTeam} />
      </section>
    </>
  );
}

export default TeamLineupPage;