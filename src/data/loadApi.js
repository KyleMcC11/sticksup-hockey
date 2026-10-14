import { API_BASE } from "./apiConfig.js";

// Fetch a JSON dataset from the Sticks Up Hockey API.
// Replaces the old loadCsv() — the API returns rows shaped exactly like
// the CSVs used to be, so every loader below keeps its field mapping.
async function loadApi(endpoint) {
  const response = await fetch(`${API_BASE}/api/${endpoint}`);

  if (!response.ok) {
    throw new Error(
      `Could not load ${endpoint} from the API. Server returned ${response.status}.`
    );
  }

  return response.json();
}

export default loadApi;
