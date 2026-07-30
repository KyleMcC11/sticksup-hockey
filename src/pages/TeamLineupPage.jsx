import { Link, useParams } from "react-router-dom";
import { lineupTeams } from "../data/lineups.js";
import LineupCard from "../components/LineupCard.jsx";

function TeamLineupPage() {
  const { teamSlug } = useParams();

  const team = lineupTeams.find((team) => team.slug === teamSlug);

  if (!team) {
    return (
      <>
        <section className="page-title">
          <p className="section-label">Lineup Not Found</p>
          <h2>Team not found</h2>
          <p>This team does not have a lineup available yet.</p>
        </section>

        <Link className="back-link" to="/lineups">
          ← Back to all teams
        </Link>
      </>
    );
  }

  const displayName = team.team || team.fullName;

  return (
    <>
      <section
        className="lineup-page-header no-logo"
        style={{
          "--primary": team.primary,
          "--secondary": team.secondary,
        }}
      >
        <div>
          <p className="section-label">Team Lineup</p>
          <h2>{displayName}</h2>
          <p>
            Projected lines, confirmed starters, scratches, and game notes for
            tonight’s matchup.
          </p>
        </div>
      </section>

      <Link className="back-link" to="/lineups">
        ← Back to all teams
      </Link>

      <section className="single-lineup-page">
        <LineupCard team={team} />
      </section>
    </>
  );
}

export default TeamLineupPage;