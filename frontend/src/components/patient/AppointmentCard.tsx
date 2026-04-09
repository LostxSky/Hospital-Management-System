import type { Appointment } from '../../types';
import { formatDate } from '../../utils/format';

interface Props {
  appointment: Appointment;
  onCancel?: (id: number) => void;
}

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  Confirmed: { bg: 'var(--bg-hover)', color: 'var(--brand-primary)', border: 'var(--brand-primary-faded)' },
  Pending: { bg: '#2a2010', color: '#f59e0b', border: '#5a3f10' },
  Cancelled: { bg: '#2a1515', color: '#f87171', border: '#5a2020' },
  Completed: { bg: '#1a2e22', color: '#60a5fa', border: '#2b4d3a' }
};

const AppointmentCard = ({ appointment, onCancel }: Props) => {
  const status = statusColors[appointment.status] ?? statusColors.Pending;

  return (
    <div className="list-item" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontSize: '1.05rem' }}>
          {appointment.doctor_name ?? `Doctor #${appointment.doctor_id}`}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
          📅 {formatDate(appointment.appointment_date)} &nbsp;&nbsp;⏰ {appointment.appointment_time}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span className="badge" style={{
          background: status.bg,
          color: status.color,
          border: `1px solid ${status.border}`,
          padding: '0.3rem 0.8rem',
          fontSize: '0.75rem'
        }}>
          {appointment.status}
        </span>

        {appointment.status !== 'Cancelled' && onCancel && (
          <button
            onClick={() => onCancel(appointment.appointment_id)}
            style={{
              background: 'transparent',
              border: '1px solid #fc818144',
              color: '#e53e3e',
              padding: '0.4rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e53e3e11'; e.currentTarget.style.borderColor = '#fc8181' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#fc818144' }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
