import loadApi from "./loadApi.js";

function cleanText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function createPlayerName(player) {
  const firstName = cleanText(player.firstName);
  const lastName = cleanText(player.lastName);

  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim();
  }

  const originalName = cleanText(player.playerName || player.name);

  if (originalName.includes(",")) {
    const nameParts = originalName.split(",");
    const last = cleanText(nameParts[0]);
    const first = cleanText(nameParts[1]);

    return `${first} ${last}`.trim();
  }

  return originalName;
}

async function loadPlayerStats() {
  const rows = await loadApi("players");

  return rows
    .filter((player) => {
      return player.player_id || player.playerName || player.name;
    })
    .map((player) => {
      const jerseyNumber =
        player.jerseyNumber === null ||
        player.jerseyNumber === undefined ||
        player.jerseyNumber === ""
          ? null
          : Number(player.jerseyNumber);

      return {
        id: player.player_id,
        firstName: cleanText(player.firstName),
        lastName: cleanText(player.lastName),
        name: createPlayerName(player),
        position: cleanText(player.position),
        rookie:
          player.rookie === 1 ||
          player.rookie === true ||
          cleanText(player.rookie).toLowerCase() === "true",

        jerseyNumber: Number.isNaN(jerseyNumber)
          ? null
          : jerseyNumber,

        teamCode: cleanText(player.teamCode),
        teamId: player.teamId,
        teamLogo: cleanText(player.teamLogo),

        gamesPlayed: Number(player.GP) || 0,
        goals: Number(player.G) || 0,
        assists: Number(player.A) || 0,
        points: Number(player.PTS) || 0,
        pointsPerGame: Number(player["PTS/GP"]) || 0,
        plusMinus: Number(player["+/-"]) || 0,
        shots: Number(player.S) || 0,
        shootingPercentage: Number(player["Sh%"]) || 0,
        penaltyMinutes: Number(player.PIM) || 0,
        powerPlayGoals: Number(player.PPG) || 0,
        powerPlayAssists: Number(player.PPA) || 0,
        shortHandedGoals: Number(player.SHG) || 0,
        shortHandedAssists: Number(player.SHA) || 0,
        gameWinningGoals: Number(player.GWG) || 0,

        rank: Number(player.rank) || 0,
        season: cleanText(player.seasonName),
        scrapedAt: cleanText(player.scraped_at),
      };
    });
}

export default loadPlayerStats;