import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPlans, localSavedPlans, localComments } from '../api';
import { useAuth } from '../contexts/AuthContext';
import TripCard from '../components/TripCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPlans()
      .then(p => setPlans(p || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const myPlans = plans.filter(p => p.user_id === user.user_id);
  const savedIds = localSavedPlans.getByUser(user.user_id).map(s => s.plan_id);
  const savedPlans = plans.filter(p => savedIds.includes(p.plan_id));
  const myCommentCount = localComments.getByPlan(0)?.length || 0; // approximation

  const recentActivity = plans
    .filter(p => savedIds.includes(p.plan_id))
    .slice(0, 3);

  return (
    <div className="page">
      <div className="container">
        {/* Welcome */}
        <div style={{ marginBottom: '2rem' }}>
          <h1>Welcome back, {user.name}! 👋</h1>
          <p className="text-muted">Here's your travel hub at a glance</p>
        </div>

        {/* Stats */}
        <div className="grid grid--4" style={{ marginBottom: '2.5rem' }}>
          {[
            { icon: '🗺️', label: 'My Plans', value: myPlans.length },
            { icon: '❤️', label: 'Saved Plans', value: savedIds.length },
            { icon: '✅', label: 'Published', value: myPlans.filter(p => p.status === 'Published').length },
            { icon: '📝', label: 'Drafts', value: myPlans.filter(p => p.status === 'Draft').length },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-card__icon">{s.icon}</div>
              <div>
                <div className="stat-card__value">{loading ? '…' : s.value}</div>
                <div className="stat-card__label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="info-box" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link className="btn btn--primary" to="/create-plan">+ Create New Trip</Link>
            <Link className="btn btn--outline" to="/explore">🔍 Browse Trips</Link>
            <Link className="btn btn--ghost" to="/my-plans">📋 My Plans</Link>
            <Link className="btn btn--ghost" to="/saved">❤️ Saved Plans</Link>
            <Link className="btn btn--ghost" to="/profile">👤 My Profile</Link>
          </div>
        </div>

        {/* My recent plans */}
        {myPlans.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.4rem' }}>My Recent Plans</h2>
              <Link className="btn btn--ghost btn--sm" to="/my-plans">View All →</Link>
            </div>
            {loading ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : (
              <div className="grid grid--3">
                {myPlans.slice(0, 3).map(plan => (
                  <TripCard key={plan.plan_id} plan={plan} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved plans */}
        {savedPlans.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.4rem' }}>Recently Saved</h2>
              <Link className="btn btn--ghost btn--sm" to="/saved">View All →</Link>
            </div>
            <div className="grid grid--3">
              {recentActivity.map(plan => (
                <TripCard key={plan.plan_id} plan={plan} />
              ))}
            </div>
          </div>
        )}

        {myPlans.length === 0 && savedPlans.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state__icon">✈️</div>
            <h3>Your journey starts here</h3>
            <p>Create your first trip or explore plans shared by the community</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              <Link className="btn btn--primary" to="/create-plan">Create a Trip</Link>
              <Link className="btn btn--outline" to="/explore">Explore Trips</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
