import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'navbar__link navbar__link--active' : 'navbar__link';

  const links = user ? (
    <>
      <Link className={isActive('/explore')} to="/explore" onClick={() => setMobileOpen(false)}>Explore</Link>
      <Link className={isActive('/dashboard')} to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
      <Link className={isActive('/my-plans')} to="/my-plans" onClick={() => setMobileOpen(false)}>My Plans</Link>
      <Link className={isActive('/saved')} to="/saved" onClick={() => setMobileOpen(false)}>Saved</Link>
      {isAdmin && <Link className={isActive('/admin')} to="/admin" onClick={() => setMobileOpen(false)}>Admin</Link>}
      <Link className={isActive('/profile')} to="/profile" onClick={() => setMobileOpen(false)}>Profile</Link>
      <button className="btn btn--outline btn--sm" onClick={handleLogout}>Logout</button>
    </>
  ) : (
    <>
      <Link className={isActive('/explore')} to="/explore" onClick={() => setMobileOpen(false)}>Explore</Link>
      <Link className={isActive('/login')} to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
      <Link className="btn btn--primary btn--sm" to="/register" onClick={() => setMobileOpen(false)}>Sign Up</Link>
    </>
  );

  return (
    <nav className="navbar" style={{ position: 'relative' }}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">
          Trip<span>tory</span>
        </Link>
        <div className="navbar__nav">{links}</div>
        <button className="navbar__hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>
      {mobileOpen && (
        <div className="navbar__mobile">
          {links}
        </div>
      )}
    </nav>
  );
}
