import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem',
      background: 'var(--bg-main)',
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏥</div>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--brand-primary)', margin: 0 }}>404</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: '0.5rem 0 2rem' }}>
        This page doesn't exist or you don't have access.
      </p>
      <button
        onClick={() => navigate('/')}
        className="btn-primary"
        style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFound;
