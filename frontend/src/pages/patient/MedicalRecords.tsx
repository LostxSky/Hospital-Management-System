import { useState, useEffect } from 'react';
import { medicalRecordAPI, patientAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { MedicalRecord, Patient } from '../../types';
import { formatDisplayName } from '../../utils/format';

const MedicalRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [profile, setProfile] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      medicalRecordAPI.getMy(),
      patientAPI.getMyProfile(),
    ])
      .then(([recRes, profRes]) => {
        setRecords(recRes.data.data ?? []);
        setProfile(profRes.data.data ?? null);
      })
      .catch(err => console.error('Medical records load error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading...</div>;

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Medical Records</h1>
      <p className="page-subtitle">Your complete health history</p>

      {/* Patient summary card */}
      {profile && (
        <div className="dashboard-section" style={{
          padding: '1.5rem', marginBottom: '2rem',
          display: 'flex', gap: '2.5rem', flexWrap: 'wrap',
        }}>
          {[
            { label: 'Name', value: formatDisplayName(profile.name, user?.email) },
            { label: 'Blood Group', value: profile.blood_group || '—' },
            { label: 'Age', value: profile.age ? `${profile.age} yrs` : '—' },
            { label: 'Gender', value: profile.gender || '—' },
          ].map(item => (
            <div key={item.label}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Medical history note */}
      {profile?.medical_history && (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--brand-primary)',
          borderRadius: '8px', padding: '1.25rem 1.5rem', marginBottom: '2rem',
          fontSize: '0.9rem', color: 'var(--text-primary)',
        }}>
          📝 <strong style={{ color: 'var(--brand-primary)', marginRight: '0.5rem' }}>Medical History:</strong> {profile.medical_history}
        </div>
      )}

      {/* Records */}
      {records.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No medical records found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {records.map(r => (
            <div key={r.record_id} className="dashboard-section" style={{
              borderLeft: '4px solid var(--brand-primary)', padding: '1.25rem 1.5rem', marginBottom: 0
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.diagnosis}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.created_at?.split('T')[0] ?? ''}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 0.75rem' }}>👨‍⚕️ {r.doctor_name || 'Unknown doctor'}</p>
              <div style={{ background: 'var(--bg-main)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <strong>💊 Prescription:</strong> {r.prescription}
              </div>
              {r.test_reports && (
                <div style={{ background: 'var(--bg-hover)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', color: 'var(--brand-primary)' }}>
                  <strong>🧪 Reports:</strong> {r.test_reports}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
