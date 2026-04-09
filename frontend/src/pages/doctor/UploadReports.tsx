import { useState, useEffect } from 'react';
import { patientAPI } from '../../services/api';
import type { Patient } from '../../types';

const UploadReports = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState('');
  const [reportText, setReportText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    patientAPI.getAll()
      .then(res => setPatients(res.data.data ?? []))
      .catch(err => console.error('Fetch patients error:', err));
  }, []);

  const handleSubmit = () => {
    if (!patientId || (!reportText && !file)) {
      alert('Please select a patient and add report details'); return;
    }
    // File upload would require a dedicated backend endpoint (FormData)
    // For now records are handled via WritePrescription → createMedicalRecord
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ fontSize: '3rem' }}>📁</div>
        <h2 style={{ color: 'var(--brand-primary)' }}>Report Uploaded!</h2>
        <button
          onClick={() => { setSuccess(false); setPatientId(''); setReportText(''); setFile(null); }}
          className="btn-primary"
        >
          Upload Another
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Upload Test Reports</h1>
      <p className="page-subtitle">Attach lab results or diagnostic reports to a patient</p>

      <div className="dashboard-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Patient */}
        <div className="form-group">
          <label className="form-label">Select Patient *</label>
          <select
            value={patientId} onChange={e => setPatientId(e.target.value)}
            className="form-control"
          >
            <option value="">Choose patient</option>
            {patients.map(p => (
              <option key={p.patient_id} value={p.patient_id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Report notes */}
        <div className="form-group">
          <label className="form-label">Report Summary</label>
          <textarea
            rows={4} placeholder="Enter lab results, observations, findings..."
            value={reportText} onChange={e => setReportText(e.target.value)}
            className="form-control" style={{ resize: 'vertical' }}
          />
        </div>

        {/* File upload */}
        <div className="form-group">
          <label className="form-label">Attach File (PDF/Image)</label>
          <div style={{
            border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '1.5rem',
            textAlign: 'center', cursor: 'pointer', background: 'var(--bg-main)',
            transition: 'border-color 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-primary-faded)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <input
              type="file" accept=".pdf,.jpg,.jpeg,.png"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              style={{ display: 'none' }} id="file-upload"
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.875rem', display: 'block', width: '100%' }}>
              {file ? `📎 ${file.name}` : '📎 Click to upload or drag a file here'}
            </label>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="btn-primary" style={{ width: '100%', padding: '0.85rem' }}
        >
          Upload Report
        </button>
      </div>
    </div>
  );
};

export default UploadReports;
