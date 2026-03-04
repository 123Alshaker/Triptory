import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPlanById, getAllUsers, localPlanDays, localActivities, localComments, localSavedPlans, localRatings, localNotifications } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

function Stars({ interactive, value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <span className="stars" style={{ cursor: interactive ? 'pointer' : 'default', fontSize: interactive ? '1.6rem' : '1rem' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i}
          className={i <= (hovered || value) ? '' : 'star--empty'}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange(i)}
        >★</span>
      ))}
    </span>
  );
}

function Accordion({ day, activities }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="accordion-item">
      <div className="accordion-header" onClick={() => setOpen(o => !o)}>
        <span>Day {day.day_number}</span>
        <span>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="accordion-body">
          {activities.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>No activities listed for this day.</p>
          ) : activities.map(act => (
            <div key={act.activity_id} className="activity-item">
              <div className="activity-item__title">{act.title}</div>
              {act.description && <div className="activity-item__desc">{act.description}</div>}
              {act.price > 0 && <div className="text-muted" style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>💰 {Number(act.price).toLocaleString()} SAR</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TripDetail() {
  const { id } = useParams();
  const planId = parseInt(id);
  const { user } = useAuth();
  const { addToast } = useToast();

  const [plan, setPlan] = useState(null);
  const [author, setAuthor] = useState(null);
  const [days, setDays] = useState([]);
  const [activitiesMap, setActivitiesMap] = useState({});
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const loadData = async () => {
    try {
      const [p, us] = await Promise.all([getPlanById(planId), getAllUsers()]);
      if (!p) { setNotFound(true); return; }
      setPlan(p);
      setUsers(us || []);
      setAuthor((us || []).find(u => u.user_id === p.user_id));

      const d = localPlanDays.getByPlan(planId).sort((a, b) => a.day_number - b.day_number);
      setDays(d);
      const am = {};
      d.forEach(day => { am[day.day_id] = localActivities.getByDay(day.day_id); });
      setActivitiesMap(am);
      setComments(localComments.getByPlan(planId));
      setAvgRating(localRatings.avgScore(planId));
      if (user) {
        const r = localRatings.getUserRating(user.user_id, planId);
        setUserRating(r?.score || 0);
        setIsSaved(localSavedPlans.isSaved(user.user_id, planId));
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [planId, user]);

  const getUserName = (uid) => users.find(u => u.user_id === uid)?.name || 'Traveler';

  const handleRate = (score) => {
    if (!user) { addToast('Please log in to rate trips', 'error'); return; }
    localRatings.rate(user.user_id, planId, score);
    setUserRating(score);
    setAvgRating(localRatings.avgScore(planId));
    // Notify plan owner
    if (plan && plan.user_id !== user.user_id) {
      localNotifications.add(plan.user_id, `${user.name} rated your trip "${plan.title}" ${score}/5 stars`);
    }
    addToast('Rating submitted!');
  };

  const handleSave = () => {
    if (!user) { addToast('Please log in to save trips', 'error'); return; }
    if (isSaved) {
      localSavedPlans.unsave(user.user_id, planId);
      setIsSaved(false);
      addToast('Removed from saved trips');
    } else {
      localSavedPlans.save(user.user_id, planId);
      setIsSaved(true);
      if (plan && plan.user_id !== user.user_id) {
        localNotifications.add(plan.user_id, `${user.name} saved your trip "${plan.title}"`);
      }
      addToast('Trip saved to your collection!');
    }
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    const newComment = localComments.add({ content: commentText.trim(), user_id: user.user_id, plan_id: planId });
    setComments(localComments.getByPlan(planId));
    setCommentText('');
    setSubmittingComment(false);
    if (plan && plan.user_id !== user.user_id) {
      localNotifications.add(plan.user_id, `${user.name} commented on your trip "${plan.title}"`);
    }
    addToast('Comment posted!');
  };

  if (loading) return <div className="loading"><div className="spinner"></div> Loading trip…</div>;
  if (notFound) return (
    <div className="page">
      <div className="container">
        <div className="empty-state">
          <div className="empty-state__icon">🗺️</div>
          <h3>Trip not found</h3>
          <p>This trip may have been removed or doesn't exist.</p>
          <Link className="btn btn--primary mt-2" to="/explore">Browse Trips</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        {/* Hero */}
        <div className="trip-detail__hero">✈️</div>

        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>{plan.title}</h1>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge badge--teal">📍 {plan.destination}</span>
              <span className="badge badge--gold">💰 {Number(plan.total_price).toLocaleString()} SAR</span>
              <span className={`badge ${plan.status === 'Published' ? 'badge--green' : 'badge--gray'}`}>{plan.status}</span>
              <span className="stars" style={{ fontSize: '1rem' }}>
                {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
                <span className="text-muted" style={{ marginLeft: '0.4rem', fontSize: '0.85rem' }}>
                  {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings yet'}
                </span>
              </span>
            </div>
          </div>
          <button
            className={`btn ${isSaved ? 'btn--accent' : 'btn--outline'} btn--lg`}
            onClick={handleSave}
          >
            {isSaved ? '❤️ Saved' : '🤍 Save Trip'}
          </button>
        </div>

        <div className="trip-detail__grid">
          {/* Main content */}
          <div>
            {/* Itinerary */}
            <div className="info-box" style={{ marginBottom: '1.5rem' }}>
              <h3>📅 Day-by-Day Itinerary</h3>
              {days.length === 0 ? (
                <p className="text-muted">No detailed itinerary has been added yet.</p>
              ) : days.map(day => (
                <Accordion key={day.day_id} day={day} activities={activitiesMap[day.day_id] || []} />
              ))}
            </div>

            {/* Rate this trip */}
            <div className="info-box" style={{ marginBottom: '1.5rem' }}>
              <h3>⭐ Rate this Trip</h3>
              {user ? (
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>Your rating:</p>
                  <Stars interactive value={userRating} onChange={handleRate} />
                  {userRating > 0 && <p className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>You rated this {userRating}/5 stars</p>}
                </div>
              ) : (
                <div className="alert alert--info">
                  <Link to="/login">Log in</Link> to rate this trip
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="info-box">
              <h3>💬 Comments ({comments.length})</h3>
              {user ? (
                <form onSubmit={submitComment} style={{ marginBottom: '1.5rem' }}>
                  <textarea
                    className="form-textarea"
                    placeholder="Share your thoughts about this trip…"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    rows={3}
                  />
                  <button className="btn btn--primary btn--sm mt-1" type="submit" disabled={submittingComment || !commentText.trim()}>
                    Post Comment
                  </button>
                </form>
              ) : (
                <div className="alert alert--info mb-2">
                  <Link to="/login">Log in</Link> to leave a comment
                </div>
              )}
              {comments.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>No comments yet. Be the first!</p>
              ) : comments.map(c => (
                <div key={c.comment_id} className="comment">
                  <div className="comment__header">
                    <span className="comment__author">{getUserName(c.user_id)}</span>
                    <span className="comment__date">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p>{c.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="trip-detail__sidebar">
            {/* Author */}
            <div className="info-box">
              <h3>👤 About the Author</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="profile-avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                  {author?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{author?.name || 'Unknown'}</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>Traveler</div>
                </div>
              </div>
            </div>

            {/* Trip Info */}
            <div className="info-box">
              <h3>ℹ️ Trip Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Destination', value: plan.destination },
                  { label: 'Total Budget', value: `${Number(plan.total_price).toLocaleString()} SAR` },
                  { label: 'Duration', value: `${days.length} day${days.length !== 1 ? 's' : ''}` },
                  { label: 'Status', value: plan.status },
                  { label: 'Average Rating', value: avgRating > 0 ? `${avgRating.toFixed(1)} / 5` : 'Not rated yet' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span className="text-muted">{item.label}</span>
                    <span style={{ fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="info-box">
              <h3>🔗 Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className={`btn w-full ${isSaved ? 'btn--accent' : 'btn--outline'}`} onClick={handleSave} style={{ justifyContent: 'center' }}>
                  {isSaved ? '❤️ Saved' : '🤍 Save this Trip'}
                </button>
                <Link to="/explore" className="btn btn--ghost w-full" style={{ justifyContent: 'center' }}>← Browse More Trips</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
