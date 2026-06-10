import { useState, useEffect } from 'react';
import { localNotifications } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(localNotifications.getByUser(user.user_id));
  }, [user.user_id]);

  const markAllRead = () => {
    localNotifications.markRead(user.user_id);
    setNotifications(localNotifications.getByUser(user.user_id));
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>🔔 Notifications</h1>
            <p>{unread > 0 ? `${unread} unread` : 'All caught up!'}</p>
          </div>
          {unread > 0 && (
            <button className="btn btn--outline btn--sm" onClick={markAllRead}>Mark All Read</button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔔</div>
            <h3>No notifications yet</h3>
            <p>You'll be notified when someone interacts with your trips</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map(n => (
              <div key={n.id} style={{
                padding: '1rem 1.2rem',
                background: n.read ? 'var(--bg-card)' : 'var(--primary-light)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: `4px solid ${n.read ? 'var(--border)' : 'var(--primary)'}`,
                boxShadow: 'var(--shadow)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}>
                <div>
                  <p style={{ fontWeight: n.read ? 400 : 600, marginBottom: '0.25rem' }}>{n.message}</p>
                  <p className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.read && <span className="badge badge--teal" style={{ flexShrink: 0 }}>New</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
