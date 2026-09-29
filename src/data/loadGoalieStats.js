import Papa from "papaparse";

function cleanText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function createGoalieName(goalie) {
  const firstName = cleanText(goalie.firstName);
  const lastName = cleanText(goalie.lastName);

  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim();
  }

  return cleanText(goalie.name);
}

async function loadGoalieStats() {
  const csvUrl = `${import.meta.env.BASE_URL}data/qmjhl_goalie_stats.csv`;

  const response = await fetch(csvUrl);

  if (!response.ok) {
    throw new Error(
      `Could not load goalie stats. Server returned ${response.status}.`
    );
  }

  const csvText = await response.text();

  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (results.errors.length > 0) {
    console.warn("Goalie CSV parsing warnings:", results.errors);
  }

  return results.data
    .filter((goalie) => {
      return goalie.player_id || goalie.name;
    })
    .map((goalie) => {
      const jerseyNumber =
        goalie.jerseyNumber === null ||
        goalie.jerseyNumber === undefined ||
        goalie.jerseyNumber === ""
          ? null
          : Number(goalie.jerseyNumber);

      return {
        id: goalie.player_id,
        firstName: cleanText(goalie.firstName),
        lastName: cleanText(goalie.lastName),
        name: createGoalieName(goalie),
        position: "G",
        rookie:
          goalie.rookie === 1 ||
          goalie.rookie === true ||
          cleanText(goalie.rookie).toLowerCase() === "true",

        jerseyNumber: Number.isNaN(jerseyNumber)
          ? null
          : jerseyNumber,

        teamCode: cleanText(goalie.teamCode),
        teamId: goalie.teamId,
        teamLogo: cleanText(goalie.teamLogo),

        gamesPlayed: Number(goalie.GP) || 0,
        wins: Number(goalie.wins) || 0,
        losses: Number(goalie.losses) || 0,
        otLosses: Number(goalie.ot_losses) || 0,
        shutouts: Number(goalie.shutouts) || 0,
        savePercentage: Number(goalie.save_percentage) || 0,
        goalsAgainstAverage: Number(goalie.goals_against_average) || 0,

        season: cleanText(goalie.seasonName),
        matched: true,
      };
    });
}

export default loadGoalieStats;
