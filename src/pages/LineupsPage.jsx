import { Link } from "react-router-dom";
import { lineupTeams } from "../data/lineups.js";

function LineupsPage() {
  return (
    <>
      <section className="page-title">
        <p className="section-label">Daily Lineups</p>
        <h2>Select a Team</h2>
        <p>
          Choose a QMJHL team to view projected lines, confirmed starters,
          scratches, and lineup notes.
        </p>
      </section>

      <section className="team-select-grid">
        {lineupTeams.map((team) => {
          const displayName = team.team || team.fullName;

          return (
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
                  <h3>{displayName}</h3>
                  <p>{team.record || "Projected lineup available"}</p>
                </div>
              </div>

              <div className="team-select-footer">
                <span>{team.status}</span>
                <strong>View Lineup</strong>
              </div>
            </Link>
          );
        })}
      </section>
    </>
  );
}

export default LineupsPage;