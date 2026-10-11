import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="brand">Trip Splitter</span>
        <nav aria-label="Main">
          {/* NavLink adds the "active" class and aria-current on the current page. */}
          <NavLink to="/" end>
            Expenses
          </NavLink>
          <NavLink to="/expenses/new">Add expense</NavLink>
        </nav>
      </div>
    </header>
  );
}
