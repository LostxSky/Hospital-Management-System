import type { Bill } from '../../types';

interface Props { bill: Bill }

const BillCard = ({ bill }: Props) => {
  const isPaid = bill.payment_status === 'Paid';

  return (
    <div className="list-item" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Bill #{bill.bill_id}</span>
        <span className="badge" style={{
          background: isPaid ? 'var(--bg-hover)' : '#2a1515',
          color: isPaid ? 'var(--brand-primary)' : '#f87171',
          border: `1px solid ${isPaid ? 'var(--brand-primary-faded)' : '#5a2020'}`,
          padding: '0.2rem 0.65rem',
          fontSize: '0.75rem',
        }}>
          {bill.payment_status}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        <Row label="Consultation" amount={bill.consultation_charges} />
        <Row label="Lab Charges" amount={bill.lab_charges} />
        <Row label="Medicines" amount={bill.medicine_charges} />
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text-primary)' }}>
          <span>Total</span>
          <span>₹{bill.total_amount}</span>
        </div>
      </div>

      {!isPaid && (
        <button className="btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.6rem', fontSize: '0.875rem' }}>
          Pay Now
        </button>
      )}
    </div>
  );
};

const Row = ({ label, amount }: { label: string; amount: number }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <span>{label}</span>
    <span>₹{amount}</span>
  </div>
);

export default BillCard;
