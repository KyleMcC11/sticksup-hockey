// Name matching between the game-events feed and the stats/rosters feeds.
//
// Stats + rosters use "Last, First" (often with accents: "Guévin, Alexis").
// Game events use "First Last" ("Alexis Guevin"). This module normalizes both
// sides so event scorers can be linked to their player pages.

function stripAccents(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeName(value) {
  return stripAccents(value).toLowerCase().trim().replace(/\s+/g, " ");
}

// "First Middle Last" -> "last, first middle" (normalized), matching the
// "Last, First" format used in the stats and rosters feeds.
export function flipEventName(value) {
  const parts = normalizeName(value).split(" ").filter(Boolean);

  if (parts.length < 2) {
    return normalizeName(value);
  }

  const last = parts[parts.length - 1];
  const rest = parts.slice(0, -1).join(" ");

  return `${last}, ${rest}`;
}

// Build a lookup of normalized "last, first" -> player_id from player rows.
// Accepts loader-shaped rows ({ id, firstName, lastName, name }) or raw feed
// rows ({ player_id, name }).
export function buildPlayerNameIndex(rows) {
  const index = new Map();

  for (const row of rows || []) {
    const id = String(row.id || row.player_id || "").trim();

    if (!id) {
      continue;
    }

    const first = (row.firstName || "").trim();
    const last = (row.lastName || "").trim();
    let key = "";

    if (first && last) {
      key = normalizeName(`${last}, ${first}`);
    } else if (String(row.name || "").includes(",")) {
      key = normalizeName(row.name);
    } else {
      key = flipEventName(row.name);
    }

    if (key && !index.has(key)) {
      index.set(key, id);
    }
  }

  return index;
}

// Resolve a "First Last" event-feed name to a player_id, or null.
export function findPlayerId(eventName, index) {
  if (!eventName || !index) {
    return null;
  }

  return index.get(flipEventName(eventName)) || null;
}
