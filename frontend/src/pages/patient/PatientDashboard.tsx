import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, billingAPI, patientAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import type { Appointment, Bill, Patient } from '../../types';
import { formatDate, formatDisplayName } from '../../utils/format';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [profile, setProfile] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useScrollReveal([loading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, billRes, profileRes] = await Promise.all([
          appointmentAPI.getMy(),
          billingAPI.getMy(),
          patientAPI.getMyProfile(),
        ]);
        setAppointments(apptRes.data.data ?? []);
        setBills(billRes.data.data ?? []);
        setProfile(profileRes.data.data ?? null);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcoming = useMemo(() => appointments.filter(a => a.status !== 'Cancelled'), [appointments]);
  const unpaidBills = useMemo(() => bills.filter(b => b.payment_status !== 'Paid'), [bills]);

  const stats = useMemo(() => [
    { label: 'Appointments',    value: upcoming.length,      icon: '📅', path: '/patient/appointments', bg: '#eff6ff', color: '#2563eb' },
    { label: 'Medical Records', value: 0,                    icon: '📋', path: '/patient/records',       bg: '#f0fdf4', color: '#16a34a' },
    { label: 'Pending Bills',   value: unpaidBills.length,   icon: '💳', path: '/patient/billing',       bg: '#fef2f2', color: '#dc2626' },
    { label: 'Prescriptions',   value: 0,                    icon: '💊', path: '/patient/prescriptions', bg: '#faf5ff', color: '#9333ea' },
  ], [upcoming.length, unpaidBills.length]);

  const displayName = useMemo(
    () => formatDisplayName(profile?.name || user?.name, user?.email).split(' ')[0],
    [profile?.name, user?.name, user?.email]
  );

  if (loading) return <Spinner />;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Good day, {displayName} 👋
        </h1>
        {profile && (
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            Blood Group: <span style={{ color: '#dc2626', fontWeight: 600 }}>{profile.blood_group || '—'}</span>
            &nbsp;·&nbsp;{profile.age ? `${profile.age} yrs` : '—'} · {profile.gender || '—'}
          </p>
        )}
      </div>

      {/* Patient Info Card */}
      {profile && (
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: '16px', padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.5rem',
          border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #2db87a, #1a8a5a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', flexShrink: 0,
          }}>👤</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>{profile.name}</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {profile.age} years · {profile.gender} · Blood Group: <strong style={{ color: '#dc2626' }}>{profile.blood_group}</strong>
            </p>
          </div>
          {[
            { label: 'Contact', value: profile.contact },
            { label: 'Address', value: profile.address },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{item.label}</p>
              <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.15rem 0 0', fontWeight: 500 }}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {stats.map(s => (
          <div key={s.label} onClick={() => navigate(s.path)} style={{
            background: 'var(--bg-secondary)', borderRadius: '14px', padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)', cursor: 'pointer',
            border: '1px solid var(--border-color)', transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)'; }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '0.75rem' }}>
              {s.icon}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Recent Appointments */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Recent Appointments</h3>
            <button onClick={() => navigate('/patient/book')} style={{
              background: '#2db87a', color: '#fff', border: 'none',
              padding: '0.35rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
            }}>+ Book</button>
          </div>
          {appointments.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', margin: 0 }}>No appointments yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {appointments.slice(0, 3).map(a => (
                <div key={a.appointment_id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem', background: 'var(--bg-main)', borderRadius: '10px', border: '1px solid var(--border-color)',
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{a.doctor_name}</p>
                    <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                      {formatDate(a.appointment_date)} · {a.appointment_time}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Bills */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1.25rem' }}>Pending Bills</h3>
          {unpaidBills.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', margin: 0 }}>No pending bills 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {unpaidBills.map(b => (
                <div key={b.bill_id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca',
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Bill #{b.bill_id}</p>
                    <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>{b.issued_date}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#dc2626', fontSize: '1rem' }}>₹{b.total_amount}</p>
                    <button onClick={() => navigate('/patient/billing')} style={{
                      background: 'none', border: 'none', color: '#dc2626',
                      fontSize: '0.72rem', cursor: 'pointer', padding: 0, fontWeight: 600,
                    }}>Pay Now →</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, { bg: string; color: string }> = {
    Confirmed: { bg: '#f0fdf4', color: '#16a34a' },
    Pending:   { bg: '#fffbeb', color: '#d97706' },
    Cancelled: { bg: '#fef2f2', color: '#dc2626' },
    Completed: { bg: '#eff6ff', color: '#2563eb' },
  };
  const c = colors[status] ?? colors.Pending;
  return (
    <span style={{ background: c.bg, color: c.color, padding: '0.2rem 0.65rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600 }}>
      {status}
    </span>
  );
};

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #2db87a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default PatientDashboard;