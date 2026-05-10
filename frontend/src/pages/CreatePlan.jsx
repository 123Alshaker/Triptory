import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPlan, localPlanDays, localActivities, localMedia } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const STEPS = ['Basic Info', 'Itinerary', 'Photos', 'Review & Publish'];

function Step1({ form, set }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div className="form-group">
        <label className="form-label">Trip Title *</label>
        <input className="form-input" placeholder="e.g. 7 Days in Bali on a Budget" value={form.title} onChange={e => set('title', e.target.value)} required />
      </div>
      <div className="form-group">
        <label className="form-label">Destination *</label>
        <input className="form-input" placeholder="e.g. Bali, Indonesia" value={form.destination} onChange={e => set('destination', e.target.value)} required />
      </div>
      <div className="form-group">
        <label className="form-label">Total Budget (SAR) *</label>
        <input className="form-input" type="number" min="0" placeholder="0" value={form.total_price} onChange={e => set('total_price', e.target.value)} required />
      </div>
      <div className="form-group">
        <label className="form-label">Status</label>
        <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="Draft">Save as Draft</option>
          <option value="Published">Publish Now</option>
        </select>
        <span className="form-hint">You can change this later from My Plans</span>
      </div>
    </div>
  );
}

function Step2({ days, setDays }) {
  const addDay = () => {
    setDays(prev => [...prev, { day_number: prev.length + 1, activities: [{ title: '', description: '', price: '' }] }]);
  };
  const removeDay = (i) => setDays(prev => prev.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day_number: idx + 1 })));
  const addActivity = (dayIdx) => setDays(prev => prev.map((d, i) => i === dayIdx ? { ...d, activities: [...d.activities, { title: '', description: '', price: '' }] } : d));
  const removeActivity = (dayIdx, actIdx) => setDays(prev => prev.map((d, i) => i === dayIdx ? { ...d, activities: d.activities.filter((_, ai) => ai !== actIdx) } : d));
  const setActivity = (dayIdx, actIdx, field, val) => setDays(prev => prev.map((d, i) => i === dayIdx ? { ...d, activities: d.activities.map((a, ai) => ai === actIdx ? { ...a, [field]: val } : a) } : d));

  return (
    <div>
      {days.map((day, dayIdx) => (
        <div key={dayIdx} className="day-block">
          <div className="day-block__header">
            <span>Day {day.day_number}</span>
            <button type="button" className="btn btn--danger btn--sm" onClick={() => removeDay(dayIdx)}>Remove Day</button>
          </div>
          <div className="day-block__body">
            {day.activities.map((act, actIdx) => (
              <div key={actIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 100px auto', gap: '0.5rem', alignItems: 'flex-start' }}>
                <input className="form-input" placeholder="Activity title" value={act.title} onChange={e => setActivity(dayIdx, actIdx, 'title', e.target.value)} />
                <input className="form-input" placeholder="Description (optional)" value={act.description} onChange={e => setActivity(dayIdx, actIdx, 'description', e.target.value)} />
                <input className="form-input" type="number" placeholder="SAR" min="0" value={act.price} onChange={e => setActivity(dayIdx, actIdx, 'price', e.target.value)} />
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeActivity(dayIdx, actIdx)} title="Remove">✕</button>
              </div>
            ))}
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => addActivity(dayIdx)}>+ Add Activity</button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn--outline" onClick={addDay}>+ Add Day</button>
      {days.length === 0 && <p className="text-muted mt-1" style={{ fontSize: '0.9rem' }}>Add at least one day to your itinerary.</p>}
    </div>
  );
}

function Step3Photos({ images, setImages }) {
  const [dragOver, setDragOver] = useState(false);

  const readFiles = (files) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, { dataUrl: e.target.result, fileName: file.name, size: file.size }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInput = (e) => readFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    readFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          Upload photos from your trip. These will be displayed in the trip detail page. You can upload multiple images.
        </p>

        {/* Drop zone */}
        <label
          className={`upload-dropzone${dragOver ? ' upload-dropzone--active' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          <div className="upload-dropzone__icon">🖼️</div>
          <div className="upload-dropzone__text">
            <strong>Click to upload</strong> or drag and drop images here
          </div>
          <div className="upload-dropzone__hint">PNG, JPG, WEBP supported</div>
        </label>
      </div>

      {/* Previews */}
      {images.length > 0 && (
        <div>
          <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>
            {images.length} image{images.length !== 1 ? 's' : ''} selected
          </p>
          <div className="upload-preview-grid">
            {images.map((img, idx) => (
              <div key={idx} className="upload-preview-item">
                <img src={img.dataUrl} alt={img.fileName} className="upload-preview-img" />
                <button
                  type="button"
                  className="upload-preview-remove"
                  onClick={() => removeImage(idx)}
                  title="Remove image"
                >✕</button>
                <div className="upload-preview-name">{img.fileName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          No images uploaded yet. You can skip this step — photos are optional.
        </p>
      )}
    </div>
  );
}

function Step4({ form, days, images }) {
  return (
    <div>
      <div className="alert alert--info mb-2">Please review your trip before submitting.</div>
      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Basic Info</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
          <div><strong>Title:</strong> {form.title || '—'}</div>
          <div><strong>Destination:</strong> {form.destination || '—'}</div>
          <div><strong>Budget:</strong> {form.total_price ? `${Number(form.total_price).toLocaleString()} SAR` : '—'}</div>
          <div><strong>Status:</strong> <span className={`badge ${form.status === 'Published' ? 'badge--green' : 'badge--gray'}`}>{form.status}</span></div>
        </div>
      </div>
      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Itinerary ({days.length} days)</h3>
        {days.length === 0 ? <p className="text-muted">No days added.</p> : days.map((day, i) => (
          <div key={i} style={{ marginBottom: '0.75rem' }}>
            <strong>Day {day.day_number}:</strong>
            {day.activities.filter(a => a.title).length === 0
              ? <span className="text-muted"> No activities</span>
              : day.activities.filter(a => a.title).map((a, ai) => (
                <span key={ai} style={{ display: 'inline-block', marginLeft: '0.5rem' }} className="badge badge--teal">{a.title}</span>
              ))}
          </div>
        ))}
      </div>
      <div className="info-box">
        <h3 style={{ marginBottom: '1rem' }}>Photos ({images.length})</h3>
        {images.length === 0 ? (
          <p className="text-muted">No photos uploaded.</p>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {images.map((img, i) => (
              <img key={i} src={img.dataUrl} alt={img.fileName}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '2px solid var(--border)' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreatePlan() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title: '', destination: '', total_price: '', status: 'Draft' });
  const [days, setDays] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    if (step === 0) {
      if (!form.title.trim()) return 'Please enter a trip title.';
      if (!form.destination.trim()) return 'Please enter a destination.';
      if (!form.total_price || isNaN(form.total_price)) return 'Please enter a valid budget.';
    }
    return '';
  };

  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => { setError(''); setStep(s => Math.max(s - 1, 0)); };

  const submit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const newPlan = await createPlan({
        title: form.title.trim(),
        destination: form.destination.trim(),
        total_price: parseFloat(form.total_price) || 0,
        status: form.status,
        user_id: user.user_id,
      });

      // Save days & activities
      days.forEach(day => {
        const newDay = localPlanDays.add({ day_number: day.day_number, plan_id: newPlan.plan_id });
        day.activities.filter(a => a.title.trim()).forEach(act => {
          localActivities.add({ title: act.title.trim(), description: act.description.trim(), price: parseFloat(act.price) || 0, day_id: newDay.day_id });
        });
      });

      // Save images
      images.forEach(img => {
        localMedia.add(newPlan.plan_id, img.dataUrl, img.fileName);
      });

      addToast(form.status === 'Published' ? 'Trip published successfully! 🎉' : 'Trip saved as draft!');
      navigate(`/trips/${newPlan.plan_id}`);
    } catch (e) {
      setError(e.message || 'Failed to save the trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '720px' }}>
        <div className="page-header">
          <h1>Create New Trip</h1>
          <p>Share your travel experience with the community</p>
        </div>

        {/* Steps bar */}
        <div className="steps-bar">
          {STEPS.map((label, i) => (
            <button key={i} type="button" className={`step-tab ${i === step ? 'step-tab--active' : i < step ? 'step-tab--done' : ''}`}>
              {i < step ? '✓ ' : `${i + 1}. `}{label}
            </button>
          ))}
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="info-box" style={{ marginBottom: '1.5rem' }}>
          {step === 0 && <Step1 form={form} set={set} />}
          {step === 1 && <Step2 days={days} setDays={setDays} />}
          {step === 2 && <Step3Photos images={images} setImages={setImages} />}
          {step === 3 && <Step4 form={form} days={days} images={images} />}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn--ghost" onClick={prev} disabled={step === 0}>← Back</button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn--primary" onClick={next}>Next →</button>
          ) : (
            <button className="btn btn--accent btn--lg" onClick={submit} disabled={loading}>
              {loading ? 'Saving…' : form.status === 'Published' ? '🚀 Publish Trip' : '💾 Save Draft'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
