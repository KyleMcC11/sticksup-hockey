import { Link } from "react-router-dom";
import { teams } from "../data/teams.js";

function LineupsPage() {
  return (
    <>
      <section className="page-title">
        <p className="section-label">QMJHL Rosters</p>

        <h2>Select a Team</h2>

        <p>
          Select a QMJHL team to view players loaded from the CSV statistics
          file. Lines are projected using player positions and point totals.
        </p>
      </section>

      <section className="team-select-grid">
        {teams.map((team) => (
          <Link
            to={`/lineups/${team.slug}`}
            className="team-select-card"
            key={team.id}
            style={{
              "--primary": team.primary,
              "--secondary": team.secondary,
            }}
          >
            <div className="team-color-strip"></div>

            <div className="team-select-top">
              <div className="team-jersey-mini">
                <span>{team.abbreviation}</span>
              </div>

              <div>
                <h3>{team.fullName}</h3>
                <p>{team.division}</p>
              </div>
            </div>

            <div className="team-select-footer">
              <span>CSV roster</span>
              <strong>View Roster</strong>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}

export default LineupsPage;