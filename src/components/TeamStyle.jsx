/**
 * Shared team-identity styling: team-color edge + subtle gradient wash +
 * faded team-logo watermark, matching the projected-lineup card look.
 *
 * Full treatment: add className="team-row" + style={teamRowStyle(team)}
 * and render <TeamWatermark team={team} /> as the first child.
 *
 * Subtle treatment (dense tables): add className="team-row-subtle" to the
 * <tr> with style={{ "--team-color": team?.primary }}.
 */

export function teamLogoSrc(logo) {
  if (!logo) {
    return "";
  }

  if (/^(https?:|data:)/i.test(logo)) {
    return logo;
  }

  const cleanPath = String(logo).replace(/^\/+/, "");

  return `${import.meta.env.BASE_URL}${cleanPath}`;
}

export function teamRowStyle(team) {
  const primary = team?.primary || "#1c1c21";

  return {
    "--team-color": primary,
    background: `linear-gradient(90deg, ${primary}26 0%, transparent 70%)`,
  };
}

export function TeamWatermark({ team }) {
  const src = teamLogoSrc(team?.logo);

  if (!src) {
    return null;
  }

  return (
    <img
      className="team-watermark"
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
    />
  );
}
