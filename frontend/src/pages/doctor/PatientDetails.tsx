import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI, medicalRecordAPI, appointmentAPI } from '../../services/api';
import type { Patient, MedicalRecord, Appointment } from '../../types';
import { formatDate } from '../../utils/format';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const patientId = Number(id);

    setLoading(true);
    Promise.all([
      patientAPI.getById(patientId),
      medicalRecordAPI.getByPatient(patientId),
      appointmentAPI.getAll() // We'll filter all appointments for this patient
    ])
      .then(([patientRes, recordsRes, appointmentsRes]) => {
        if (patientRes.data.data) {
          setPatient(patientRes.data.data);
        }
        setRecords(recordsRes.data.data ?? []);
        // Filter appointments for this specific patient
        const patientApps = (appointmentsRes.data.data ?? []).filter(
          a => a.patient_id === patientId
        );
        setAppointments(patientApps);
      })
      .catch(err => console.error('Error fetching patient details:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading patient details...</div>;
  }

  if (!patient) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Patient not found.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '1rem', padding: 0 }}
      >
        ← Back
      </button>

      {/* Patient header */}
      <div className="dashboard-section" style={{
        padding: '1.5rem', marginBottom: '1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '56px', height: '56px', background: 'var(--bg-hover)', border: '1px solid var(--border-color)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
          }}>👤</div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{patient.name}</h2>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {patient.age} yrs &middot; {patient.gender} &middot; 🩸 {patient.blood_group}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contact</p><p style={{ margin: 0, color: 'var(--text-primary)' }}>{patient.contact}</p></div>
          <div><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Address</p><p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{patient.address}</p></div>
        </div>
      </div>

      {/* Medical history */}
      {patient.medical_history && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--brand-primary)', borderRadius: '8px', padding: '1.25rem 1.5rem', marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          📝 <strong style={{ color: 'var(--brand-primary)', marginRight: '0.5rem' }}>Medical History:</strong> {patient.medical_history}
        </div>
      )}

      {/* Records */}
      <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>Medical Records</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {records.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No medical records available.</p>
        ) : (
          records.map(r => (
            <div key={r.record_id} className="list-item" style={{
              background: 'var(--bg-main)', borderLeft: '4px solid var(--brand-primary)',
              padding: '1rem 1.25rem', display: 'block'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.diagnosis}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {r.created_at ? formatDate(r.created_at) : 'N/A'}
                </span>
              </div>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>💊 {r.prescription}</p>
            </div>
          ))
        )}
      </div>

      {/* Appointments */}
      <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>Past & Upcoming Appointments</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {appointments.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No appointments found.</p>
        ) : (
          appointments.map(a => (
            <div key={a.appointment_id} className="list-item" style={{
              padding: '0.75rem 1rem'
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{a.doctor_name || 'Doctor'}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(a.appointment_date)} @ {a.appointment_time}</p>
              </div>
              <span className="badge" style={{
                background: a.status === 'Confirmed' ? '#1a2e22' : a.status === 'Pending' ? '#2a2010' : '#2a1515',
                color: a.status === 'Confirmed' ? 'var(--brand-primary)' : a.status === 'Pending' ? '#f59e0b' : '#f87171',
                border: `1px solid ${a.status === 'Confirmed' ? 'var(--brand-primary)' : a.status === 'Pending' ? '#f59e0b' : '#f87171'}44`
              }}>
                {a.status}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/doctor/prescribe', { state: { patientId: patient.patient_id } })}
          className="btn-primary" style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}
        >
          + Write Prescription
        </button>
        <button
          onClick={() => navigate('/doctor/reports', { state: { patientId: patient.patient_id } })}
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.7rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          Upload Report
        </button>
      </div>
    </div>
  );
};

export default PatientDetails;
