import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import type { Appointment } from '../../types';
import { formatDate, formatDisplayName } from '../../utils/format';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useScrollReveal([loading]);

  useEffect(() => {
    appointmentAPI.getDoctor()
      .then(res => setAppointments(res.data.data ?? []))
      .catch(err => console.error('Fetch doctor appointments error:', err))
      .finally(() => setLoading(false));
  }, []);

  // ─── Memoized derived state ────────────────────────────────────────────────
  // today string computed once per render, not inside stats map
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const pending = useMemo(() => appointments.filter(a => a.status === 'Pending'), [appointments]);
  const confirmed = useMemo(() => appointments.filter(a => a.status === 'Confirmed'), [appointments]);
  const todayApps = useMemo(() => appointments.filter(a => a.appointment_date === today), [appointments, today]);

  const stats = useMemo(() => [
    { label: 'Total Appointments', value: appointments.length, icon: '📅', color: '#1a2e22', accent: '#2db87a' },
    { label: 'Confirmed', value: confirmed.length, icon: '✅', color: '#1a2e22', accent: '#60a5fa' },
    { label: 'Pending', value: pending.length, icon: '⏳', color: '#2a2010', accent: '#f59e0b' },
    { label: "Today's", value: todayApps.length, icon: '🗓️', color: '#1a1a2e', accent: '#a78bfa' },
  ], [appointments.length, confirmed.length, pending.length, todayApps.length]);

  // ─── Stable hover handlers ─────────────────────────────────────────────────
  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0) scale(1)';
  }, []);

  // ─── Memoized display name ─────────────────────────────────────────────────
  const displayName = useMemo(
    () => formatDisplayName(user?.name, user?.email),
    [user?.name, user?.email]
  );

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-greeting reveal">
        Welcome, <span title={user?.email || ''} style={{ cursor: 'help', borderBottom: '1px dashed var(--border-color)' }}>
          {displayName}
        </span> 👨‍⚕️
      </h1>
      <p className="dashboard-profile-info reveal delay-1">Here's your schedule overview</p>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i: number) => (
          <div key={s.label} className={`stat-card reveal-scale delay-${i + 2}`} style={{
            background: s.color, border: `1px solid ${s.accent}33`,
            transition: 'all 0.3s ease'
          }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: s.accent }}>
              {loading ? '—' : s.value}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending appointments */}
      <div className="dashboard-section reveal delay-6">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">Pending Approvals</h2>
          <button
            onClick={() => navigate('/doctor/appointments')}
            style={{ background: 'transparent', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
          >
            View All →
          </button>
        </div>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading...</p>
        ) : pending.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No pending appointments 🎉</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pending.map((a: Appointment, i: number) => (
              <div key={a.appointment_id} className={`list-item reveal delay-${i + 7}`} style={{
                background: '#2a2010', borderColor: '#4a3a1044', padding: '0.75rem 1rem'
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{a.patient_name}</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(a.appointment_date)} &middot; {a.appointment_time}</p>
                </div>
                <span className="badge" style={{ background: '#3a2a10', color: '#f59e0b', padding: '0.2rem 0.6rem' }}>
                  Pending
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
