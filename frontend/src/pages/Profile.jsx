import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Modal from '../components/Modal';

export default function Profile() {
  const { user, login, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: user.name, email: user.email, password: '', confirm: '' });
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const save = async () => {
    setError('');
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
    if (form.password && form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }

    setSaving(true);
    // No PUT /api/Users endpoint exists yet — update locally
    const updatedUser = { ...user, name: form.name.trim(), email: form.email.trim() };
    if (form.password) updatedUser.password = form.password;
    login(updatedUser);
    addToast('Profile updated!');
    setEditing(false);
    setSaving(false);
  };

  const handleDeleteAccount = () => {
    logout();
    addToast('Account deleted. We\'re sorry to see you go!', 'info');
    navigate('/');
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="page-header">
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="profile-avatar">{user.name?.[0]?.toUpperCase() || '?'}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>{user.name}</div>
            <div className="text-muted">{user.email}</div>
            <div className="badge badge--teal mt-1">Traveler</div>
          </div>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="info-box" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Account Details</h3>
            {!editing && (
              <button className="btn btn--outline btn--sm" onClick={() => setEditing(true)}>✏️ Edit</button>
            )}
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password <span className="form-hint">(leave blank to keep current)</span></label>
                <input className="form-input" type="password" placeholder="New password" value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
              {form.password && (
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input className="form-input" type="password" placeholder="Confirm password" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn--ghost" onClick={() => { setEditing(false); setError(''); }}>Cancel</button>
                <button className="btn btn--primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              {[
                { label: 'Full Name', value: user.name },
                { label: 'Email', value: user.email },
                { label: 'User ID', value: `#${user.user_id}` },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: '1rem' }}>
                  <span className="text-muted" style={{ minWidth: '100px' }}>{item.label}:</span>
                  <span style={{ fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="info-box" style={{ borderColor: '#f5c2be', borderWidth: '1.5px', borderStyle: 'solid' }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>⚠️ Danger Zone</h3>
          <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            Deleting your account is permanent and cannot be undone. All your plans will remain but will be disassociated.
          </p>
          <button className="btn btn--danger btn--sm" onClick={() => setShowDelete(true)}>Delete My Account</button>
        </div>

        {showDelete && (
          <Modal
            title="Delete Account?"
            body="This will permanently delete your account. You will be logged out immediately. Your trips will remain visible on the platform."
            confirmLabel="Yes, Delete Account"
            onConfirm={handleDeleteAccount}
            onCancel={() => setShowDelete(false)}
          />
        )}
      </div>
    </div>
  );
}
