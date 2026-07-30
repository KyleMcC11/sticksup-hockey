function getPlayerName(player) {
  return typeof player === "string" ? player.trim() : player.name;
}

function getPlayerNumber(player) {
  if (typeof player !== "string") return player.number;

  const cleanName = player.trim();
  let total = 0;

  for (let i = 0; i < cleanName.length; i++) {
    total += cleanName.charCodeAt(i);
  }

  return (total % 88) + 1;
}

function getLastName(name) {
  const parts = name.trim().split(" ");
  return parts[parts.length - 1];
}

function TeamJersey({ team }) {
  return (
    <div
      className={`lf-team-jersey jersey-${team.slug}`}
        style={{
          "--primary": team.primary,
          "--secondary": team.secondary,
          "--accent": team.accent || "#ffffff",
        }}
    >
      <div className="lf-jersey-neck"></div>
      <div className="lf-jersey-name">{team.abbreviation}</div>
      <div className="lf-jersey-number">{team.jerseyNumber || "00"}</div>
      <div className="lf-jersey-bottom"></div>
    </div>
  );
}

function PlayerJersey({ player, team }) {
  const name = getPlayerName(player);
  const number = getPlayerNumber(player);

  return (
    <div className="lf-player-tile">
      <div
        className="lf-player-jersey"
        style={{
          "--primary": team.primary,
          "--secondary": team.secondary,
        }}
      >
        <div className="lf-player-neck"></div>
        <div className="lf-player-nameplate">{getLastName(name)}</div>
        <div className="lf-player-number">{number}</div>
        <div className="lf-player-stripe"></div>
      </div>

      <div className="lf-player-fullname">{name}</div>
    </div>
  );
}

function LineupBoard({ title, type, rows, team }) {
  const positions = type === "defense" ? ["LD", "RD"] : ["LW", "C", "RW"];

  return (
    <section className="lf-board-section">
      <div className="lf-section-title">
        <h4>{title}</h4>
      </div>

      <div className={`lf-board ${type}`}>
        <div className="lf-board-header">
          <div></div>
          {positions.map((position) => (
            <div key={position}>{position}</div>
          ))}
        </div>

        {rows.map((row, index) => (
          <div className="lf-board-row" key={index}>
            <div className="lf-line-label">
              <span>{type === "defense" ? "Pair" : "Line"}</span>
              <strong>{index + 1}</strong>
            </div>

            {row.map((player) => (
              <PlayerJersey
                key={getPlayerName(player)}
                player={player}
                team={team}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function LineupCard({ team }) {
  const displayName = team.team || team.fullName;

  return (
    <article
      className="lf-lineup-card"
      style={{
        "--primary": team.primary,
        "--secondary": team.secondary,
      }}
    >
      <div className="lf-lineup-header">
        <TeamJersey team={team} />

        <div>
          <div className="team-meta">
            <span>{team.abbreviation}</span>
            {team.record && <span>{team.record}</span>}
          </div>

          <h3>{displayName}</h3>

          <div className="lineup-status">
            <span
              className={`status-pill ${team.status
                .toLowerCase()
                .replaceAll(" ", "-")}`}
            >
              {team.status}
            </span>

            <p>
              Starting Goalie: <strong>{team.goalie}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="lf-lineup-body">
        <LineupBoard
          title="Forwards"
          type="forwards"
          rows={team.forwards}
          team={team}
        />

        <LineupBoard
          title="Defense"
          type="defense"
          rows={team.defense}
          team={team}
        />

        <div className="lf-scratches">
          <h4>Scratches</h4>
          <p>Lorem ipsum, Dolor sit, Amet elit</p>
        </div>
      </div>
    </article>
  );
}

export default LineupCard;