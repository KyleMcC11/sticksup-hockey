import { teams } from "../data/teams.js";

function createFallbackNumber(name) {
  let total = 0;

  for (let index = 0; index < name.length; index++) {
    total += name.charCodeAt(index);
  }

  return (total % 88) + 1;
}

function getNumericStat(value) {
  const number = Number(value);

  if (Number.isFinite(number)) {
    return number;
  }

  return 0;
}

function getLogoPath(logo) {
  if (!logo) {
    return "";
  }

  if (
    logo.startsWith("http://") ||
    logo.startsWith("https://") ||
    logo.startsWith("data:")
  ) {
    return logo;
  }

  const cleanLogoPath = logo.replace(/^\/+/, "");

  return `${import.meta.env.BASE_URL}${cleanLogoPath}`;
}

function getFullTeamInformation(lineupTeam) {
  const matchingTeam = teams.find((team) => {
    return team.slug === lineupTeam.slug;
  });

  if (!matchingTeam) {
    return lineupTeam;
  }

  return {
    ...matchingTeam,
    ...lineupTeam,

    // Always use the logo path stored in teams.js.
    logo: matchingTeam.logo,

    // Keep the team colours from teams.js as the main source.
    primary: matchingTeam.primary,
    secondary: matchingTeam.secondary,
  };
}

function normalizePlayer(player, index, groupName) {
  if (typeof player === "string") {
    const name = player.trim();
    const number = createFallbackNumber(name);

    return {
      identity: `${groupName}-${name.toLowerCase()}-${number}`,
      renderKey: `${groupName}-${name}-${index}`,
      id: null,
      name,
      number,
      position: "",
      goals: 0,
      assists: 0,
      points: 0,
      gamesPlayed: 0,
    };
  }

  const name = player?.name || "Unknown Player";

  const number =
    player?.number ??
    player?.jerseyNumber ??
    createFallbackNumber(name);

  const identity = player?.id
    ? String(player.id)
    : `${name.toLowerCase()}-${number}`;

  return {
    identity,
    renderKey: `${groupName}-${identity}-${index}`,
    id: player?.id ?? null,
    name,
    number,
    position: player?.position || "",
    goals: getNumericStat(player?.goals),
    assists: getNumericStat(player?.assists),
    points: getNumericStat(player?.points),
    gamesPlayed: getNumericStat(player?.gamesPlayed),
  };
}

function flattenPlayers(rows, groupName) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .flat()
    .filter(Boolean)
    .map((player, index) => {
      return normalizePlayer(player, index, groupName);
    });
}

function removeDuplicatePlayers(players) {
  const playerIdentities = new Set();

  return players.filter((player) => {
    if (playerIdentities.has(player.identity)) {
      return false;
    }

    playerIdentities.add(player.identity);
    return true;
  });
}

function findTeamLeader(players) {
  const skaters = players.filter((player) => {
    return player.position !== "G";
  });

  if (skaters.length === 0) {
    return null;
  }

  return skaters.reduce((leader, player) => {
    if (player.points > leader.points) {
      return player;
    }

    if (
      player.points === leader.points &&
      player.goals > leader.goals
    ) {
      return player;
    }

    if (
      player.points === leader.points &&
      player.goals === leader.goals &&
      player.assists > leader.assists
    ) {
      return player;
    }

    return leader;
  });
}

function PlayerVisual({ player, team }) {
  const logoSource = getLogoPath(team.logo);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        isolation: "isolate",
        borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
        background:
          "radial-gradient(circle at center, rgba(255,255,255,0.18), rgba(0,0,0,0.12) 72%)",
      }}
    >
      {logoSource ? (
        <img
          src={logoSource}
          alt=""
          aria-hidden="true"
          onError={(event) => {
            console.error(
              `Could not load logo for ${team.fullName || team.team}:`,
              logoSource
            );

            event.currentTarget.style.display = "none";
          }}
          style={{
            position: "absolute",
            zIndex: 0,
            width: "82%",
            height: "82%",
            objectFit: "contain",
            opacity: 0.2,
            filter:
              "saturate(0.9) contrast(1.1) drop-shadow(0 8px 12px rgba(0,0,0,0.3))",
            transform: "scale(1.06)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      ) : (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            zIndex: 0,
            color: "white",
            fontSize: "clamp(2rem, 6vw, 5rem)",
            fontWeight: 900,
            opacity: 0.12,
          }}
        >
          {team.abbreviation || "TEAM"}
        </span>
      )}

      <strong
        style={{
          position: "relative",
          zIndex: 2,
          color: "white",
          fontSize: "clamp(3.4rem, 8vw, 6rem)",
          fontWeight: 1000,
          letterSpacing: "-0.06em",
          lineHeight: 1,
          textShadow:
            "-3px -3px 0 rgba(0,0,0,0.75), 3px -3px 0 rgba(0,0,0,0.75), -3px 3px 0 rgba(0,0,0,0.75), 3px 3px 0 rgba(0,0,0,0.75), 0 8px 18px rgba(0,0,0,0.65)",
        }}
      >
        {player.number}
      </strong>
    </div>
  );
}

