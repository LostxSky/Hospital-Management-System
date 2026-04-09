import { useState, useEffect } from 'react';
import { patientAPI, appointmentAPI, medicalRecordAPI } from '../../services/api';
import type { Patient, Appointment } from '../../types';
import { formatDate } from '../../utils/format';

const WritePrescription = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState({
    patient_id: '',
    appointment_id: '',
    diagnosis: '',
    prescription: '',
    test_reports: '',
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([patientAPI.getAll(), appointmentAPI.getDoctor()])
      .then(([pRes, aRes]) => {
        setPatients(pRes.data.data ?? []);
        setAppointments((aRes.data.data ?? []).filter(a => a.status === 'Confirmed'));
      })
      .catch(err => console.error('Load data error:', err));
  }, []);

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setError('');
    if (!form.patient_id || !form.diagnosis || !form.prescription) {
      setError('Please fill all required fields'); return;
    }
    setLoading(true);
    try {
      await medicalRecordAPI.create({
        patient_id: parseInt(form.patient_id),
        appointment_id: form.appointment_id ? parseInt(form.appointment_id) : undefined,
        diagnosis: form.diagnosis,
        prescription: form.prescription,
        test_reports: form.test_reports || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Failed to save prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="dashboard-container">
        <h1 className="page-title">Write Prescription</h1>
        <p className="page-subtitle">Success</p>

        <section className="dashboard-section" style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2rem' }}>✅</div>
            <h2 className="dashboard-section-title" style={{ margin: 0, color: 'var(--brand-primary)', fontSize: '1.5rem' }}>Prescription Saved!</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
            The prescription and medical record have been successfully saved to the patient's file.
          </p>
          <button
            onClick={() => { setSuccess(false); setForm({ patient_id: '', appointment_id: '', diagnosis: '', prescription: '', test_reports: '' }); }}
            className="btn-primary"
          >
            ← Write Another Prescription
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Write Prescription</h1>
      <p className="page-subtitle">Create a medical record for a patient</p>

      <div className="dashboard-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Patient select */}
        <Field label="Select Patient *">
          <select value={form.patient_id} onChange={e => update('patient_id', e.target.value)} className="form-control">
            <option value="">Choose patient</option>
            {patients.map(p => (
              <option key={p.patient_id} value={p.patient_id}>{p.name}</option>
            ))}
          </select>
        </Field>

        {/* Appointment reference */}
        <Field label="Related Appointment">
          <select value={form.appointment_id} onChange={e => update('appointment_id', e.target.value)} className="form-control">
            <option value="">Select appointment (optional)</option>
            {appointments.map(a => (
              <option key={a.appointment_id} value={a.appointment_id}>
                {a.patient_name} &middot; {formatDate(a.appointment_date)} {a.appointment_time}
              </option>
            ))}
          </select>
        </Field>

        {/* Diagnosis */}
        <Field label="Diagnosis *">
          <input
            type="text" placeholder="e.g. Hypertension Stage 1"
            value={form.diagnosis} onChange={e => update('diagnosis', e.target.value)}
            className="form-control"
          />
        </Field>

        {/* Prescription */}
        <Field label="Prescription *">
          <textarea
            rows={4} placeholder="Medicine name, dosage, frequency..."
            value={form.prescription} onChange={e => update('prescription', e.target.value)}
            className="form-control" style={{ resize: 'vertical' }}
          />
        </Field>

        {/* Test reports */}
        <Field label="Test Reports / Notes">
          <textarea
            rows={3} placeholder="Lab results, observations..."
            value={form.test_reports} onChange={e => update('test_reports', e.target.value)}
            className="form-control" style={{ resize: 'vertical' }}
          />
        </Field>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit} disabled={loading}
          className="btn-primary" style={{ width: '100%', opacity: loading ? 0.7 : 1, padding: '0.85rem' }}
        >
          {loading ? 'Saving...' : 'Save Prescription'}
        </button>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    {children}
  </div>
);

export default WritePrescription;
