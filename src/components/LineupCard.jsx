function createNumberFromName(name) {
  let total = 0;

  for (let index = 0; index < name.length; index++) {
    total += name.charCodeAt(index);
  }

  return (total % 88) + 1;
}

function normalizePlayer(player, index) {
  if (typeof player === "string") {
    const cleanName = player.trim();

    return {
      id: `${cleanName}-${index}`,
      name: cleanName,
      number: createNumberFromName(cleanName),
      position: "",
      goals: 0,
      assists: 0,
      points: 0,
      gamesPlayed: 0,
    };
  }

  const name = player.name || "Unknown Player";

  return {
    id: player.id || `${name}-${index}`,
    name,
    number:
      player.number ??
      player.jerseyNumber ??
      createNumberFromName(name),

    position: player.position || "",
    goals: Number(player.goals) || 0,
    assists: Number(player.assists) || 0,
    points: Number(player.points) || 0,
    gamesPlayed: Number(player.gamesPlayed) || 0,
  };
}

function flattenPlayers(rows = []) {
  return rows
    .flat()
    .filter(Boolean)
    .map((player, index) => normalizePlayer(player, index));
}

function removeDuplicatePlayers(players) {
  const playerKeys = new Set();

  return players.filter((player) => {
    const playerKey = player.id || `${player.name}-${player.number}`;

    if (playerKeys.has(playerKey)) {
      return false;
    }

    playerKeys.add(playerKey);
    return true;
  });
}

function findTeamLeader(players) {
  const skaters = players.filter((player) => player.position !== "G");

  if (skaters.length === 0) {
    return null;
  }

  return skaters.reduce((currentLeader, player) => {
    if (player.points > currentLeader.points) {
      return player;
    }

    if (
      player.points === currentLeader.points &&
      player.goals > currentLeader.goals
    ) {
      return player;
    }

    if (
      player.points === currentLeader.points &&
      player.goals === currentLeader.goals &&
      player.assists > currentLeader.assists
    ) {
      return player;
    }

    return currentLeader;
  });
}

function getLastName(playerName) {
  if (playerName.includes(",")) {
    return playerName.split(",")[0].trim();
  }

  const nameParts = playerName.trim().split(" ");

  return nameParts[nameParts.length - 1];
}

function PlayerJersey({ player, team }) {
  return (
    <div
      className="stats-player-jersey"
      style={{
        "--jersey-primary": team.primary,
        "--jersey-secondary": team.secondary,
      }}
    >
      <div className="stats-jersey-neck"></div>

      <span className="stats-jersey-name">
        {getLastName(player.name)}
      </span>

      <strong className="stats-jersey-number">
        {player.number}
      </strong>

      <div className="stats-jersey-stripe"></div>
    </div>
  );
}

function PlayerCard({ player, team, isTeamLeader }) {
  return (
    <article className="stats-player-card">
      <span className="stats-number-badge">
        {player.number}
      </span>

      <PlayerJersey player={player} team={team} />

      <h3 className="stats-player-name">
        {player.name}
      </h3>

      <div className="stats-grid">
        <div className="stats-stat">
          <span>Goals</span>
          <strong>{player.goals}</strong>
        </div>

        <div className="stats-stat">
          <span>Assists</span>
          <strong>{player.assists}</strong>
        </div>

        <div className="stats-stat">
          <span>Points</span>
          <strong>{player.points}</strong>
        </div>

        <div className="stats-stat">
          <span>Games</span>
          <strong>{player.gamesPlayed}</strong>
        </div>
      </div>

      {isTeamLeader && (
        <div className="stats-team-leader">
          Team Leader
        </div>
      )}
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
      <div className="stats-section-heading">
        <div>
          <p>{subtitle}</p>
          <h4>{title}</h4>
        </div>

        <span>{players.length} Players</span>
      </div>

      <div className="stats-lineup-grid">
        {players.map((player) => {
          const isTeamLeader =
            teamLeader &&
            player.id === teamLeader.id;

          return (
            <PlayerCard
              key={player.id}
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
  const displayName = team.team || team.fullName;

  const forwards = removeDuplicatePlayers(
    flattenPlayers(team.forwards)
  );

  const defense = removeDuplicatePlayers(
    flattenPlayers(team.defense)
  );

  const additionalPlayers = removeDuplicatePlayers(
    (team.additionalPlayers || []).map((player, index) =>
      normalizePlayer(player, index)
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
      className="stats-lineup-panel"
      style={{
        "--team-primary": team.primary,
        "--team-secondary": team.secondary,
      }}
    >
      <header className="stats-lineup-header">
        <div>
          <p className="stats-header-label">
            Previous Season Player Stats
          </p>

          <h3>{displayName}</h3>

          <span>
            {team.status || "CSV roster"}
          </span>
        </div>

        <div className="stats-header-details">
          {teamLeader && (
            <div>
              <span>Points Leader</span>

              <strong>
                {teamLeader.name} · {teamLeader.points} PTS
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

      <div className="stats-lineup-content">
        <PlayerSection
          title="Forwards"
          subtitle="Projected Lines"
          players={forwards}
          team={team}
          teamLeader={teamLeader}
        />

        <PlayerSection
          title="Defence"
          subtitle="Defensive Group"
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