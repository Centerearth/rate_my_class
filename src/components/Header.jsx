import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout, getUser } from '../services/api.js';

export default function Header() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    getUser().then((data) => {
        if (data && data.email) setUserEmail(data.email);
      })
      .catch(() => setUserEmail(null));
  }, []);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      alert(`⚠ Error during logout: ${error.message}`);
    }
  }

  return (
    <header className="container-fluid bg-primary">
      <nav className="navbar navbar-dark align-items-center">
        <NavLink className="navbar-brand" to="/">
          Rate My Class
        </NavLink>
        <NavLink className="nav-link text-white-50 px-3" to="/">
          Home
        </NavLink>
        <NavLink className="nav-link text-white-50 px-3" to="/about">
          About
        </NavLink>
        {userEmail ? (
          <>
            <NavLink className="nav-link text-white-50 ms-auto px-3 position-relative" to="/review-maker">
              Post a Review
            </NavLink>
            <NavLink className="nav-link text-white-50 px-3" to="/account">
              Account
            </NavLink>
            <button className="btn btn-link nav-link text-white-50 px-3" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <NavLink className="nav-link text-white-50 ms-auto px-3" to="/login">
            Login
          </NavLink>
        )}
        <img className="navbar-pic" src="/Y.png" width="48" height="31" alt="" />
   
      </nav>
    </header>
  );
}
