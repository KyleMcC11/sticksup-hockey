import { Link } from "react-router-dom";
import { teams } from "../data/teams.js";

function getLogoPath(logo) {
  if (!logo) {
    return "";
  }

  if (logo.startsWith("http://") || logo.startsWith("https://")) {
    return logo;
  }

  const cleanLogoPath = logo.replace(/^\/+/, "");

  return `${import.meta.env.BASE_URL}${cleanLogoPath}`;
}

function TeamsPage() {
  return (
    <>
      <section className="page-title teams-title">
        <p className="section-label">QMJHL Teams</p>

        <h2>All Teams</h2>

        <p>
          Browse every QMJHL team and select a team to view its roster and
          stat-based projected lineup.
        </p>
      </section>

      <section className="teams-page-wrap">
        <div className="teams-grid">
          {teams.map((team) => {
            const logoSource = getLogoPath(team.logo);

            return (
              <article
                className="team-card"
                key={team.id}
                style={{
                  "--primary": team.primary,
                  "--secondary": team.secondary,
                }}
              >
                <div className="team-card-strip"></div>

                <div className="team-logo-area">
                  {logoSource ? (
                    <img
                      src={logoSource}
                      alt={`${team.fullName} logo`}
                    />
                  ) : (
                    <div className="team-logo-placeholder">
                      <span>{team.abbreviation}</span>
                    </div>
                  )}
                </div>

                <div className="team-card-main">
                  <p>{team.city}</p>
                  <h3>{team.name}</h3>
                  <span>{team.fullName}</span>
                </div>

                <div className="team-card-info">
                  <div>
                    <span>Province</span>
                    <strong>{team.province}</strong>
                  </div>

                  <div>
                    <span>Conference</span>
                    <strong>{team.division}</strong>
                  </div>
                </div>

                <div className="team-card-actions">
                  <Link to={`/lineups/${team.slug}`}>
                    View Roster
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}

export default TeamsPage;