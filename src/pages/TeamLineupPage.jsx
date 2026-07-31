import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { teams } from "../data/teams.js";
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

function sortPlayers(playerA, playerB) {
  if (playerB.points !== playerA.points) {
    return playerB.points - playerA.points;
  }

  if (playerB.gamesPlayed !== playerA.gamesPlayed) {
    return playerB.gamesPlayed - playerA.gamesPlayed;
  }

  return playerA.name.localeCompare(playerB.name);
}

function convertPlayer(player) {
  return {
    id: player.id,
    name: player.name,
    number: player.jerseyNumber ?? "--",
    position: player.position,
    gamesPlayed: player.gamesPlayed,
    goals: player.goals,
    assists: player.assists,
    points: player.points,
  };
}

function buildForwardLines(teamPlayers) {
  const remainingPlayers = teamPlayers
    .filter((player) => {
      return (
        player.position === "LW" ||
        player.position === "C" ||
        player.position === "RW"
      );
    })
    .sort(sortPlayers);

  function takeExactPosition(position) {
    const playerIndex = remainingPlayers.findIndex(
      (player) => player.position === position
    );

    if (playerIndex === -1) {
      return null;
    }

    return remainingPlayers.splice(playerIndex, 1)[0];
  }

  const forwardLines = [];

  for (let lineNumber = 0; lineNumber < 4; lineNumber++) {
    forwardLines.push([
      takeExactPosition("LW"),
      takeExactPosition("C"),
      takeExactPosition("RW"),
    ]);
  }

  for (const line of forwardLines) {
    for (let positionIndex = 0; positionIndex < line.length; positionIndex++) {
      if (!line[positionIndex] && remainingPlayers.length > 0) {
        line[positionIndex] = remainingPlayers.shift();
      }
    }
  }

  const completedLines = forwardLines
    .map((line) => {
      return line
        .filter((player) => player !== null)
        .map(convertPlayer);
    })
    .filter((line) => line.length > 0);

  return {
    lines: completedLines,
    additionalPlayers: remainingPlayers.map(convertPlayer),
  };
}

function buildDefensePairs(teamPlayers) {
  const defensePlayers = teamPlayers
    .filter((player) => player.position === "D")
    .sort(sortPlayers);

  const activeDefense = defensePlayers.slice(0, 6);
  const defensePairs = [];

  for (let index = 0; index < activeDefense.length; index += 2) {
    defensePairs.push(
      activeDefense.slice(index, index + 2).map(convertPlayer)
    );
  }

  return {
    pairs: defensePairs,
    additionalPlayers: defensePlayers.slice(6).map(convertPlayer),
  };
}

function findGoalies(teamPlayers) {
  const goalies = teamPlayers
    .filter((player) => player.position === "G")
    .sort((goalieA, goalieB) => {
      return goalieB.gamesPlayed - goalieA.gamesPlayed;
    });

  return {
    starter: goalies.length > 0 ? convertPlayer(goalies[0]) : null,
    additionalPlayers: goalies.slice(1).map(convertPlayer),
  };
}

function TeamLineupPage() {
  const { teamSlug } = useParams();

  const team = teams.find((currentTeam) => {
    return currentTeam.slug === teamSlug;
  });

  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let pageIsActive = true;

    if (!team) {
      setLoading(false);
      return undefined;
    }

    const statsCode = TEAM_STATS_CODES[team.slug];

    setLoading(true);
    setErrorMessage("");

    loadPlayerStats()
      .then((allPlayers) => {
        if (!pageIsActive) {
          return;
        }

        const matchingPlayers = allPlayers.filter((player) => {
          return player.teamCode === statsCode;
        });

        setTeamPlayers(matchingPlayers);
      })
      .catch((error) => {
        console.error(error);

        if (pageIsActive) {
          setErrorMessage(
            "The player statistics file could not be loaded."
          );
        }
      })
      .finally(() => {
        if (pageIsActive) {
          setLoading(false);
        }
      });

    return () => {
      pageIsActive = false;
    };
  }, [teamSlug, team]);

  if (!team) {
    return (
      <>
        <section className="page-title">
          <p className="section-label">Roster Not Found</p>
          <h2>Team not found</h2>
          <p>The requested QMJHL team could not be found.</p>
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
            "--primary": team.primary,
            "--secondary": team.secondary,
          }}
        >
          <div>
            <p className="section-label">QMJHL Roster</p>
            <h2>{team.fullName}</h2>
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
          <p className="section-label">Roster Error</p>
          <h2>{team.fullName}</h2>
          <p>{errorMessage}</p>
        </section>

        <Link className="back-link" to="/lineups">
          ← Back to all teams
        </Link>
      </>
    );
  }

  if (teamPlayers.length === 0) {
    return (
      <>
        <section className="page-title">
          <p className="section-label">Roster Unavailable</p>
          <h2>{team.fullName}</h2>

          <p>
            No players in the CSV matched this team’s statistics code.
          </p>
        </section>

        <Link className="back-link" to="/lineups">
          ← Back to all teams
        </Link>
      </>
    );
  }

  const forwardResults = buildForwardLines(teamPlayers);
  const defenseResults = buildDefensePairs(teamPlayers);
  const goalieResults = findGoalies(teamPlayers);

  const additionalPlayers = [
    ...forwardResults.additionalPlayers,
    ...defenseResults.additionalPlayers,
    ...goalieResults.additionalPlayers,
  ];

  const lineupTeam = {
    ...team,
    team: team.fullName,
    status: "Stat-based roster",
    goalie: goalieResults.starter
      ? `${goalieResults.starter.name} #${goalieResults.starter.number}`
      : "No goalie listed",

    forwards: forwardResults.lines,
    defense: defenseResults.pairs,
    additionalPlayers,
  };

  return (
    <>
      <section
        className="lineup-page-header no-logo"
        style={{
          "--primary": team.primary,
          "--secondary": team.secondary,
        }}
      >
        <div>
          <p className="section-label">QMJHL Roster</p>
          <h2>{team.fullName}</h2>

          <p>
            Players are loaded from the CSV file. Lines are projected using
            player positions and point totals and are not official team lines.
          </p>
        </div>
      </section>

      <Link className="back-link" to="/lineups">
        ← Back to all teams
      </Link>

      <section className="single-lineup-page">
        <LineupCard team={lineupTeam} />
      </section>
    </>
  );
}

export default TeamLineupPage;