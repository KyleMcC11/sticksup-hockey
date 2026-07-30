const goalies = [
  {
    id: 1,
    name: "Owen Bresson",
    team: "Halifax Mooseheads",
    age: 18,
    catchingHand: "L",
    status: "Watch List",
    gamesPlayed: 24,
    wins: 15,
    losses: 7,
    otLosses: 2,
    gaa: 2.48,
    savePercentage: ".918",
    shutouts: 2,
    height: "6'2",
    weight: "185",
  },
  {
    id: 2,
    name: "Félix Hamel",
    team: "Cape Breton Eagles",
    age: 19,
    catchingHand: "L",
    status: "Trending Up",
    gamesPlayed: 28,
    wins: 16,
    losses: 9,
    otLosses: 3,
    gaa: 2.61,
    savePercentage: ".914",
    shutouts: 1,
    height: "6'1",
    weight: "181",
  },
  {
    id: 3,
    name: "Lucas Harrington",
    team: "Moncton Wildcats",
    age: 18,
    catchingHand: "R",
    status: "Draft Eligible",
    gamesPlayed: 22,
    wins: 14,
    losses: 6,
    otLosses: 2,
    gaa: 2.35,
    savePercentage: ".921",
    shutouts: 3,
    height: "6'3",
    weight: "190",
  },
  {
    id: 4,
    name: "Louis-Antoine Denault",
    team: "Newfoundland Regiment",
    age: 19,
    catchingHand: "L",
    status: "Sleeper",
    gamesPlayed: 26,
    wins: 13,
    losses: 10,
    otLosses: 3,
    gaa: 2.78,
    savePercentage: ".907",
    shutouts: 1,
    height: "6'0",
    weight: "176",
  },
];

function getBestGoalieBySavePercentage(goalies) {
  return [...goalies].sort(
    (a, b) =>
      Number(b.savePercentage.replace(".", "0.")) -
      Number(a.savePercentage.replace(".", "0."))
  )[0];
}

function getMostWins(goalies) {
  return [...goalies].sort((a, b) => b.wins - a.wins)[0];
}

function GoalieCard({ goalie }) {
  return (
    <article className="goalie-prospect-card">
      <div className="goalie-card-top">
        <div className="goalie-mask">
          <span>{goalie.catchingHand}</span>
        </div>

        <div>
          <p>{goalie.team}</p>
          <h3>{goalie.name}</h3>
        </div>
      </div>

      <div className="goalie-status-row">
        <span>{goalie.status}</span>
        <strong>{goalie.age} yrs</strong>
      </div>

      <div className="goalie-stat-grid">
        <div>
          <span>GP</span>
          <strong>{goalie.gamesPlayed}</strong>
        </div>

        <div>
          <span>Record</span>
          <strong>
            {goalie.wins}-{goalie.losses}-{goalie.otLosses}
          </strong>
        </div>

        <div>
          <span>GAA</span>
          <strong>{goalie.gaa}</strong>
        </div>

        <div>
          <span>SV%</span>
          <strong>{goalie.savePercentage}</strong>
        </div>

        <div>
          <span>SO</span>
          <strong>{goalie.shutouts}</strong>
        </div>

        <div>
          <span>Size</span>
          <strong>{goalie.height}</strong>
        </div>
      </div>
    </article>
  );
}

function GoaliesPage() {
  const bestSavePercentage = getBestGoalieBySavePercentage(goalies);
  const mostWins = getMostWins(goalies);

  return (
    <>
      <section className="page-title goalie-page-title">
        <p className="section-label">Goalie Prospects</p>
        <h2>QMJHL Goalie Watch</h2>
        <p>
          Track goalie prospects, season stats, draft watch notes, and
          performance trends from around the league.
        </p>
      </section>

      <section className="goalie-leader-row">
        <article className="goalie-leader-card">
          <span>Best Save Percentage</span>
          <h3>{bestSavePercentage.name}</h3>
          <p>
            {bestSavePercentage.savePercentage} SV% —{" "}
            {bestSavePercentage.team}
          </p>
        </article>

        <article className="goalie-leader-card">
          <span>Most Wins</span>
          <h3>{mostWins.name}</h3>
          <p>
            {mostWins.wins} wins — {mostWins.team}
          </p>
        </article>

        <article className="goalie-leader-card">
          <span>Prospect Focus</span>
          <h3>Draft Watch</h3>
          <p>Goalies to monitor for draft rankings and team reports.</p>
        </article>
      </section>

      <section className="goalie-page-grid">
        {goalies.map((goalie) => (
          <GoalieCard key={goalie.id} goalie={goalie} />
        ))}
      </section>

      <section className="goalie-table-card">
        <div className="section-header">
          <h2>Goalie Stats</h2>
          <a href="#">View Full Rankings</a>
        </div>

        <div className="goalie-table-wrap">
          <table className="goalie-table">
            <thead>
              <tr>
                <th>Goalie</th>
                <th>Team</th>
                <th>Age</th>
                <th>GP</th>
                <th>Record</th>
                <th>GAA</th>
                <th>SV%</th>
                <th>SO</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {goalies.map((goalie) => (
                <tr key={goalie.id}>
                  <td>
                    <strong>{goalie.name}</strong>
                  </td>
                  <td>{goalie.team}</td>
                  <td>{goalie.age}</td>
                  <td>{goalie.gamesPlayed}</td>
                  <td>
                    {goalie.wins}-{goalie.losses}-{goalie.otLosses}
                  </td>
                  <td>{goalie.gaa}</td>
                  <td>{goalie.savePercentage}</td>
                  <td>{goalie.shutouts}</td>
                  <td>
                    <span className="goalie-table-pill">{goalie.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default GoaliesPage;