import type { MedicalRecord } from '../../types';

interface Props { record: MedicalRecord }

const PrescriptionCard = ({ record }: Props) => (
  <div className="list-item" style={{
    borderLeft: '4px solid var(--brand-primary)',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{record.diagnosis}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{record.created_at}</span>
    </div>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
      👨‍⚕️ {record.doctor_name}
    </p>
    <div style={{
      background: 'var(--bg-main)',
      borderRadius: '8px',
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      color: 'var(--text-secondary)',
    }}>
      <strong>💊 Prescription:</strong> {record.prescription}
    </div>
    {record.test_reports && (
      <div style={{
        background: 'var(--bg-hover)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        color: 'var(--brand-primary)',
      }}>
        <strong>🧪 Test Reports:</strong> {record.test_reports}
      </div>
    )}
  </div>
);

export default PrescriptionCard;
