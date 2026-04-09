const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '3rem', gap: '1rem',
  }}>
    <div style={{
      width: '40px', height: '40px',
      border: '4px solid var(--border-color)',
      borderTop: '4px solid var(--brand-primary)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{message}</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default LoadingSpinner;
