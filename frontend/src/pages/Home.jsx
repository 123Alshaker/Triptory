import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllPlans, getAllUsers, localRatings } from '../api';
import TripCard from '../components/TripCard';

function LoadingSpinner() {
  return <div className="loading"><div className="spinner"></div> Loading trips…</div>;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getAllPlans(), getAllUsers()])
      .then(([p, u]) => { setPlans(p || []); setUsers(u || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/explore?q=${encodeURIComponent(query)}`);
  };

  // Top rated published plans
  const published = plans.filter(p => p.status === 'Published');
  const featured = [...published]
    .sort((a, b) => localRatings.avgScore(b.plan_id) - localRatings.avgScore(a.plan_id))
    .slice(0, 6);

  const getUserName = (userId) => users.find(u => u.user_id === userId)?.name || 'Traveler';

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero__content">
          <h1 className="hero__title">Discover Real Trips,<br />Shared by Real Travelers</h1>
          <p className="hero__subtitle">
            Triptory is a community-driven platform where travelers share authentic, experience-based itineraries — not ads.
          </p>
          <form className="hero__search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search destinations, trips, experiences…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search trips"
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--primary-dark)', color: '#fff', padding: '1.5rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', textAlign: 'center' }}>
          {[
            { val: users.length, label: 'Travelers' },
            { val: published.length, label: 'Published Trips' },
            { val: plans.reduce((sum) => sum + 1, 0), label: 'Destinations Shared' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700 }}>{s.val}</div>
              <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Featured Trips ───────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Trending Trips</h2>
          <p className="section-subtitle">Hand-picked itineraries from our community of travelers</p>
          {loading ? <LoadingSpinner /> : featured.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">✈️</div>
              <h3>No trips yet</h3>
              <p>Be the first to share a travel plan!</p>
              <Link className="btn btn--primary mt-2" to="/register">Share Your Trip</Link>
            </div>
          ) : (
            <div className="grid grid--3">
              {featured.map(plan => (
                <TripCard key={plan.plan_id} plan={plan} authorName={getUserName(plan.user_id)} />
              ))}
            </div>
          )}
          {!loading && published.length > 6 && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link className="btn btn--outline btn--lg" to="/explore">Browse All Trips</Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--primary-light)' }}>
        <div className="container">
          <h2 className="section-title">How Triptory Works</h2>
          <p className="section-subtitle">Three simple steps to start your journey</p>
          <div className="grid grid--3">
            {[
              { num: 1, icon: '✍️', title: 'Share Your Trip', desc: 'Create a detailed, day-by-day itinerary of your travel experience — costs, activities, tips and all.' },
              { num: 2, icon: '🔍', title: 'Discover & Explore', desc: 'Browse thousands of authentic trips shared by real travelers. Filter by destination, budget, or duration.' },
              { num: 3, icon: '🗺️', title: 'Plan Your Next Adventure', desc: 'Save trips you love, rate and comment on plans, and build your perfect journey with peer insights.' },
            ].map(step => (
              <div className="how-step" key={step.num}>
                <div className="how-step__num">{step.num}</div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem' }}>Ready to Share Your Journey?</h2>
          <p className="text-muted" style={{ maxWidth: '500px', margin: '0 auto 2rem' }}>
            Join thousands of travelers who are already sharing authentic, experience-based travel plans.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="btn btn--primary btn--lg" to="/register">Get Started Free</Link>
            <Link className="btn btn--outline btn--lg" to="/explore">Browse Trips</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
