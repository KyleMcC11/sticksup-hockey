import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import loadCsv from "../data/loadCsv.js";

function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let pageIsActive = true;

    loadCsv("teams.csv")
      .then((teamData) => {
        if (pageIsActive) {
          setTeams(teamData);
        }
      })
      .catch((error) => {
        console.error(error);

        if (pageIsActive) {
          setErrorMessage("The team data could not be loaded.");
        }
      })
      .finally(() => {
        if (pageIsActive) {
          setLoading(false);
        }
      });

    return () => {
      pageIsActive = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="page-title teams-title">
        <p className="section-label">QMJHL Teams</p>
        <h2>Loading teams...</h2>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="page-title teams-title">
        <p className="section-label">QMJHL Teams</p>
        <h2>Unable to load teams</h2>
        <p>{errorMessage}</p>
      </section>
    );
  }

  return (
    <>
      <section className="page-title teams-title">
        <p className="section-label">QMJHL Teams</p>
        <h2>All Teams</h2>
        <p>
          Browse every QMJHL team. Select a team to view its projected lineup.
        </p>
      </section>

      <section className="teams-page-wrap">
        <div className="teams-grid">
          {teams.map((team) => {
            const cleanLogoPath = team.logo
              ? String(team.logo).replace(/^\/+/, "")
              : "";

            const logoSource = cleanLogoPath
              ? `${import.meta.env.BASE_URL}${cleanLogoPath}`
              : "";

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
                  <Link to={`/lineups/${team.slug}`}>View Lineup</Link>
                  <Link to="#">Team Page</Link>
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