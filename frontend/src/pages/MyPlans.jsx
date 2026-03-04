import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllPlans, deletePlan, localPlanDays } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Modal from '../components/Modal';
import TripCard from '../components/TripCard';

export default function MyPlans() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadPlans = () => {
    getAllPlans()
      .then(p => setPlans((p || []).filter(plan => plan.user_id === user.user_id)))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadPlans, [user.user_id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePlan(deleteTarget.plan_id);
      localPlanDays.deleteByPlan(deleteTarget.plan_id);
      setPlans(prev => prev.filter(p => p.plan_id !== deleteTarget.plan_id));
      addToast('Trip deleted.');
    } catch {
      addToast('Failed to delete trip.', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>My Plans</h1>
            <p>Manage your created travel itineraries</p>
          </div>
          <Link className="btn btn--primary" to="/create-plan">+ Create New Trip</Link>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div> Loading your plans…</div>
        ) : plans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🗺️</div>
            <h3>No trips yet</h3>
            <p>Start sharing your travel experiences with the community</p>
            <Link className="btn btn--primary mt-2" to="/create-plan">Create Your First Trip</Link>
          </div>
        ) : (
          <div className="grid grid--3">
            {plans.map(plan => (
              <TripCard
                key={plan.plan_id}
                plan={plan}
                actions={
                  <>
                    <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/edit-plan/${plan.plan_id}`)}>✏️ Edit</button>
                    <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(plan)}>🗑️</button>
                  </>
                }
              />
            ))}
          </div>
        )}

        {deleteTarget && (
          <Modal
            title="Delete Trip?"
            body={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
            confirmLabel="Delete"
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleting}
          />
        )}
      </div>
    </div>
  );
}
