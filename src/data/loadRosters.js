import loadCsv from "./loadCsv.js";
import { findTeamByFeedCode } from "./teamCodes.js";

function cleanText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value).trim();
  return text.toLowerCase() === "nan" ? "" : text;
}

function toInt(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : 0;
}

function formatName(row) {
  const first = cleanText(row.firstName);
  const last = cleanText(row.lastName);

  if (first || last) {
    return `${first} ${last}`.trim();
  }

  const raw = cleanText(row.name);

  if (raw.includes(",")) {
    const [lastName, firstName] = raw.split(",");
    return `${cleanText(firstName)} ${cleanText(lastName)}`.trim();
  }

  return raw;
}

function heightToDisplay(cmValue) {
  const cm = Number(cmValue);

  if (!Number.isFinite(cm) || cm <= 0) {
    return "";
  }

  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;

  return `${feet}'${inches}"`;
}

function ageOn(birthdate, today = new Date()) {
  if (!birthdate) {
    return null;
  }

  const born = new Date(birthdate);

  if (Number.isNaN(born.getTime())) {
    return null;
  }

  let age = today.getFullYear() - born.getFullYear();
  const monthDiff = today.getMonth() - born.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) {
    age -= 1;
  }

  return age;
}

const POSITION_ORDER = { G: 0, D: 1, C: 2, LW: 3, RW: 4 };

async function loadRosters() {
  const rows = await loadCsv("qmjhl_rosters.csv");

  const byTeam = {};

  rows.forEach((row) => {
    const feedCode = cleanText(row.teamCode);
    const team = findTeamByFeedCode(feedCode);

    if (!team) {
      return;
    }

    const position = cleanText(row.position).toUpperCase();

    const player = {
      id: cleanText(row.player_id),
      name: formatName(row),
      position,
      jersey: cleanText(row.tp_jersey_number),
      age: ageOn(cleanText(row.birthdate)),
      height: heightToDisplay(row.height_cm),
      weight:
        toInt(row.w) > 0 ? `${toInt(row.w)} lb` : "",
      shoots: cleanText(row.shootsCatches).toUpperCase(),
      birthplace: [cleanText(row.birthCity), cleanText(row.birthCountry)]
        .filter(Boolean)
        .join(", "),
      rookie: cleanText(row.rookie) === "1",
    };

    if (!byTeam[team.slug]) {
      byTeam[team.slug] = [];
    }

    byTeam[team.slug].push(player);
  });

  Object.values(byTeam).forEach((players) => {
    players.sort((a, b) => {
      const aOrder = POSITION_ORDER[a.position] ?? 9;
      const bOrder = POSITION_ORDER[b.position] ?? 9;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      return toInt(a.jersey) - toInt(b.jersey) || a.name.localeCompare(b.name);
    });
  });

  return byTeam;
}

export default loadRosters;
