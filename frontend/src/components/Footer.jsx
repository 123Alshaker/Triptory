import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#1a1614', color: 'rgba(255,255,255,0.7)', padding: '2.5rem 0 1.5rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
              Trip<span style={{ color: 'var(--accent)' }}>tory</span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.7 }}>
              A community platform for sharing real travel experiences and discovering authentic itineraries.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Explore</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
              <Link to="/explore" style={{ color: 'rgba(255,255,255,0.7)' }}>Browse Trips</Link>
              <Link to="/register" style={{ color: 'rgba(255,255,255,0.7)' }}>Share Your Trip</Link>
              <Link to="/explore" style={{ color: 'rgba(255,255,255,0.7)' }}>Trending Destinations</Link>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)' }}>Login</Link>
              <Link to="/register" style={{ color: 'rgba(255,255,255,0.7)' }}>Register</Link>
              <Link to="/dashboard" style={{ color: 'rgba(255,255,255,0.7)' }}>Dashboard</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.2rem', textAlign: 'center', fontSize: '0.82rem' }}>
          © {new Date().getFullYear()} Triptory — Built with ♥ at Mustaqbal University
        </div>
      </div>
    </footer>
  );
}
