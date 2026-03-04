import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, getAllPlans, localComments } from '../../api';
import AdminLayout from './AdminLayout';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllUsers(), getAllPlans()])
      .then(([u, p]) => { setUsers(u || []); setPlans(p || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const published = plans.filter(p => p.status === 'Published');
  const drafts = plans.filter(p => p.status === 'Draft');

  const stats = [
    { icon: '👥', label: 'Total Users', value: users.length, color: 'var(--primary)' },
    { icon: '🗺️', label: 'Total Plans', value: plans.length, color: '#7c3aed' },
    { icon: '✅', label: 'Published', value: published.length, color: '#1a7a3f' },
    { icon: '📝', label: 'Drafts', value: drafts.length, color: '#e8604c' },
  ];

  return (
    <AdminLayout>
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>Admin Dashboard</h2>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <>
          <div className="grid grid--4" style={{ marginBottom: '2rem' }}>
            {stats.map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-card__icon">{s.icon}</div>
                <div>
                  <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-card__label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid--2">
            {/* Recent users */}
            <div className="info-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Recent Users</h3>
                <Link className="btn btn--outline btn--sm" to="/admin/users">View All</Link>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Email</th></tr></thead>
                  <tbody>
                    {users.slice(0, 5).map(u => (
                      <tr key={u.user_id}>
                        <td>{u.name}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{u.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent plans */}
            <div className="info-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Recent Plans</h3>
                <Link className="btn btn--outline btn--sm" to="/admin/plans">View All</Link>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Title</th><th>Status</th></tr></thead>
                  <tbody>
                    {plans.slice(-5).reverse().map(p => (
                      <tr key={p.plan_id}>
                        <td>{p.title}</td>
                        <td><span className={`badge ${p.status === 'Published' ? 'badge--green' : 'badge--gray'}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
