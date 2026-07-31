import Papa from "papaparse";

async function loadPlayerStats() {
  const csvUrl = `${import.meta.env.BASE_URL}data/qmjhl_player_stats.csv`;

  const response = await fetch(csvUrl);

  if (!response.ok) {
    throw new Error(`Could not load player stats: ${response.status}`);
  }

  const csvText = await response.text();

  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (results.errors.length > 0) {
    console.error("CSV parsing errors:", results.errors);
  }

  return results.data.map((player) => ({
    id: player.player_id,
    firstName: player.firstName,
    lastName: player.lastName,
    name: player.playerName,
    position: player.position,
    rookie: player.rookie === 1,
    jerseyNumber: player.jerseyNumber,
    teamCode: player.teamCode,
    teamId: player.teamId,
    teamLogo: player.teamLogo,

    gamesPlayed: player.GP,
    goals: player.G,
    assists: player.A,
    points: player.PTS,
    pointsPerGame: player["PTS/GP"],
    plusMinus: player["+/-"],
    shots: player.S,
    shootingPercentage: player["Sh%"],
    penaltyMinutes: player.PIM,
    powerPlayGoals: player.PPG,
    powerPlayAssists: player.PPA,
    shortHandedGoals: player.SHG,
    shortHandedAssists: player.SHA,
    gameWinningGoals: player.GWG,

    rank: player.rank,
    season: player.seasonName,
  }));
}

export default loadPlayerStats;