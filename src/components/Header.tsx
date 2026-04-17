import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      alert(`⚠ Error during logout: ${(error as Error).message}`);
    }
  }

  function close() { setMenuOpen(false); }

  return (
    <header className="container-fluid" style={{ background: 'transparent', borderBottom: 'none' }}>
      <nav className="navbar navbar-dark align-items-center" style={{ flexWrap: 'nowrap' }}>
        <NavLink className="navbar-brand" to="/" onClick={close}>
          Rate My Class
        </NavLink>

        {/* Desktop links */}
        <div className="nav-desktop">
          <NavLink className="nav-link text-white-50 px-3" to="/">Home</NavLink>
          <NavLink className="nav-link text-white-50 px-3" to="/about">About</NavLink>
          {user ? (
            <>
              <NavLink className="nav-link text-white-50 ms-auto px-3" to="/review-maker">Post a Review</NavLink>
              <NavLink className="nav-link text-white-50 px-3" to="/account">Account</NavLink>
              <button className="btn btn-link nav-link text-white-50 px-3" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <NavLink className="nav-link text-white-50 ms-auto px-3" to="/login">Login</NavLink>
          )}
          <img className="navbar-pic" src="/Y.png" width="48" height="31" alt="" />
        </div>

        {/* Hamburger button */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="nav-mobile-menu">
          <NavLink className="nav-link text-white-50" to="/" onClick={close}>Home</NavLink>
          <NavLink className="nav-link text-white-50" to="/about" onClick={close}>About</NavLink>
          {user ? (
            <>
              <NavLink className="nav-link text-white-50" to="/review-maker" onClick={close}>Post a Review</NavLink>
              <NavLink className="nav-link text-white-50" to="/account" onClick={close}>Account</NavLink>
              <button className="btn btn-link nav-link text-white-50" onClick={() => { handleLogout(); close(); }}>Logout</button>
            </>
          ) : (
            <NavLink className="nav-link text-white-50" to="/login" onClick={close}>Login</NavLink>
          )}
        </div>
      )}
    </header>
  );
}
