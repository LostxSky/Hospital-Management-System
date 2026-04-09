import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { getPasswordStrength } from '../../utils/format';

const Register = () => {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [role, setRole] = useState<UserRole>('patient');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', gender: '', contact: '', address: '', blood_group: '',
    specialization: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    }
  }, [user, navigate]);

  const nextStep = () => {
    // Basic validation for current step
    if (step === 1) {
      if (!form.email || !form.password || !form.confirmPassword) {
        setError('Please fill in all account fields');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    } else if (step === 2) {
      if (!form.name) {
        setError('Full name is required');
        return;
      }
    }
    setError('');
    setStep(s => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => {
    setError('');
    setStep(s => Math.max(s - 1, 1));
  };

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('Please ensure all required fields are filled');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        role,
        name: form.name,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender || undefined,
        contact: form.contact || undefined,
        address: form.address || undefined,
        blood_group: form.blood_group || undefined,
        specialization: form.specialization || undefined,
      });
      navigate('/login');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', textDecoration: 'none' }}>
          <span style={{ color: 'var(--brand-primary)', fontSize: '1.3rem' }}>♥</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>SmartCare</span>
        </Link>

        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Create account</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 1rem' }}>Join SmartCare today</p>

        {/* Stepper */}
        <div className="form-stepper">
          {[
            { n: 1, label: 'Account' },
            { n: 2, label: 'Profile' },
            { n: 3, label: 'Details' }
          ].map(s => (
            <div key={s.n} className={`step-item ${step === s.n ? 'active' : step > s.n ? 'completed' : ''}`}>
              <div className="step-dot">{step > s.n ? '✓' : s.n}</div>
              <span className="step-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Role toggle - Stays visible to define context */}
        {step === 1 && (
          <div className="auth-role-toggle">
            {(['patient', 'doctor'] as UserRole[]).map(r => (
              <button key={r} onClick={() => setRole(r)} className={`auth-role-btn ${role === r ? 'active' : ''}`}>
                {r === 'patient' ? '👤 Patient' : '👨‍⚕️ Doctor'}
              </button>
            ))}
          </div>
        )}

        <div className="step-content-fade" key={step}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <DarkField label="Email Address *" value={form.email} onChange={v => update('email', v)} placeholder="you@example.com" type="email" icon="✉️" />
              <DarkField
                label="Password *"
                value={form.password}
                onChange={v => update('password', v)}
                placeholder="••••••••"
                type="password"
                icon="🔒"
                badge={(() => {
                  const { label, color } = getPasswordStrength(form.password);
                  return label ? <span className="password-match-badge" style={{ background: `${color}22`, color }}>{label}</span> : null;
                })()}
              />
              <DarkField
                label="Confirm Password *"
                value={form.confirmPassword}
                onChange={v => update('confirmPassword', v)}
                placeholder="••••••••"
                type="password"
                icon="🛡️"
                badge={form.confirmPassword ? (
                  form.password === form.confirmPassword ?
                    <span className="password-match-badge" style={{ background: '#1a2e22', color: '#2db87a' }}>Match</span> :
                    <span className="password-match-badge" style={{ background: '#2a1515', color: '#f87171' }}>No Match</span>
                ) : null}
              />
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <DarkField label="Full Name *" value={form.name} onChange={v => update('name', v)} placeholder="John Doe" icon="👤" />

              <TwoCol>
                <DarkField label="Age" value={form.age} onChange={v => update('age', v)} placeholder="22" type="number" icon="🎂" />
                <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                  <label className="form-label">Gender</label>
                  <div className="input-icon-group">
                    <span className="input-icon-emoji">🚻</span>
                    <select value={form.gender} onChange={e => update('gender', e.target.value)} className="form-control form-control-with-icon">
                      <option value="">Select Gender</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
              </TwoCol>

              {role === 'patient' ? (
                <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                  <label className="form-label">Blood Group</label>
                  <div className="input-icon-group">
                    <span className="input-icon-emoji">🩸</span>
                    <select value={form.blood_group} onChange={e => update('blood_group', e.target.value)} className="form-control form-control-with-icon">
                      <option value="">Select Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <DarkField label="Specialization" value={form.specialization} onChange={v => update('specialization', v)} placeholder="e.g. Cardiologist" icon="🩺" />
              )}
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <DarkField label="Contact Number" value={form.contact} onChange={v => update('contact', v)} placeholder="9876543210" icon="📱" />
              <DarkField label="Home Address" value={form.address} onChange={v => update('address', v)} placeholder="123, MG Road, Bangalore" icon="📍" />
            </div>
          )}
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
          {step > 1 && (
            <button onClick={prevStep} className="btn-secondary" style={{ flex: 1, padding: '0.85rem', borderRadius: '10px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
              Back
            </button>
          )}

          {step < totalSteps ? (
            <button onClick={nextStep} className="btn-primary" style={{ flex: step > 1 ? 2 : 1, padding: '0.85rem' }}>
              Next Step
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} data-submit="true" className="btn-primary" style={{ flex: 2, padding: '0.85rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Processing...' : 'Complete Registration'}
            </button>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

const TwoCol = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
    {children}
  </div>
);

const DarkField = ({ label, type = 'text', value, onChange, placeholder, icon, badge }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon?: string; badge?: React.ReactNode;
}) => (
  <div className="form-group" style={{ flex: '1 1 0', minWidth: '180px' }}>
    <label className="form-label">{label} {badge}</label>
    <div className="input-icon-group">
      {icon && <span className="input-icon-emoji">{icon}</span>}
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && (document.querySelector('button[data-submit="true"]') as HTMLButtonElement)?.click()}
        className={`form-control ${icon ? 'form-control-with-icon' : ''}`}
      />
    </div>
  </div>
);

export default Register;
