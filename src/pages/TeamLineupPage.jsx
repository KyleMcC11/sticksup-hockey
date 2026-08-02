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
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[’']/g, "")
    .replace(/-/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getPlayerName(player) {
  if (typeof player === "string") {
    return player.trim();
  }

  return player?.name?.trim() || "";
}

function getPlayerNumber(player) {
  if (typeof player === "string") {
    return null;
  }

  return player?.number ?? player?.jerseyNumber ?? null;
}

function convertCsvPlayer(player, preferredName = null) {
  return {
    id: player.id,
    name: preferredName || player.name,
    number: player.jerseyNumber ?? "--",
    position: player.position || "",
    gamesPlayed: Number(player.gamesPlayed) || 0,
    goals: Number(player.goals) || 0,
    assists: Number(player.assists) || 0,
    points: Number(player.points) || 0,
    pointsPerGame: Number(player.pointsPerGame) || 0,
    plusMinus: Number(player.plusMinus) || 0,
    shots: Number(player.shots) || 0,
    matched: true,
  };
}

function attachPlayerStats(lineupPlayer, teamStats) {
  const lineupName = getPlayerName(lineupPlayer);
  const normalizedLineupName = normalizeName(lineupName);

  const matchedPlayer = teamStats.find((statsPlayer) => {
    return normalizeName(statsPlayer.name) === normalizedLineupName;
  });

  if (!matchedPlayer) {
    console.warn(`No CSV match found for: ${lineupName}`);

    return {
      id: `unmatched-${normalizedLineupName}`,
      name: lineupName,
      number: getPlayerNumber(lineupPlayer) ?? "--",
      position: "",
      gamesPlayed: 0,
      goals: 0,
      assists: 0,
      points: 0,
      matched: false,
    };
  }

  return {
    ...convertCsvPlayer(matchedPlayer, lineupName),

    number:
      matchedPlayer.jerseyNumber ??
      getPlayerNumber(lineupPlayer) ??
      "--",
  };
}

function attachStatsToRows(
  rows,
  teamStats,
  maximumRows,
  playersPerRow
) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .slice(0, maximumRows)
    .map((row) => {
      if (!Array.isArray(row)) {
        return [];
      }

      return row
        .slice(0, playersPerRow)
        .map((player) => {
          return attachPlayerStats(player, teamStats);
        });
    })
    .filter((row) => row.length > 0);
}

function getManualGoalies(lineupTeam) {
  if (Array.isArray(lineupTeam.goalies)) {
    return lineupTeam.goalies.slice(0, 2);
  }

  if (
    lineupTeam.goalie &&
    lineupTeam.goalie.trim() !== "" &&
    lineupTeam.goalie.trim().toUpperCase() !== "TBD"
  ) {
    return [
      {
        name: lineupTeam.goalie,
        number: lineupTeam.goalieNumber ?? null,
      },
    ];
  }

  return [];
}

function buildGoalieList(lineupTeam, teamStats) {
  const manualGoalies = getManualGoalies(lineupTeam);

  const goalieResults = manualGoalies.map((goalie) => {
    return {
      ...attachPlayerStats(goalie, teamStats),
      position: "G",
    };
  });

  const usedGoalieNames = new Set(
    goalieResults.map((goalie) => {
      return normalizeName(goalie.name);
    })
  );

  const csvGoalies = teamStats
    .filter((player) => {
      return (
        String(player.position).toUpperCase() === "G" &&
        !usedGoalieNames.has(normalizeName(player.name))
      );
    })
    .sort((goalieA, goalieB) => {
      return goalieB.gamesPlayed - goalieA.gamesPlayed;
    });

  for (const goalie of csvGoalies) {
    if (goalieResults.length >= 2) {
      break;
    }

    goalieResults.push({
      ...convertCsvPlayer(goalie),
      position: "G",
    });
  }

  return goalieResults.slice(0, 2);
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
      setDisplayTeam(null);
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

        // Exactly three forward lines with three players each.
        const forwardsWithStats = attachStatsToRows(
          lineupTeam.forwards,
          teamStats,
          3,
          3
        );

        // Exactly three defence pairs with two players each.
        const defenseWithStats = attachStatsToRows(
          lineupTeam.defense,
          teamStats,
          3,
          2
        );

        // Manual goalie first, then fill from the CSV up to two.
        const goaliesWithStats = buildGoalieList(
          lineupTeam,
          teamStats
        );

        const unmatchedPlayers = [
          ...forwardsWithStats.flat(),
          ...defenseWithStats.flat(),
          ...goaliesWithStats,
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
          goalies: goaliesWithStats,
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

            <h2>
              {lineupTeam.team || lineupTeam.fullName}
            </h2>

            <p>Loading player statistics...</p>
          </div>
        </section>

        <Link className="back-link" to="/lineups">
          ← Back to all teams
        </Link>
      </>
    );
  }

  if (errorMessage || !displayTeam) {
    return (
      <>
        <section className="page-title">
          <p className="section-label">Lineup Error</p>

          <h2>
            {lineupTeam.team || lineupTeam.fullName}
          </h2>

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

          <h2>
            {displayTeam.team || displayTeam.fullName}
          </h2>

          <p>
            Three forward lines, three defence pairs and up to two
            goaltenders.
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