function PlayerStat({ label, value }) {
  return (
    <div className="stats-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PlayerCard({
  player,
  team,
  isTeamLeader,
}) {
  const primary = team.primary || "#1f5f43";
  const secondary = team.secondary || "#ffffff";

  return (
    <article
      className="stats-player-card"
      style={{
        padding: "12px 12px 0",
        background: `linear-gradient(
          180deg,
          ${primary},
          #071a35
        )`,
        borderColor: secondary,
      }}
    >
      <PlayerVisual
        player={player}
        team={team}
      />

      <h3 className="stats-player-name">
        {player.name}
      </h3>

      {player.position && (
        <span
          style={{
            margin: "-5px 0 9px",
            color: "rgba(255,255,255,0.72)",
            fontSize: "0.65rem",
            fontWeight: 900,
            letterSpacing: "0.08em",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          {player.position}
        </span>
      )}

      <div className="stats-grid">
        <PlayerStat
          label="Goals"
          value={player.goals}
        />

        <PlayerStat
          label="Assists"
          value={player.assists}
        />

        <PlayerStat
          label="Points"
          value={player.points}
        />

        <PlayerStat
          label="Games"
          value={player.gamesPlayed}
        />
      </div>

      <div
        className="stats-team-leader"
        style={{
          visibility: isTeamLeader
            ? "visible"
            : "hidden",

          background: isTeamLeader
            ? `linear-gradient(
                90deg,
                ${secondary},
                ${primary}
              )`
            : "transparent",
        }}
        aria-hidden={!isTeamLeader}
      >
        Team Leader
      </div>
    </article>
  );
}

function PlayerSection({
  title,
  subtitle,
  players,
  team,
  teamLeader,
}) {
  if (players.length === 0) {
    return null;
  }

  return (
    <section className="stats-roster-section">
      <div
        className="stats-section-heading"
        style={{
          borderBottomColor:
            team.secondary || "#ffffff",
        }}
      >
        <div>
          <p>{subtitle}</p>
          <h4>{title}</h4>
        </div>

        <span>
          {players.length}{" "}
          {players.length === 1
            ? "Player"
            : "Players"}
        </span>
      </div>

      <div className="stats-lineup-grid">
        {players.map((player) => {
          const isTeamLeader =
            teamLeader?.identity ===
            player.identity;

          return (
            <PlayerCard
              key={player.renderKey}
              player={player}
              team={team}
              isTeamLeader={isTeamLeader}
            />
          );
        })}
      </div>
    </section>
  );
}

function LineupCard({ team: lineupTeam }) {
  const team = getFullTeamInformation(lineupTeam);

  const displayName =
    team.team ||
    team.fullName ||
    "Team Roster";

  const forwards = removeDuplicatePlayers(
    flattenPlayers(
      team.forwards,
      "forward"
    )
  );

  const defense = removeDuplicatePlayers(
    flattenPlayers(
      team.defense,
      "defense"
    )
  );

  const additionalPlayers =
    removeDuplicatePlayers(
      flattenPlayers(
        team.additionalPlayers,
        "additional"
      )
    );

  const allPlayers = removeDuplicatePlayers([
    ...forwards,
    ...defense,
    ...additionalPlayers,
  ]);

  const teamLeader = findTeamLeader(allPlayers);

  const primary =
    team.primary || "#1f5f43";

  const secondary =
    team.secondary || "#ffffff";

  return (
    <article
      className="stats-lineup-panel"
      style={{
        "--team-primary": primary,
        "--team-secondary": secondary,
        background: primary,
        borderColor: secondary,
      }}
    >
      <header
        className="stats-lineup-header"
        style={{
          background: `
            linear-gradient(
              rgba(0, 0, 0, 0.18),
              rgba(0, 0, 0, 0.48)
            ),
            linear-gradient(
              135deg,
              ${primary},
              ${secondary}
            )
          `,
          borderBottomColor: secondary,
        }}
      >
        <div>
          <p className="stats-header-label">
            Previous Season Player Stats
          </p>

          <h3>{displayName}</h3>

          <span>
            {team.status || "Team roster"}
          </span>
        </div>

        <div className="stats-header-details">
          {teamLeader && (
            <div>
              <span>Points Leader</span>

              <strong>
                {teamLeader.name} ·{" "}
                {teamLeader.points} PTS
              </strong>
            </div>
          )}

          {team.goalie && (
            <div>
              <span>Goalie</span>
              <strong>{team.goalie}</strong>
            </div>
          )}
        </div>
      </header>

      <div
        className="stats-lineup-content"
        style={{
          background: `
            linear-gradient(
              160deg,
              rgba(255,255,255,0.1),
              rgba(0,0,0,0.35)
            ),
            ${primary}
          `,
        }}
      >
        <PlayerSection
          title="Forwards"
          subtitle="Forward Lines"
          players={forwards}
          team={team}
          teamLeader={teamLeader}
        />

        <PlayerSection
          title="Defence"
          subtitle="Defensive Pairings"
          players={defense}
          team={team}
          teamLeader={teamLeader}
        />

        <PlayerSection
          title="Additional Players"
          subtitle="Remaining Roster"
          players={additionalPlayers}
          team={team}
          teamLeader={teamLeader}
        />
      </div>
    </article>
  );
}

export default LineupCard;