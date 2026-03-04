import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllPlans, getAllUsers, deletePlan, localPlanDays } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/Modal';
import AdminLayout from './AdminLayout';

export default function AdminPlans() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = () => {
    Promise.all([getAllPlans(), getAllUsers()])
      .then(([p, u]) => { setPlans(p || []); setUsers(u || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const getUserName = (uid) => users.find(u => u.user_id === uid)?.name || 'Unknown';

  const filtered = plans.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.destination?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePlan(deleteTarget.plan_id);
      localPlanDays.deleteByPlan(deleteTarget.plan_id);
      setPlans(prev => prev.filter(p => p.plan_id !== deleteTarget.plan_id));
      addToast('Plan deleted.');
    } catch {
      addToast('Failed to delete plan.', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)' }}>Travel Plan Management</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input className="form-input" placeholder="Search plans…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '200px' }} />
          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ maxWidth: '150px' }}>
            <option value="">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Destination</th>
                <th>Author</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No plans found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.plan_id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{p.plan_id}</td>
                  <td style={{ fontWeight: 600, maxWidth: '180px' }}>{p.title}</td>
                  <td>{p.destination}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{getUserName(p.user_id)}</td>
                  <td>{Number(p.total_price).toLocaleString()} SAR</td>
                  <td><span className={`badge ${p.status === 'Published' ? 'badge--green' : 'badge--gray'}`}>{p.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Link className="btn btn--outline btn--sm" to={`/trips/${p.plan_id}`}>View</Link>
                      <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(p)}>Delete</button>
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
          title="Delete Plan?"
          body={`Delete "${deleteTarget.title}" permanently? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </AdminLayout>
  );
}
