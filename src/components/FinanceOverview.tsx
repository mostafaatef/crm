import React, { useEffect, useState } from 'react';

interface FinanceOverviewData {
  revenue: number;
  costs: number;
  expenses: number;
  subcontracts: number;
  profit: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const FinanceOverview: React.FC = () => {
  const [data, setData] = useState<FinanceOverviewData | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      const res = await fetch('/api/finance/overview');
      if (res.ok) {
        setData(await res.json());
      }
    };
    fetchOverview();
  }, []);

  if (!data) return <div style={{ padding: '24px' }}>Loading overview...</div>;

  const profitMargin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '16px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--color-text-light)', marginBottom: '8px' }}>Total Revenue (Paid)</h3>
          <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text)' }}>{formatCurrency(data.revenue)}</p>
        </div>
        
        <div style={{ padding: '16px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--color-text-light)', marginBottom: '8px' }}>Total Costs</h3>
          <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text)' }}>{formatCurrency(data.costs)}</p>
        </div>

        <div style={{ padding: '16px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--color-text-light)', marginBottom: '8px' }}>Profit</h3>
          <p style={{ fontSize: '24px', fontWeight: 600, color: data.profit >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
            {formatCurrency(data.profit)}
          </p>
        </div>

        <div style={{ padding: '16px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--color-text-light)', marginBottom: '8px' }}>Profit Margin</h3>
          <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text)' }}>
            {profitMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      <div style={{ padding: '24px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Cost Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-light)' }}>Direct Expenses</span>
            <span style={{ fontWeight: 500 }}>{formatCurrency(data.expenses)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-light)' }}>Committed Subcontracts</span>
            <span style={{ fontWeight: 500 }}>{formatCurrency(data.subcontracts)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: '4px' }}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={{ fontWeight: 600 }}>{formatCurrency(data.costs)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
