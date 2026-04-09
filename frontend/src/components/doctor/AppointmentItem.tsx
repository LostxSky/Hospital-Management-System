import type { Appointment } from '../../types';
import { formatDate } from '../../utils/format';

interface Props {
  appointment: Appointment;
  onConfirm?: (id: number) => void;
  onCancel?: (id: number) => void;
}

const AppointmentItem = ({ appointment, onConfirm, onCancel }: Props) => (
  <div className="list-item" style={{
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }}>
    <div>
      <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
        {appointment.patient_name ?? `Patient #${appointment.patient_id}`}
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
        📅 {formatDate(appointment.appointment_date)} &nbsp; ⏰ {appointment.appointment_time}
      </p>
    </div>

    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {appointment.status === 'Pending' && (
        <>
          {onConfirm && (
            <button
              className="btn-primary"
              onClick={() => onConfirm(appointment.appointment_id)}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
            >
              Confirm
            </button>
          )}
          {onCancel && (
            <button
              className="btn-outline"
              onClick={() => onCancel(appointment.appointment_id)}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
            >
              Cancel
            </button>
          )}
        </>
      )}
      {appointment.status !== 'Pending' && (
        <span className="badge" style={{
          background: appointment.status === 'Confirmed' ? 'var(--bg-hover)' : '#2a1515',
          color: appointment.status === 'Confirmed' ? 'var(--brand-primary)' : '#f87171',
          border: `1px solid ${appointment.status === 'Confirmed' ? 'var(--brand-primary-faded)' : '#5a2020'}`,
          padding: '0.25rem 0.75rem',
          fontSize: '0.75rem',
        }}>
          {appointment.status}
        </span>
      )}
    </div>
  </div>
);

export default AppointmentItem;
