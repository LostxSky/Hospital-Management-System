import { useState, useEffect } from 'react';
import AppointmentCard from '../../components/patient/AppointmentCard';
import { appointmentAPI } from '../../services/api';
import type { Appointment } from '../../types';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'All' | 'Confirmed' | 'Pending' | 'Cancelled'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentAPI.getMy()
      .then(res => setAppointments(res.data.data ?? []))
      .catch(err => console.error('Fetch appointments error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: number) => {
    try {
      await appointmentAPI.updateStatus(id, 'Cancelled');
      setAppointments(prev =>
        prev.map(a => a.appointment_id === id ? { ...a, status: 'Cancelled' } : a)
      );
    } catch (err) {
      console.error('Cancel appointment error:', err);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const filtered = filter === 'All' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="dashboard-container">
      <h1 className="page-title">My Appointments</h1>
      <p className="page-subtitle">{appointments.length} total appointments</p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(['All', 'Confirmed', 'Pending', 'Cancelled'] as const).map(f => (
          <button
            key={f} onClick={() => setFilter(f)}
            style={{
              padding: '0.4rem 1rem', borderRadius: '99px', border: 'none',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: filter === f ? 600 : 400,
              background: filter === f ? 'var(--brand-primary)' : 'var(--border-color)',
              color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Loading appointments...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No appointments found.</p>
        ) : (
          filtered.map(a => (
            <AppointmentCard key={a.appointment_id} appointment={a} onCancel={handleCancel} />
          ))
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
