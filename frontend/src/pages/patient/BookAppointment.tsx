import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI, appointmentAPI, patientAPI } from '../../services/api';
import type { Doctor } from '../../types';
import { formatDate } from '../../utils/format';

const BookAppointment = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    doctorAPI.getAll()
      .then(res => setDoctors(res.data.data ?? []))
      .catch(err => console.error('Fetch doctors error:', err))
      .finally(() => setFetchingDoctors(false));
  }, []);

  const handleBook = async () => {
    setError('');
    if (!selectedDoctor || !date || !time) {
      setError('Please fill all fields'); return;
    }
    setLoading(true);
    try {
      // Get the patient's own profile to get patient_id
      const profileRes = await patientAPI.getMyProfile();
      const patient_id = profileRes.data.data?.patient_id;
      if (!patient_id) throw new Error('Could not determine patient profile');

      await appointmentAPI.book({
        patient_id,
        doctor_id: selectedDoctor.doctor_id,
        appointment_date: date,
        appointment_time: time + ':00',
      });
      setSuccess(true);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="dashboard-container">
        <h1 className="page-title">Book Appointment</h1>
        <p className="page-subtitle">Success</p>

        <section className="dashboard-section" style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2rem' }}>✅</div>
            <h2 className="dashboard-section-title" style={{ margin: 0, color: 'var(--brand-primary)', fontSize: '1.5rem' }}>Appointment Booked!</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
            Your appointment with <strong>{selectedDoctor?.name}</strong> is confirmed for <strong>{formatDate(date)}</strong> at <strong>{time}</strong>.
          </p>
          <button
            onClick={() => { setSuccess(false); setSelectedDoctor(null); setDate(''); setTime(''); setStep(1); }}
            className="btn-primary"
          >
            ← Book Another Appointment
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Book Appointment</h1>
      <p className="page-subtitle">
        {step === 1 ? 'Step 1: Select a doctor' : 'Step 2: Select date and time'}
      </p>

      {/* Stepper Progress Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2.5rem', alignItems: 'center' }}>
        <div style={{ flex: 1, height: '6px', background: 'var(--brand-primary)', borderRadius: '3px' }} />
        <div style={{ flex: 1, height: '6px', background: step === 2 ? 'var(--brand-primary)' : 'var(--border-color)', borderRadius: '3px', transition: 'background 0.3s ease' }} />
      </div>

      {step === 1 && (
        <section className="dashboard-section" style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="dashboard-section-title" style={{ margin: 0, color: 'var(--text-secondary)' }}>Choose a Doctor</h2>
          </div>

          {/* Filter tabs */}
          {!fetchingDoctors && doctors.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {['All', ...Array.from(new Set(doctors.map(d => d.specialization).filter(Boolean)))].map(f => (
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
          )}

          {fetchingDoctors ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading doctors...</p>
          ) : doctors.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No doctors available.</p>
          ) : (
            <>
              <div className="custom-scrollbar" style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '2rem'
              }}>
                {doctors
                  .filter(doc => filter === 'All' || doc.specialization === filter)
                  .map(doc => (
                    <div
                      key={doc.doctor_id}
                      onClick={() => setSelectedDoctor(doc)}
                      className="list-item"
                      style={{
                        border: `2px solid ${selectedDoctor?.doctor_id === doc.doctor_id ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                        cursor: 'pointer', background: selectedDoctor?.doctor_id === doc.doctor_id ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                        padding: '1.2rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderRadius: '12px'
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontSize: '1.05rem' }}>{doc.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>
                          {doc.specialization} {doc.department_name ? `· ${doc.department_name}` : ''}
                        </p>
                      </div>
                      {selectedDoctor?.doctor_id === doc.doctor_id && (
                        <span style={{ color: 'var(--brand-primary)', fontSize: '1.4rem' }}>✓</span>
                      )}
                    </div>
                  ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <button
                  className="btn-primary"
                  disabled={!selectedDoctor}
                  onClick={() => setStep(2)}
                  style={{ opacity: !selectedDoctor ? 0.5 : 1, padding: '0.8rem 2.5rem', fontSize: '1rem' }}
                >
                  Next Step →
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="dashboard-section" style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <h2 className="dashboard-section-title" style={{ margin: 0, color: 'var(--text-secondary)' }}>Appointment Details</h2>
            <button className="btn-outline" onClick={() => setStep(1)} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              ← Change Doctor
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.9rem' }}>Selected Doctor</label>
              <div style={{
                background: 'var(--bg-main)', border: '1px solid var(--brand-primary-faded)',
                borderRadius: '8px', padding: '1rem', fontSize: '1rem',
                color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{selectedDoctor?.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    {selectedDoctor?.specialization}
                  </div>
                </div>
                <div style={{ color: 'var(--brand-primary)', fontSize: '1.5rem' }}>⚕️</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label" style={{ fontSize: '0.9rem' }}>Date</label>
                <input
                  type="date" value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setDate(e.target.value)}
                  className="form-control"
                  style={{ padding: '0.85rem', fontSize: '1rem' }}
                />
              </div>

              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label" style={{ fontSize: '0.9rem' }}>Time</label>
                <select
                  value={time} onChange={e => setTime(e.target.value)}
                  className="form-control"
                  style={{ padding: '0.85rem', fontSize: '1rem' }}
                >
                  <option value="">Select time</option>
                  {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="auth-error" style={{ textAlign: 'center', padding: '1rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={handleBook} disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </button>

              {user && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                  Booking confirmation will be sent to <strong>{user.email}</strong>
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BookAppointment;
