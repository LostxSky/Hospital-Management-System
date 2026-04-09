import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <Link to={user ? `/${user.role}/dashboard` : "/"} className="nav-brand">
        <span className="nav-brand-icon">♥</span>
        <span className="nav-brand-text">SmartCare</span>
      </Link>

      {user && (
        <div className="nav-user-section">
          <div className="user-info">
            <span className="user-role-badge">{user.role}</span>
          </div>
          <div className="navbar-divider" />
          <button onClick={handleLogout} className="btn-logout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
