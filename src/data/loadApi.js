import loadCsv from "./loadCsv.js";
import { API_BASE } from "./apiConfig.js";

// CSVs the old scraper still updates — used only if the API can't be reached.
const CSV_FALLBACK = {
  players: "qmjhl_player_stats.csv",
  goalies: "qmjhl_goalie_stats.csv",
  standings: "qmjhl_standings.csv",
  schedule: "qmjhl_schedule.csv",
  rosters: "qmjhl_rosters.csv",
  "game-events": "qmjhl_game_events.csv",
};

// Fetch a JSON dataset from the Sticks Up Hockey API.
// If the API isn't deployed/reachable yet, fall back to the CSV files so
// the site keeps working. Once the worker is live, the API path just works.
async function loadApi(endpoint) {
  try {
    const response = await fetch(`${API_BASE}/api/${endpoint}`);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    const csv = CSV_FALLBACK[endpoint];

    if (!csv) {
      throw error;
    }

    console.warn(
      `API "${endpoint}" unavailable (${error.message}) — falling back to ${csv}.`
    );
    return loadCsv(csv);
  }
}

export default loadApi;
