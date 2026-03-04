import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllPlans, getAllUsers, localRatings } from '../api';
import TripCard from '../components/TripCard';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    destination: '',
    minBudget: '',
    maxBudget: '',
    minRating: '',
    sortBy: 'recent',
  });

  useEffect(() => {
    Promise.all([getAllPlans(), getAllUsers()])
      .then(([p, u]) => { setPlans(p || []); setUsers(u || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getUserName = (uid) => users.find(u => u.user_id === uid)?.name || 'Traveler';

  const filtered = useMemo(() => {
    let result = plans.filter(p => p.status === 'Published');

    if (filters.q) {
      const q = filters.q.toLowerCase();
      result = result.filter(p =>
        p.title?.toLowerCase().includes(q) || p.destination?.toLowerCase().includes(q)
      );
    }
    if (filters.destination) {
      result = result.filter(p => p.destination?.toLowerCase().includes(filters.destination.toLowerCase()));
    }
    if (filters.minBudget) result = result.filter(p => Number(p.total_price) >= Number(filters.minBudget));
    if (filters.maxBudget) result = result.filter(p => Number(p.total_price) <= Number(filters.maxBudget));
    if (filters.minRating) {
      result = result.filter(p => localRatings.avgScore(p.plan_id) >= Number(filters.minRating));
    }

    if (filters.sortBy === 'rating') result.sort((a, b) => localRatings.avgScore(b.plan_id) - localRatings.avgScore(a.plan_id));
    else if (filters.sortBy === 'price_asc') result.sort((a, b) => a.total_price - b.total_price);
    else if (filters.sortBy === 'price_desc') result.sort((a, b) => b.total_price - a.total_price);
    else result.sort((a, b) => b.plan_id - a.plan_id); // recent

    return result;
  }, [plans, filters]);

  const set = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  const clearFilters = () => {
    setFilters({ q: '', destination: '', minBudget: '', maxBudget: '', minRating: '', sortBy: 'recent' });
    setSearchParams({});
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Explore Trips</h1>
          <p>Discover authentic travel experiences shared by our community</p>
        </div>

        <div className="explore-layout">
          {/* Filters */}
          <aside className="filters-panel">
            <h3>Filters</h3>

            <div className="filter-group">
              <label>Search</label>
              <input className="form-input" placeholder="Keyword or destination…" value={filters.q}
                onChange={e => { set('q', e.target.value); setSearchParams({ q: e.target.value }); }} />
            </div>

            <div className="filter-group">
              <label>Destination</label>
              <input className="form-input" placeholder="e.g. Dubai, Paris…" value={filters.destination}
                onChange={e => set('destination', e.target.value)} />
            </div>

            <div className="filter-group">
              <label>Budget (SAR)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="form-input" type="number" placeholder="Min" value={filters.minBudget} onChange={e => set('minBudget', e.target.value)} />
                <input className="form-input" type="number" placeholder="Max" value={filters.maxBudget} onChange={e => set('maxBudget', e.target.value)} />
              </div>
            </div>

            <div className="filter-group">
              <label>Min Rating</label>
              <select className="form-select" value={filters.minRating} onChange={e => set('minRating', e.target.value)}>
                <option value="">Any</option>
                <option value="1">1+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="5">5 Stars only</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select className="form-select" value={filters.sortBy} onChange={e => set('sortBy', e.target.value)}>
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Budget: Low to High</option>
                <option value="price_desc">Budget: High to Low</option>
              </select>
            </div>

            <button className="btn btn--ghost w-full" onClick={clearFilters}>Clear Filters</button>
          </aside>

          {/* Results */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                {loading ? 'Loading…' : `${filtered.length} trip${filtered.length !== 1 ? 's' : ''} found`}
              </span>
            </div>

            {loading ? (
              <div className="loading"><div className="spinner"></div> Loading trips…</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🔍</div>
                <h3>No trips found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button className="btn btn--outline mt-2" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid--3">
                {filtered.map(plan => (
                  <TripCard key={plan.plan_id} plan={plan} authorName={getUserName(plan.user_id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
