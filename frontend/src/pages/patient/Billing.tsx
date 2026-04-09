import { useState, useEffect } from 'react';
import BillCard from '../../components/patient/BillCard';
import { billingAPI } from '../../services/api';
import type { Bill } from '../../types';

const Billing = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Paid'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billingAPI.getMy()
      .then(res => setBills(res.data.data ?? []))
      .catch(err => console.error('Fetch bills error:', err))
      .finally(() => setLoading(false));
  }, []);

  const total = bills.reduce((sum, b) => sum + b.total_amount, 0);
  const unpaid = bills.filter(b => b.payment_status !== 'Paid').reduce((sum, b) => sum + b.total_amount, 0);

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Billing</h1>
      <p className="page-subtitle">Your billing history & payments</p>

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <SummaryCard label="Total Billed" value={`₹${total}`} accent="var(--brand-primary)" />
        <SummaryCard label="Pending" value={`₹${unpaid}`} accent="#f87171" />
        <SummaryCard label="Bills" value={`${bills.length}`} accent="#60a5fa" />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(['All', 'Pending', 'Paid'] as const).map(f => (
          <button
            key={f} onClick={() => setFilter(f)}
            style={{
              padding: '0.4rem 1rem', borderRadius: '99px', border: 'none',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: filter === f ? 600 : 400,
              background: filter === f ? 'var(--brand-primary)' : 'var(--border-color)',
              color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading billing data...</p>
      ) : bills.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No bills found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {bills.filter(b => {
            if (filter === 'All') return true;
            if (filter === 'Pending') return b.payment_status !== 'Paid';
            return b.payment_status === 'Paid';
          }).map(b => <BillCard key={b.bill_id} bill={b} />)}
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div className="stat-card" style={{ flex: 1, border: `1px solid ${accent}33`, display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</p>
    <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 700, color: accent }}>{value}</p>
  </div>
);

export default Billing;
