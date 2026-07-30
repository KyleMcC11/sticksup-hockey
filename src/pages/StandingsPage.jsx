import { useMemo, useState } from "react";
import { standingsTeams } from "../data/standings.js";

const sortOptions = [
  { label: "Points", value: "pts" },
  { label: "Wins", value: "w" },
  { label: "Goal Differential", value: "diff" },
  { label: "Goals For", value: "gf" },
  { label: "Goals Against", value: "ga" },
  { label: "Win Percentage", value: "pct" },
];

function getDiff(team) {
  return team.gf - team.ga;
}

function getPct(team) {
  return team.gp > 0 ? team.pts / (team.gp * 2) : 0;
}

function sortTeams(teams, sortBy, direction) {
  return [...teams].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === "diff") {
      aValue = getDiff(a);
      bValue = getDiff(b);
    }

    if (sortBy === "pct") {
      aValue = getPct(a);
      bValue = getPct(b);
    }

    if (direction === "best") {
      return bValue - aValue;
    }

    return aValue - bValue;
  });
}

function StandingsTable({ title, teams }) {
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
              <th>HOME</th>
              <th>AWAY</th>
              <th>L10</th>
              <th>STRK</th>
            </tr>
          </thead>

          <tbody>
            {teams.map((team, index) => {
              const diff = getDiff(team);

              return (
                <tr key={team.id}>
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
                  <td>{getPct(team).toFixed(3).replace("0", "")}</td>
                  <td>{team.rw}</td>
                  <td>{team.gf}</td>
                  <td>{team.ga}</td>
                  <td className={diff >= 0 ? "positive-diff" : "negative-diff"}>
                    {diff > 0 ? `+${diff}` : diff}
                  </td>
                  <td>{team.home}</td>
                  <td>{team.away}</td>
                  <td>{team.last10}</td>
                  <td>{team.streak}</td>
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
  const [viewMode, setViewMode] = useState("division");
  const [sortBy, setSortBy] = useState("pts");
  const [direction, setDirection] = useState("best");

  const filteredTeams = useMemo(() => {
    if (conference === "All") {
      return standingsTeams;
    }

    return standingsTeams.filter((team) => team.conference === conference);
  }, [conference]);

  const sortedTeams = useMemo(() => {
    return sortTeams(filteredTeams, sortBy, direction);
  }, [filteredTeams, sortBy, direction]);

  const groupedStandings = useMemo(() => {
    if (viewMode === "league") {
      return [{ title: "League", teams: sortedTeams }];
    }

    if (viewMode === "conference") {
      const groups = ["Eastern", "Western"];

      return groups
        .map((group) => ({
          title: group,
          teams: sortTeams(
            filteredTeams.filter((team) => team.conference === group),
            sortBy,
            direction
          ),
        }))
        .filter((group) => group.teams.length > 0);
    }

    const divisions = [...new Set(filteredTeams.map((team) => team.division))];

    return divisions.map((division) => ({
      title: division,
      teams: sortTeams(
        filteredTeams.filter((team) => team.division === division),
        sortBy,
        direction
      ),
    }));
  }, [filteredTeams, sortedTeams, viewMode, sortBy, direction]);

  return (
    <>
      <section className="page-title">
        <p className="section-label">QMJHL Standings</p>
        <h2>Standings</h2>
        <p>
          Sort teams by points, wins, win percentage, goal differential, and
          conference. This is filler data until you connect the page to your
          backend API.
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
            <option value="division">By Division</option>
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

      <section className="standings-summary-row">
        <article>
          <span>Top Team</span>
          <strong>{sortTeams(standingsTeams, "pts", "best")[0].team}</strong>
        </article>

        <article>
          <span>Best Goal Differential</span>
          <strong>{sortTeams(standingsTeams, "diff", "best")[0].team}</strong>
        </article>

        <article>
          <span>Highest Win Percentage</span>
          <strong>{sortTeams(standingsTeams, "pct", "best")[0].team}</strong>
        </article>
      </section>

      {groupedStandings.map((group) => (
        <StandingsTable
          key={group.title}
          title={group.title}
          teams={group.teams}
        />
      ))}
    </>
  );
}

export default StandingsPage;