import { Link } from "react-router-dom";

function PlayerLink({ playerId, name, className }) {
  const classes = `player-link${className ? ` ${className}` : ""}`;

  if (!playerId) {
    return <span className={classes}>{name}</span>;
  }

  return (
    <Link className={classes} to={`/player/${playerId}`}>
      {name}
    </Link>
  );
}

export default PlayerLink;
