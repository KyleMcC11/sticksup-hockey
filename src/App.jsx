import { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import "./polish.css";

import Sidebar from "./components/Sidebar.jsx";

import HomePage from "./pages/HomePage.jsx";
import TeamLineupPage from "./pages/TeamLineupPage.jsx";
import GoaliesPage from "./pages/GoaliesPage.jsx";
import TeamsPage from "./pages/TeamsPage.jsx";
import StandingsPage from "./pages/StandingsPage.jsx";
import ScoresPage from "./pages/ScoresPage.jsx";
import GameDetailPage from "./pages/GameDetailPage.jsx";
import LastNightPage from "./pages/LastNightPage.jsx";
import PlayerPage from "./pages/PlayerPage.jsx";
import RookiesPage from "./pages/RookiesPage.jsx";
import StreaksPage from "./pages/StreaksPage.jsx";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <HashRouter>
      <div className="app">
        <header className="mobile-topbar">
          <button
            className="hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
          <span className="mobile-topbar-title">Sticks Up</span>
        </header>

        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <main className="main-page">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/last-night" element={<LastNightPage />} />
            <Route path="/lineups/:teamSlug" element={<TeamLineupPage />} />
            <Route path="/goalies" element={<GoaliesPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/standings" element={<StandingsPage />} />
            <Route path="/scores" element={<ScoresPage />} />
            <Route path="/game/:gameId" element={<GameDetailPage />} />
            <Route path="/player/:playerId" element={<PlayerPage />} />
            <Route path="/rookies" element={<RookiesPage />} />
            <Route path="/streaks" element={<StreaksPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
