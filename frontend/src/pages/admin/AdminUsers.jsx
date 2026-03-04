import { useState, useEffect } from 'react';
import { getAllUsers } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/Modal';
import AdminLayout from './AdminLayout';

export default function AdminUsers() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Active status stored locally (no backend endpoint)
  const [inactive, setInactive] = useState(() => {
    try { return JSON.parse(localStorage.getItem('triptory_inactive_users') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    getAllUsers()
      .then(u => setUsers(u || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = (userId) => {
    const updated = inactive.includes(userId) ? inactive.filter(id => id !== userId) : [...inactive, userId];
    setInactive(updated);
    localStorage.setItem('triptory_inactive_users', JSON.stringify(updated));
    addToast(inactive.includes(userId) ? 'User activated' : 'User deactivated');
  };

  const handleDelete = () => {
    // No backend DELETE /api/Users endpoint — remove from local view
    setUsers(prev => prev.filter(u => u.user_id !== deleteTarget.user_id));
    addToast(`User "${deleteTarget.name}" removed from view`);
    setDeleteTarget(null);
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)' }}>User Management</h2>
        <input className="form-input" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '260px' }} />
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.user_id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{u.user_id}</td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${inactive.includes(u.user_id) ? 'badge--coral' : 'badge--green'}`}>
                      {inactive.includes(u.user_id) ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className={`btn btn--sm ${inactive.includes(u.user_id) ? 'btn--primary' : 'btn--ghost'}`} onClick={() => toggleActive(u.user_id)}>
                        {inactive.includes(u.user_id) ? 'Activate' : 'Deactivate'}
                      </button>
                      <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(u)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <Modal
          title="Delete User?"
          body={`Remove "${deleteTarget.name}" (${deleteTarget.email}) from the system? This only removes them from the current view.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
