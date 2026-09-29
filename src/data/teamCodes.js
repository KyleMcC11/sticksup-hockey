import { teams } from "./teams.js";

// Feed team codes that don't match the abbreviations in teams.js.
const CODE_TO_ABBREVIATION = {
  Cap: "CB",
  BaC: "BAC",
  VdO: "VDO",
};

export function findTeamByFeedCode(code) {
  const abbreviation =
    CODE_TO_ABBREVIATION[code] || String(code || "").toUpperCase();

  return (
    teams.find((team) => team.abbreviation === abbreviation) || null
  );
}
