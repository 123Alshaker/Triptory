import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPlans, getAllUsers, localSavedPlans } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import TripCard from '../components/TripCard';

export default function SavedPlans() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([getAllPlans(), getAllUsers()])
      .then(([p, u]) => { setPlans(p || []); setUsers(u || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadData, [user.user_id]);

  const savedIds = localSavedPlans.getByUser(user.user_id).map(s => s.plan_id);
  const savedPlans = plans.filter(p => savedIds.includes(p.plan_id));
  const getUserName = (uid) => users.find(u => u.user_id === uid)?.name || 'Traveler';

  const unsave = (plan) => {
    localSavedPlans.unsave(user.user_id, plan.plan_id);
    setPlans(prev => [...prev]); // force re-render
    addToast(`Removed "${plan.title}" from saved trips`);
  };

  // Recompute on each render since we modify localStorage
  const currentSavedIds = localSavedPlans.getByUser(user.user_id).map(s => s.plan_id);
  const currentSaved = plans.filter(p => currentSavedIds.includes(p.plan_id));

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>❤️ Saved Trips</h1>
          <p>Your collection of bookmarked travel plans</p>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div> Loading saved trips…</div>
        ) : currentSaved.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🤍</div>
            <h3>No saved trips yet</h3>
            <p>Browse trips and click "Save Trip" to add them to your collection</p>
            <Link className="btn btn--primary mt-2" to="/explore">Explore Trips</Link>
          </div>
        ) : (
          <div className="grid grid--3">
            {currentSaved.map(plan => (
              <TripCard
                key={plan.plan_id}
                plan={plan}
                authorName={getUserName(plan.user_id)}
                actions={
                  <button className="btn btn--ghost btn--sm" onClick={() => unsave(plan)}>🤍 Unsave</button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
