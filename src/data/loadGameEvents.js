import loadCsv from "./loadCsv.js";

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

function toBool(value) {
  if (value === null || value === undefined) {
    return false;
  }

  return String(value).trim().toLowerCase() === "true";
}

// Feed times are elapsed "M:SS" within the period — numeric sort beats
// string sort ("14:26" would otherwise come before "6:21").
function timeToSeconds(time) {
  const match = String(time || "").match(/(\d+):(\d+)/);

  if (!match) {
    return 0;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function describeGoal(event) {
  const badges = [];

  if (event.isPP) badges.push("PP");
  if (event.isSH) badges.push("SH");
  if (event.isEN) badges.push("EN");
  if (event.isGW) badges.push("GWG");

  return badges;
}

async function loadGameEvents() {
  let rows = [];

  try {
    rows = await loadCsv("qmjhl_game_events.csv");
  } catch (error) {
    console.warn("Game events not available yet:", error.message);
    return {};
  }

  const byGame = {};

  rows.forEach((row) => {
    const gameId = String(row.game_id || "");

    if (!gameId) {
      return;
    }

    const event = {
      period: toInt(row.period),
      time: cleanText(row.time),
      seconds: timeToSeconds(row.time),
      kind: cleanText(row.event),
      teamCode: cleanText(row.team_code),
      scorer: cleanText(row.scorer),
      assist1: cleanText(row.assist1),
      assist2: cleanText(row.assist2),
      isPP: toBool(row.is_pp),
      isSH: toBool(row.is_sh),
      isEN: toBool(row.is_en),
      isGW: toBool(row.is_gw),
      scoreHome: toInt(row.score_home),
      scoreAway: toInt(row.score_away),
      penalizedPlayer: cleanText(row.penalized_player),
      offence: cleanText(row.offence),
      minutes: toInt(row.minutes),
      badges: [],
    };

    event.badges = describeGoal(event);

    if (!byGame[gameId]) {
      byGame[gameId] = [];
    }

    byGame[gameId].push(event);
  });

  Object.values(byGame).forEach((events) => {
    events.sort((a, b) => a.period - b.period || a.seconds - b.seconds);
  });

  return byGame;
}

export default loadGameEvents;
