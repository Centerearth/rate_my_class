import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      alert(`⚠ Error during logout: ${(error as Error).message}`);
    }
  }

  return (
    <header className="container-fluid" style={{ background: 'transparent', borderBottom: 'none' }}>
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
        {user ? (
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
