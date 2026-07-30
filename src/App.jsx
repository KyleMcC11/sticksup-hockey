import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Sidebar from "./components/Sidebar.jsx";

import HomePage from "./pages/HomePage.jsx";
import LineupsPage from "./pages/LineupsPage.jsx";
import TeamLineupPage from "./pages/TeamLineupPage.jsx";
import GoaliesPage from "./pages/GoaliesPage.jsx";
import TeamsPage from "./pages/TeamsPage.jsx";
import StandingsPage from "./pages/StandingsPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />

        <main className="main-page">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lineups" element={<LineupsPage />} />
            <Route path="/lineups/:teamSlug" element={<TeamLineupPage />} />
            <Route path="/goalies" element={<GoaliesPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/standings" element={<StandingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;