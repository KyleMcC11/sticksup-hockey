import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { teams } from "../data/teams.js";
import loadPlayerStats from "../data/loadPlayerStats.js";
import loadGoalieStats from "../data/loadGoalieStats.js";
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

function positionOf(player) {
  return String(player.position || "").toUpperCase();
}

function byPointsDesc(playerA, playerB) {
  return (
    playerB.points - playerA.points ||
    playerB.gamesPlayed - playerA.gamesPlayed
  );
}

function toLineupSkater(player) {
  return {
    id: player.id,
    name: player.name,
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

function toLineupGoalie(goalie) {
  return {
    id: goalie.id,
    name: goalie.name,
    number: goalie.jerseyNumber ?? "--",
    position: "G",
    gamesPlayed: Number(goalie.gamesPlayed) || 0,
    wins: Number(goalie.wins) || 0,
    losses: Number(goalie.losses) || 0,
    otLosses: Number(goalie.otLosses) || 0,
    shutouts: Number(goalie.shutouts) || 0,
    savePercentage: Number(goalie.savePercentage) || 0,
    goalsAgainstAverage: Number(goalie.goalsAgainstAverage) || 0,
    matched: true,
  };
}

// Lines are projected from scoring: each line gets the best available
// left winger, center and right winger. Falls back to best remaining
// forward when a position group runs short.
function buildForwardLines(teamSkaters) {
  const forwards = teamSkaters.filter((player) => {
    return positionOf(player) !== "D";
  });

  const sorted = [...forwards].sort(byPointsDesc);
  const centers = sorted.filter((player) => positionOf(player) === "C");
  const leftWingers = sorted.filter((player) => positionOf(player) === "LW");
  const rightWingers = sorted.filter((player) => positionOf(player) === "RW");

  const usedIds = new Set();

  const takeFrom = (group) => {
    const player = group.find((candidate) => !usedIds.has(candidate.id));

    if (player) {
      usedIds.add(player.id);
    }

    return player || null;
  };

  const takeAnyForward = () => takeFrom(sorted);

  const lines = [];

  for (let lineIndex = 0; lineIndex < 3; lineIndex++) {
    const line = [
      takeFrom(leftWingers) || takeAnyForward(),
      takeFrom(centers) || takeAnyForward(),
      takeFrom(rightWingers) || takeAnyForward(),
    ].filter(Boolean);

    if (line.length > 0) {
      lines.push(line.map(toLineupSkater));
    }
  }

  return lines;
}

function buildDefensePairs(teamSkaters) {
  const defense = teamSkaters
    .filter((player) => positionOf(player) === "D")
    .sort(byPointsDesc);

  const pairs = [];

  for (let i = 0; i < defense.length && pairs.length < 3; i += 2) {
    pairs.push(defense.slice(i, i + 2).map(toLineupSkater));
  }

  return pairs;
}

// Top two goalies by games played — the best proxy for the starter.
function buildGoalieList(teamGoalies) {
  return [...teamGoalies]
    .sort((goalieA, goalieB) => {
      return (
        goalieB.gamesPlayed - goalieA.gamesPlayed ||
        goalieB.wins - goalieA.wins
      );
    })
    .slice(0, 2)
    .map(toLineupGoalie);
}

function TeamLineupPage() {
  const { teamSlug } = useParams();

  const team = teams.find((candidate) => {
    return candidate.slug === teamSlug;
  });

  const [displayTeam, setDisplayTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let pageIsActive = true;

    if (!team) {
      setDisplayTeam(null);
      setLoading(false);
      return undefined;
    }

    async function prepareLineup() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [allSkaters, allGoalies] = await Promise.all([
          loadPlayerStats(),
          loadGoalieStats(),
        ]);

        if (!pageIsActive) {
          return;
        }

        const statsCode = TEAM_STATS_CODES[team.slug];

        const teamSkaters = allSkaters.filter((player) => {
          return player.teamCode === statsCode;
        });

        const teamGoalies = allGoalies.filter((goalie) => {
          return goalie.teamCode === statsCode;
        });

        setDisplayTeam({
          ...team,
          forwards: buildForwardLines(teamSkaters),
          defense: buildDefensePairs(teamSkaters),
          goalies: buildGoalieList(teamGoalies),
          status: "Projected",
        });
      } catch (error) {
        console.error(error);

        if (pageIsActive) {
          setErrorMessage(
            "The lineup was found, but the statistics could not be loaded."
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
  }, [team]);

  if (!team) {
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
            "--primary": team.primary,
            "--secondary": team.secondary,
          }}
        >
          <div>
            <p className="section-label">Team Lineup</p>

            <h2>
              {team.team || team.fullName}
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
            {team.team || team.fullName}
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
            Projected from the latest scoring stats: three forward
            lines, three defence pairs and up to two goaltenders.
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
