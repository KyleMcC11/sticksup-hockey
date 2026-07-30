import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Sticks Up</h1>
        <p>Hockey Hub</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/lineups">Lineups</NavLink>
        <NavLink to="/goalies">Goalies</NavLink>
        <NavLink to="/teams">Teams</NavLink>
        <NavLink to="/standings">Standings</NavLink>
      </nav>

      <div className="sidebar-footer">
        <p>Daily junior hockey coverage.</p>
      </div>
    </aside>
  );
}

export default Sidebar;