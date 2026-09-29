import { useEffect, useMemo, useState } from "react";

import { teams } from "../data/teams.js";
import loadStandings from "../data/loadStandings.js";

const sortOptions = [
  { label: "Points", value: "pts" },
  { label: "Wins", value: "w" },
  { label: "Goal Differential", value: "diff" },
  { label: "Goals For", value: "gf" },
  { label: "Goals Against", value: "ga" },
  { label: "Win Percentage", value: "pct" },
];

// Feed team codes that don't match the abbreviations in teams.js.
const CODE_TO_ABBREVIATION = {
  Cap: "CB",
  BaC: "BAC",
  VdO: "VDO",
};

function getConference(code) {
  const abbreviation =
    CODE_TO_ABBREVIATION[code] || String(code || "").toUpperCase();

  const matchingTeam = teams.find((team) => {
    return team.abbreviation === abbreviation;
  });

  return (matchingTeam?.division || "").replace(" Conference", "");
}

function getDiff(team) {
  return team.gf - team.ga;
}

function sortTeams(teamsList, sortBy, direction) {
  return [...teamsList].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === "diff") {
      aValue = getDiff(a);
      bValue = getDiff(b);
    }

    if (direction === "best") {
      return bValue - aValue;
    }

    return aValue - bValue;
  });
}

function StandingsTable({ title, teamsList }) {
  return (
    <section className="standings-section">
      <h3>{title}</h3>

      <div className="standings-table-wrap">
        <table className="standings-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th className="team-column">Team</th>
              <th>GP</th>
              <th>W</th>
              <th>L</th>
              <th>OT</th>
              <th className="highlight-column">PTS</th>
              <th>P%</th>
              <th>RW</th>
              <th>GF</th>
              <th>GA</th>
              <th>DIFF</th>
              <th>L10</th>
            </tr>
          </thead>

          <tbody>
            {teamsList.map((team, index) => {
              const diff = getDiff(team);

              return (
                <tr key={team.id || team.code}>
                  <td>{index + 1}</td>

                  <td className="team-column">
                    <div className="standings-team-cell">
                      <span>{team.abbreviation}</span>
                      <strong>{team.team}</strong>
                    </div>
                  </td>

                  <td>{team.gp}</td>
                  <td>{team.w}</td>
                  <td>{team.l}</td>
                  <td>{team.ot}</td>
                  <td className="highlight-column">{team.pts}</td>
                  <td>{team.pct.toFixed(3).replace(/^0/, "")}</td>
                  <td>{team.rw}</td>
                  <td>{team.gf}</td>
                  <td>{team.ga}</td>
                  <td
                    className={
                      diff >= 0 ? "positive-diff" : "negative-diff"
                    }
                  >
                    {diff > 0 ? `+${diff}` : diff}
                  </td>
                  <td>{team.last10}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StandingsPage() {
  const [conference, setConference] = useState("All");
  const [viewMode, setViewMode] = useState("conference");
  const [sortBy, setSortBy] = useState("pts");
  const [direction, setDirection] = useState("best");

  const [standingsTeams, setStandingsTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let pageIsActive = true;

    async function load() {
      try {
        setLoading(true);
        setErrorMessage("");

        const rows = await loadStandings();

        if (!pageIsActive) {
          return;
        }

        setStandingsTeams(
          rows.map((row) => ({
            ...row,
            conference: getConference(row.code),
          }))
        );
      } catch (error) {
        console.error(error);

        if (pageIsActive) {
          setErrorMessage(
            "The standings could not be loaded. Please try again later."
          );
        }
      } finally {
        if (pageIsActive) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      pageIsActive = false;
    };
  }, []);

  const filteredTeams = useMemo(() => {
    if (conference === "All") {
      return standingsTeams;
    }

    return standingsTeams.filter((team) => team.conference === conference);
  }, [conference, standingsTeams]);

  const sortedTeams = useMemo(() => {
    return sortTeams(filteredTeams, sortBy, direction);
  }, [filteredTeams, sortBy, direction]);

  const groupedStandings = useMemo(() => {
    if (viewMode === "league") {
      return [{ title: "League", teamsList: sortedTeams }];
    }

    const groups = ["Eastern", "Western"];

    return groups
      .map((group) => ({
        title: `${group} Conference`,
        teamsList: sortTeams(
          filteredTeams.filter((team) => team.conference === group),
          sortBy,
          direction
        ),
      }))
      .filter((group) => group.teamsList.length > 0);
  }, [filteredTeams, sortedTeams, viewMode, sortBy, direction]);

  const topTeam = sortTeams(standingsTeams, "pts", "best")[0];
  const bestDiff = sortTeams(standingsTeams, "diff", "best")[0];
  const bestPct = sortTeams(standingsTeams, "pct", "best")[0];

  return (
    <>
      <section className="page-title">
        <p className="section-label">QMJHL &middot; 2026&ndash;27</p>
        <h2>Standings</h2>
        <p>
          Live QMJHL standings, refreshed every morning from official
          league data. Sort by points, wins, win percentage, goal
          differential, and conference.
        </p>
      </section>

      <section className="standings-controls">
        <div>
          <label>Conference</label>
          <select
            value={conference}
            onChange={(event) => setConference(event.target.value)}
          >
            <option value="All">All Conferences</option>
            <option value="Eastern">Eastern</option>
            <option value="Western">Western</option>
          </select>
        </div>

        <div>
          <label>View</label>
          <select
            value={viewMode}
            onChange={(event) => setViewMode(event.target.value)}
          >
            <option value="conference">By Conference</option>
            <option value="league">League Overall</option>
          </select>
        </div>

        <div>
          <label>Sort By</label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            {sortOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Order</label>
          <select
            value={direction}
            onChange={(event) => setDirection(event.target.value)}
          >
            <option value="best">Best to Worst</option>
            <option value="worst">Worst to Best</option>
          </select>
        </div>
      </section>

      {loading && <p>Loading standings...</p>}

      {errorMessage && <p>{errorMessage}</p>}

      {!loading && !errorMessage && (
        <>
          <section className="standings-summary-row">
            <article>
              <span>Top Team</span>
              <strong>{topTeam?.team || "--"}</strong>
            </article>

            <article>
              <span>Best Goal Differential</span>
              <strong>{bestDiff?.team || "--"}</strong>
            </article>

            <article>
              <span>Highest Win Percentage</span>
              <strong>{bestPct?.team || "--"}</strong>
            </article>
          </section>

          {groupedStandings.map((group) => (
            <StandingsTable
              key={group.title}
              title={group.title}
              teamsList={group.teamsList}
            />
          ))}
        </>
      )}
    </>
  );
}

export default StandingsPage;
