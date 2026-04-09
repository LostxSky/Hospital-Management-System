import { useNavigate } from 'react-router-dom';
import type { Patient } from '../../types';

interface Props { patient: Patient }

const PatientCard = ({ patient }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="list-item" style={{
      padding: '1.25rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '44px', height: '44px',
          background: 'var(--bg-hover)',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem',
        }}>👤</div>
        <div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{patient.name}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.15rem 0 0' }}>
            {patient.age} yrs · {patient.gender} · 🩸 {patient.blood_group}
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate(`/doctor/patients/${patient.patient_id}`)}
        className="btn-primary"
        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
      >
        View Details
      </button>
    </div>
  );
};

export default PatientCard;
