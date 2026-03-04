import { Link } from 'react-router-dom';
import { localRatings } from '../api';

const DEST_EMOJIS = { default: '✈️', beach: '🏖️', mountain: '🏔️', city: '🏙️', desert: '🏜️', forest: '🌲' };

function getEmoji(destination) {
  if (!destination) return DEST_EMOJIS.default;
  const d = destination.toLowerCase();
  if (d.includes('beach') || d.includes('sea') || d.includes('مالديف') || d.includes('بحر')) return DEST_EMOJIS.beach;
  if (d.includes('mountain') || d.includes('جبل')) return DEST_EMOJIS.mountain;
  if (d.includes('dubai') || d.includes('riyadh') || d.includes('city') || d.includes('مدينة')) return DEST_EMOJIS.city;
  if (d.includes('desert') || d.includes('صحراء')) return DEST_EMOJIS.desert;
  if (d.includes('forest') || d.includes('غابة')) return DEST_EMOJIS.forest;
  return DEST_EMOJIS.default;
}

function Stars({ score }) {
  return (
    <span className="stars stars--sm">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(score) ? '' : 'star--empty'}>★</span>
      ))}
    </span>
  );
}

export default function TripCard({ plan, authorName, actions }) {
  const avg = localRatings.avgScore(plan.plan_id);
  const ratings = localRatings.getByPlan(plan.plan_id);

  return (
    <div className="card trip-card">
      <div className="trip-card__img-placeholder">
        {getEmoji(plan.destination)}
      </div>
      <div className="trip-card__body">
        <div className="trip-card__title">{plan.title}</div>
        <div className="trip-card__meta">
          <span className="badge badge--teal">📍 {plan.destination}</span>
          <span className="badge badge--gold">💰 {Number(plan.total_price).toLocaleString()} SAR</span>
          <span className={`badge ${plan.status === 'Published' ? 'badge--green' : 'badge--gray'}`}>
            {plan.status === 'Published' ? '✓ Published' : '📝 Draft'}
          </span>
        </div>
        {authorName && <div className="trip-card__author">by {authorName}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Stars score={avg} />
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>
            {avg > 0 ? avg.toFixed(1) : 'No ratings'} {ratings.length > 0 && `(${ratings.length})`}
          </span>
        </div>
      </div>
      <div className="trip-card__footer">
        <Link className="btn btn--outline btn--sm" to={`/trips/${plan.plan_id}`}>View Trip</Link>
        {actions && <div style={{ display: 'flex', gap: '0.4rem' }}>{actions}</div>}
      </div>
    </div>
  );
}
