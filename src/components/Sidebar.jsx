import { NavLink } from "react-router-dom";

function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`sidebar-overlay${open ? " open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="sidebar-logo">
          <h1>Sticks Up</h1>
          <p>Hockey Hub</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" onClick={onClose}>
            Home
          </NavLink>
          <NavLink to="/lineups" onClick={onClose}>
            Lineups
          </NavLink>
          <NavLink to="/goalies" onClick={onClose}>
            Goalies
          </NavLink>
          <NavLink to="/teams" onClick={onClose}>
            Teams
          </NavLink>
          <NavLink to="/standings" onClick={onClose}>
            Standings
          </NavLink>
          <NavLink to="/scores" onClick={onClose}>
            Scores
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <p>Daily junior hockey coverage.</p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
