import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/admin', label: '📊 Dashboard', exact: true },
  { to: '/admin/users', label: '👥 Users' },
  { to: '/admin/plans', label: '🗺️ Travel Plans' },
];

export default function AdminLayout({ children }) {
  const location = useLocation();

  const isActive = (to, exact) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__title">Admin Panel</div>
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`admin-sidebar__link ${isActive(l.to, l.exact) ? 'admin-sidebar__link--active' : ''}`}
          >
            {l.label}
          </Link>
        ))}
        <Link to="/dashboard" className="admin-sidebar__link" style={{ marginTop: '1rem', opacity: 0.6 }}>
          ← Back to Site
        </Link>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
