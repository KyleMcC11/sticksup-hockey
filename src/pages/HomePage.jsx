import ArticleCard from "../components/ArticleCard";

const articles = [
  {
    id: 1,
    tag: "Game Preview",
    title: "Mooseheads look ready for a major divisional matchup",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed justo non urna tempus volutpat.",
  },
  {
    id: 2,
    tag: "Trade Rumors",
    title: "Several QMJHL teams could be active before the deadline",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas tristique mi et erat pretium luctus.",
  },
  {
    id: 3,
    tag: "Prospects",
    title: "Top junior prospects continue strong offensive starts",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a risus vitae lorem finibus commodo.",
  },
];

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <p className="section-label">Featured Story</p>
          <h2>QMJHL news, game previews, trades, and prospect coverage</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
            malesuada, mauris sed tempor luctus, erat magna posuere mi, non
            faucibus arcu libero at nibh.
          </p>
          <button>Read Main Story</button>
        </div>
      </section>

      <section className="content-grid">
        <div className="main-content">
          <section className="news-section">
            <div className="section-header">
              <h2>Latest News</h2>
              <a href="#">View All</a>
            </div>

            <div className="article-grid">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        </div>

        <aside className="right-column">
          <section className="side-card">
            <h3>Today’s Games</h3>

            <div className="game-row">
              <strong>Halifax vs Moncton</strong>
              <p>7:00 PM AST</p>
            </div>

            <div className="game-row">
              <strong>Cape Breton vs Charlottetown</strong>
              <p>7:00 PM AST</p>
            </div>

            <div className="game-row">
              <strong>Quebec vs Rimouski</strong>
              <p>8:00 PM AST</p>
            </div>
          </section>

          <section className="side-card">
            <h3>Trending</h3>
            <ol>
              <li>Lorem ipsum headline</li>
              <li>Dolor sit amet update</li>
              <li>Consectetur news story</li>
            </ol>
          </section>
        </aside>
      </section>
    </>
  );
}

export default HomePage;