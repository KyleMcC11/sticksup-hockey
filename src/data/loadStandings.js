import loadApi from "./loadApi.js";

function cleanText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function cleanTeamName(value) {
  // Feed names look like "Moncton, Wildcats" — drop the comma.
  return cleanText(value).replace(/,\s*/g, " ");
}

async function loadStandings() {
  const rows = await loadApi("standings");

  return rows
    .filter((team) => {
      return team.team_code || team.teamId;
    })
    .map((team) => {
      return {
        id: team.teamId,
        code: cleanText(team.team_code),
        team: cleanTeamName(team.teamName || team.name),
        abbreviation: cleanText(team.team_code).toUpperCase(),

        gp: Number(team.games_played) || 0,
        w: Number(team.wins) || 0,
        l: Number(team.losses) || 0,
        ot: Number(team.ot_losses) || 0,
        pts: Number(team.points) || 0,
        pct: Number(team.percentage) || 0,
        rw: Number(team.row) || 0,
        gf: Number(team.goals_for) || 0,
        ga: Number(team.goals_against) || 0,
        diff: Number(team.goals_diff) || 0,
        last10: cleanText(team.past_10),
        streak: cleanText(team.streak),

        season: cleanText(team.seasonName),
      };
    });
}

export default loadStandings;
