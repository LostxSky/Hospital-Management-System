import { useState, useEffect } from 'react';
import PrescriptionCard from '../../components/patient/PrescriptionCard';
import { medicalRecordAPI } from '../../services/api';
import type { MedicalRecord } from '../../types';

const Prescriptions = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    medicalRecordAPI.getMy()
      .then(res => setRecords(res.data.data ?? []))
      .catch(err => console.error('Fetch prescriptions error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Prescriptions</h1>
      <p className="page-subtitle">
        {loading ? '...' : `${records.length} prescriptions on record`}
      </p>
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : records.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No prescriptions found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {records.map(r => (
            <PrescriptionCard key={r.record_id} record={r} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
