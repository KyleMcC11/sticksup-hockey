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

function createPlayerIdentity(player, name, number) {
  if (player && typeof player === "object" && player.id) {
    return String(player.id);
  }

  return `${name.toLowerCase()}-${number}`;
}

function normalizePlayer(player, index, groupName) {
  if (typeof player === "string") {
    const name = player.trim();
    const number = createFallbackNumber(name);

    return {
      identity: createPlayerIdentity(null, name, number),
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

  const identity = createPlayerIdentity(
    player,
    name,
    number
  );

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

function getTeamLogoUrl(logo) {
  if (!logo) {
    return "";
  }

  const logoValue = String(logo);

  if (
    logoValue.startsWith("http://") ||
    logoValue.startsWith("https://") ||
    logoValue.startsWith("data:")
  ) {
    return logoValue;
  }

  const cleanLogoPath = logoValue.replace(/^\/+/, "");

  return `${import.meta.env.BASE_URL}${cleanLogoPath}`;
}

function getLogoPath(logo) {
  if (!logo) {
    return "";
  }

  if (
    logo.startsWith("http://") ||
    logo.startsWith("https://")
  ) {
    return logo;
  }

  const cleanLogoPath = logo.replace(/^\/+/, "");

  return `${import.meta.env.BASE_URL}${cleanLogoPath}`;
}

function PlayerVisual({ player, team }) {
  const logoSource = getLogoPath(team.logo);

  return (
    <div className="team-player-visual">
      {logoSource ? (
        <img
          className="team-player-background-logo"
          src={logoSource}
          alt=""
          aria-hidden="true"
        />
      ) : (
        <span
          className="team-player-logo-fallback"
          aria-hidden="true"
        >
          {team.abbreviation || "TEAM"}
        </span>
      )}

      <strong className="team-player-number">
        {player.number}
      </strong>
    </div>
  );
}

function PlayerStat({ label, value }) {
  return (
    <div className="team-player-stat">
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
  return (
    <article
      className={`team-player-card ${
        isTeamLeader ? "is-team-leader" : ""
      }`}
    >
      <PlayerVisual
        player={player}
        team={team}
      />

      <div className="team-player-information">
        <h3 className="team-player-name">
          {player.name}
        </h3>

        {player.position && (
          <span className="team-player-position">
            {player.position}
          </span>
        )}
      </div>

      <div className="team-player-stats">
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

      {isTeamLeader ? (
        <div className="team-player-leader-tag">
          Team Leader
        </div>
      ) : (
        <div
          className="team-player-leader-tag is-empty"
          aria-hidden="true"
        >
          Team Leader
        </div>
      )}
    </article>
  );
}

function PlayerGroup({
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
    <section className="team-roster-group">
      <div className="team-roster-group-heading">
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

      <div className="team-roster-grid">
        {players.map((player) => {
          const isTeamLeader =
            teamLeader?.identity === player.identity;

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

function LineupCard({ team }) {
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

  return (
    <article
      className="team-roster-panel"
      style={{
        "--roster-primary":
          team.primary || "#1f5f43",

        "--roster-secondary":
          team.secondary || "#ffffff",
      }}
    >
      <header className="team-roster-header">
        <div className="team-roster-title">
          <p>Previous Season Player Stats</p>

          <h3>{displayName}</h3>

          <span>
            {team.status || "Team roster"}
          </span>
        </div>

        <div className="team-roster-summary">
          {teamLeader && (
            <div>
              <span>Points Leader</span>

              <strong>
                {teamLeader.name}
              </strong>

              <small>
                {teamLeader.points} points
              </small>
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

      <div className="team-roster-content">
        <PlayerGroup
          title="Forwards"
          subtitle="Forward Lines"
          players={forwards}
          team={team}
          teamLeader={teamLeader}
        />

        <PlayerGroup
          title="Defence"
          subtitle="Defensive Pairings"
          players={defense}
          team={team}
          teamLeader={teamLeader}
        />

        <PlayerGroup
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