import { teams } from "../data/teams.js";

function getNumericStat(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
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

function getCompleteTeam(lineupTeam) {
  const matchingTeam = teams.find((team) => {
    return team.slug === lineupTeam.slug;
  });

  if (!matchingTeam) {
    return lineupTeam;
  }

  return {
    ...matchingTeam,
    ...lineupTeam,
    logo: matchingTeam.logo,
    primary: matchingTeam.primary,
    secondary: matchingTeam.secondary,
  };
}

function normalizePlayer(
  player,
  groupName,
  rowIndex,
  playerIndex
) {
  const name = player?.name || "Unknown Player";

  return {
    identity:
      player?.id !== null && player?.id !== undefined
        ? String(player.id)
        : `${groupName}-${name}-${player?.number}`,

    renderKey:
      `${groupName}-${rowIndex}-${playerIndex}-` +
      `${player?.id || name}`,

    id: player?.id ?? null,
    name,
    number: player?.number ?? player?.jerseyNumber ?? "--",
    position: player?.position || "",
    goals: getNumericStat(player?.goals),
    assists: getNumericStat(player?.assists),
    points: getNumericStat(player?.points),
    gamesPlayed: getNumericStat(player?.gamesPlayed),
  };
}

function prepareRows(rows, groupName) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row, rowIndex) => {
      if (!Array.isArray(row)) {
        return [];
      }

      return row.map((player, playerIndex) => {
        return normalizePlayer(
          player,
          groupName,
          rowIndex,
          playerIndex
        );
      });
    })
    .filter((row) => row.length > 0);
}

function prepareGoalies(goalies) {
  if (!Array.isArray(goalies)) {
    return [];
  }

  return goalies.map((goalie, index) => {
    return normalizePlayer(
      goalie,
      "goalie",
      0,
      index
    );
  });
}

function findTeamLeader(forwardRows, defenseRows) {
  const players = [
    ...forwardRows.flat(),
    ...defenseRows.flat(),
  ];

  if (players.length === 0) {
    return null;
  }

  return players.reduce((leader, player) => {
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
    <div className="lineup-row-player-visual">
      {logoSource && (
        <img
          className="lineup-row-player-logo"
          src={logoSource}
          alt=""
          aria-hidden="true"
        />
      )}

      <strong className="lineup-row-player-number">
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
  isGoalie,
}) {
  const primary = team.primary || "#1f5f43";
  const secondary = team.secondary || "#ffffff";

  return (
    <article
      className="stats-player-card"
      style={{
        padding: "0 12px",
        background: `
          linear-gradient(
            180deg,
            rgba(255,255,255,0.1),
            rgba(0,0,0,0.48)
          ),
          ${primary}
        `,
        borderColor: secondary,
      }}
    >
      <PlayerVisual player={player} team={team} />

      <h3 className="stats-player-name">
        {player.name}
      </h3>

      <span className="lineup-row-position">
        {isGoalie
          ? "Goaltender"
          : player.position || "Skater"}
      </span>

      <div className="stats-grid">
        {isGoalie ? (
          <>
            <PlayerStat
              label="Games"
              value={player.gamesPlayed}
            />

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
          </>
        ) : (
          <>
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
          </>
        )}
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
      >
        Team Leader
      </div>
    </article>
  );
}

function LineupRow({
  row,
  rowIndex,
  sectionType,
  team,
  teamLeader,
}) {
  let rowLabel = `Line ${rowIndex + 1}`;

  if (sectionType === "defense") {
    rowLabel = `Pair ${rowIndex + 1}`;
  }

  if (sectionType === "goalies") {
    rowLabel = "Goaltenders";
  }

  return (
    <div className="lineup-row">
      <div className="lineup-row-label">
        {rowLabel}
      </div>

      <div
        className={`lineup-row-grid lineup-row-grid-${sectionType}`}
      >
        {row.map((player) => {
          const isTeamLeader =
            teamLeader?.identity === player.identity;

          return (
            <PlayerCard
              key={player.renderKey}
              player={player}
              team={team}
              isTeamLeader={isTeamLeader}
              isGoalie={sectionType === "goalies"}
            />
          );
        })}
      </div>
    </div>
  );
}

function LineupSection({
  title,
  subtitle,
  rows,
  sectionType,
  team,
  teamLeader,
}) {
  if (rows.length === 0) {
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
      </div>

      <div className="lineup-row-list">
        {rows.map((row, rowIndex) => {
          return (
            <LineupRow
              key={`${sectionType}-${rowIndex}`}
              row={row}
              rowIndex={rowIndex}
              sectionType={sectionType}
              team={team}
              teamLeader={teamLeader}
            />
          );
        })}
      </div>
    </section>
  );
}

function LineupCard({ team: lineupTeam }) {
  const team = getCompleteTeam(lineupTeam);

  const forwards = prepareRows(
    team.forwards,
    "forward"
  );

  const defense = prepareRows(
    team.defense,
    "defense"
  );

  const goalies = prepareGoalies(team.goalies);

  const goalieRows =
    goalies.length > 0 ? [goalies] : [];

  const teamLeader = findTeamLeader(
    forwards,
    defense
  );

  const primary = team.primary || "#1f5f43";
  const secondary = team.secondary || "#ffffff";

  const displayName =
    team.team ||
    team.fullName ||
    "Team Lineup";

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
              rgba(0,0,0,0.18),
              rgba(0,0,0,0.5)
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
            Projected Team Lineup
          </p>

          <h3>{displayName}</h3>

          <span>
            3 forward lines · 3 defence pairs · goalies
          </span>
        </div>

        {teamLeader && (
          <div className="stats-header-details">
            <div>
              <span>Points Leader</span>

              <strong>
                {teamLeader.name} ·{" "}
                {teamLeader.points} PTS
              </strong>
            </div>
          </div>
        )}
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
        <LineupSection
          title="Forwards"
          subtitle="Three Forward Lines"
          rows={forwards}
          sectionType="forwards"
          team={team}
          teamLeader={teamLeader}
        />

        <LineupSection
          title="Defence"
          subtitle="Three Defence Pairs"
          rows={defense}
          sectionType="defense"
          team={team}
          teamLeader={teamLeader}
        />

        <LineupSection
          title="Goalies"
          subtitle="Goaltenders"
          rows={goalieRows}
          sectionType="goalies"
          team={team}
          teamLeader={teamLeader}
        />
      </div>
    </article>
  );
}

export default LineupCard;