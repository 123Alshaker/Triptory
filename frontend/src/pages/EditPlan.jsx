import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPlanById, createPlan, deletePlan, localPlanDays, localActivities } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function EditPlan() {
  const { id } = useParams();
  const planId = parseInt(id);
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: '', destination: '', total_price: '', status: 'Draft', notes: '' });
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getPlanById(planId)])
      .then(([plan]) => {
        if (!plan || plan.user_id !== user.user_id) { navigate('/my-plans'); return; }
        setForm({ title: plan.title, destination: plan.destination, total_price: plan.total_price, status: plan.status, notes: plan.notes || '' });
        const d = localPlanDays.getByPlan(planId).sort((a, b) => a.day_number - b.day_number);
        setDays(d.map(day => ({ ...day, activities: localActivities.getByDay(day.day_id) })));
      })
      .catch(() => navigate('/my-plans'))
      .finally(() => setLoading(false));
  }, [planId]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addDay = () => setDays(prev => [...prev, { day_number: prev.length + 1, activities: [{ title: '', description: '', price: '' }] }]);
  const removeDay = (i) => setDays(prev => prev.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day_number: idx + 1 })));
  const addActivity = (dayIdx) => setDays(prev => prev.map((d, i) => i === dayIdx ? { ...d, activities: [...d.activities, { title: '', description: '', price: '' }] } : d));
  const removeActivity = (dayIdx, actIdx) => setDays(prev => prev.map((d, i) => i === dayIdx ? { ...d, activities: d.activities.filter((_, ai) => ai !== actIdx) } : d));
  const setActivity = (dayIdx, actIdx, field, val) => setDays(prev => prev.map((d, i) => i === dayIdx ? { ...d, activities: d.activities.map((a, ai) => ai === actIdx ? { ...a, [field]: val } : a) } : d));

  const save = async () => {
    if (!form.title.trim() || !form.destination.trim()) { setError('Title and destination are required.'); return; }
    setSaving(true);
    setError('');
    try {
      // Delete old plan and recreate (API limitation: no PUT endpoint)
      await deletePlan(planId);
      localPlanDays.deleteByPlan(planId);

      const newPlan = await createPlan({
        title: form.title.trim(),
        destination: form.destination.trim(),
        total_price: parseFloat(form.total_price) || 0,
        status: form.status,
        user_id: user.user_id,
        notes: form.notes.trim(),
      });

      days.forEach(day => {
        const newDay = localPlanDays.add({ day_number: day.day_number, plan_id: newPlan.plan_id });
        day.activities.filter(a => a.title?.trim()).forEach(act => {
          localActivities.add({ title: act.title.trim(), description: act.description?.trim() || '', price: parseFloat(act.price) || 0, day_id: newDay.day_id });
        });
      });

      addToast('Trip updated successfully!');
      navigate(`/trips/${newPlan.plan_id}`);
    } catch (e) {
      setError(e.message || 'Failed to update the trip.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div> Loading trip…</div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '720px' }}>
        <div className="page-header">
          <h1>Edit Trip</h1>
          <p>Update your travel plan details</p>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="info-box" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.2rem' }}>Basic Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-group">
              <label className="form-label">Trip Title</label>
              <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Destination</label>
              <input className="form-input" value={form.destination} onChange={e => set('destination', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Total Budget (SAR)</label>
              <input className="form-input" type="number" min="0" value={form.total_price} onChange={e => set('total_price', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Tips, recommendations, or anything else travelers should know…"
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="info-box" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.2rem' }}>Day-by-Day Itinerary</h3>
          {days.map((day, dayIdx) => (
            <div key={dayIdx} className="day-block">
              <div className="day-block__header">
                <span>Day {day.day_number}</span>
                <button type="button" className="btn btn--danger btn--sm" onClick={() => removeDay(dayIdx)}>Remove</button>
              </div>
              <div className="day-block__body">
                {day.activities.map((act, actIdx) => (
                  <div key={actIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 100px auto', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <input className="form-input" placeholder="Activity" value={act.title} onChange={e => setActivity(dayIdx, actIdx, 'title', e.target.value)} />
                    <input className="form-input" placeholder="Description" value={act.description} onChange={e => setActivity(dayIdx, actIdx, 'description', e.target.value)} />
                    <input className="form-input" type="number" placeholder="SAR" value={act.price} onChange={e => setActivity(dayIdx, actIdx, 'price', e.target.value)} />
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeActivity(dayIdx, actIdx)}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => addActivity(dayIdx)}>+ Add Activity</button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn--outline btn--sm" onClick={addDay}>+ Add Day</button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="btn btn--ghost" onClick={() => navigate('/my-plans')}>Cancel</button>
          <button className="btn btn--primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
