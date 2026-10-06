import loadCsv from "./loadCsv.js";
import { findTeamByFeedCode } from "./teamCodes.js";

function toInt(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : 0;
}

function parseGameDate(row) {
  // The feed provides a real date column plus display pieces as fallback.
  const raw = String(row.date || "").trim();

  // Treat "YYYY-MM-DD" as a local calendar day. Parsing it with
  // `new Date("YYYY-MM-DD")` would read it as UTC midnight, which then
  // renders as the previous day for viewers behind UTC (all of Canada).
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);

  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    );
  }

  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

async function loadSchedule() {
  const rows = await loadCsv("qmjhl_schedule.csv");

  return rows
    .map((row) => {
      const homeTeam = findTeamByFeedCode(row.homeCode);
      const awayTeam = findTeamByFeedCode(row.awayCode);
      const date = parseGameDate(row);
      const status = String(row.gameStatus || "").trim();

      // The feed only assigns gameIds to completed games — build a stable
      // fallback id for scheduled ones so they survive the filter below.
      const dateKey = date ? date.toISOString().slice(0, 10) : "nodate";
      const id =
        String(row.gameId || "").trim() ||
        `${dateKey}-${row.awayCode}-${row.homeCode}`;

      return {
        id,
        date,
        dateLabel: String(row.dateString || ""),
        status,
        // Scheduled games carry their start time here ("7:00 pm AST");
        // completed games say "Final", "Final OT" or "Final SO".
        timeLabel: status.toLowerCase().startsWith("final") ? "" : status,
        isFinal: status.toLowerCase().startsWith("final"),
        homeCode: String(row.homeCode || ""),
        awayCode: String(row.awayCode || ""),
        homeTeam,
        awayTeam,
        homeScore: toInt(row.homeScore),
        awayScore: toInt(row.awayScore),
        venue: String(row.venue || "").trim(),
      };
    })
    .filter((game) => game.id && game.date)
    .sort((a, b) => a.date - b.date);
}

export default loadSchedule;
