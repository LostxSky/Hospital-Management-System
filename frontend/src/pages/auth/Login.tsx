import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate(role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Card */}
      <div className="auth-card">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', textDecoration: 'none' }}>
          <span style={{ color: 'var(--brand-primary)', fontSize: '1.3rem' }}>♥</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>SmartCare</span>
        </Link>

        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
          Welcome back
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 1rem' }}>
          Sign in to your account
        </p>

        {/* Role toggle */}
        <div className="auth-role-toggle">
          {(['patient', 'doctor'] as UserRole[]).map(r => (
            <button key={r} onClick={() => setRole(r)} className={`auth-role-btn ${role === r ? 'active' : ''}`}>
              {r === 'patient' ? '👤 Patient' : '👨‍⚕️ Doctor'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <DarkField label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon="✉️" />
          <DarkField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" icon="🔒" />
        </div>

        {error && (
          <div className="auth-error" style={{ marginTop: '1rem' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit} disabled={loading} data-submit="true"
          className="btn-primary btn-auth"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

const DarkField = ({ label, type, value, onChange, placeholder, icon }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: string;
}) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="input-icon-group">
      <span className="input-icon-emoji">{icon}</span>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && (document.querySelector('button[data-submit="true"]') as HTMLButtonElement)?.click()}
        className="form-control form-control-with-icon"
      />
    </div>
  </div>
);

export default Login;
