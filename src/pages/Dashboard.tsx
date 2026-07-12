import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface DashboardData {
  kpis: {
    totalPipeline: number;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    outstandingReceivables: number;
  };
  metrics: { month: string; dealsWon: number; revenue: number; expenses: number; profit: number }[];
  recentActivity: {
    id: number;
    type: string;
    description: string;
    created_at: string;
    contact_name: string | null;
    deal_name: string | null;
  }[];
  openTasks: {
    id: number;
    type: string;
    description: string;
    due_date: string;
    contact_name: string | null;
    deal_name: string | null;
  }[];
}

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    const res = await fetch('/api/dashboard');
    if (res.ok) setData(await res.json());
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleTask = async (task: any) => {
    // Optimistic UI
    setData(prev => prev ? {
      ...prev,
      openTasks: prev.openTasks.filter(t => t.id !== task.id)
    } : null);

    await fetch(`/api/activities/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, done: 1 })
    });
    fetchDashboard();
  };

  if (!data) return <div style={{ padding: '24px' }}>Loading Dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 150px', padding: '16px', textAlign: 'center', borderTop: '4px solid #94a3b8' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Total Pipeline</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(data.kpis.totalPipeline)}</div>
        </div>
        <div className="card" style={{ flex: '1 1 150px', padding: '16px', textAlign: 'center', borderTop: '4px solid #209dd7' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Total Revenue</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(data.kpis.totalRevenue)}</div>
        </div>
        <div className="card" style={{ flex: '1 1 150px', padding: '16px', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Total Expenses</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(data.kpis.totalExpenses)}</div>
        </div>
        <div className="card" style={{ flex: '1 1 150px', padding: '16px', textAlign: 'center', borderTop: '4px solid #22c55e' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Net Profit</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: data.kpis.netProfit < 0 ? '#ef4444' : 'inherit' }}>{formatCurrency(data.kpis.netProfit)}</div>
        </div>
        <div className="card" style={{ flex: '1 1 150px', padding: '16px', textAlign: 'center', borderTop: '4px solid #ecad0a' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Unpaid Invoices</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(data.kpis.outstandingReceivables)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Deals Won Per Month</h3>
          <div style={{ height: 300 }}>
            {data.metrics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.metrics}>
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="dealsWon" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="table-empty">No won deals yet.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Financials Per Month (USD)</h3>
          <div style={{ height: 300 }}>
            {data.metrics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.metrics}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" name="Revenue" dataKey="revenue" stroke="#209dd7" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" name="Expenses" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" name="Net Profit" dataKey="profit" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="table-empty">No financials yet.</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '16px' }}>Open Tasks</h3>
          <div className="activity-feed">
            {data.openTasks.length === 0 ? (
              <p className="table-empty">No open tasks!</p>
            ) : (
              data.openTasks.map(task => (
                <div key={task.id} className="activity-item" style={{ padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', borderLeft: '4px solid #ef4444' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      onChange={() => handleToggleTask(task)} 
                      style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>{task.description}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        <span style={{ color: '#ef4444', fontWeight: 500 }}>Due: {task.due_date}</span>
                        {task.contact_name && <span> • Contact: {task.contact_name}</span>}
                        {task.deal_name && <span> • Deal: {task.deal_name}</span>}
                      </div>
                    </div>
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '16px' }}>Recent Activity</h3>
          <div className="activity-feed">
            {data.recentActivity.length === 0 ? (
              <p className="table-empty">No recent activity.</p>
            ) : (
              data.recentActivity.map(act => (
                <div key={act.id} className="activity-item" style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}>
                  <div className="activity-header">
                    <span className="activity-type">{act.type.toUpperCase()}</span>
                    <span className="activity-date">{new Date(act.created_at).toLocaleString()}</span>
                  </div>
                  <p className="activity-desc" style={{ marginBottom: '4px' }}>{act.description}</p>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {act.contact_name && <span>Contact: {act.contact_name}</span>}
                    {act.contact_name && act.deal_name && <span> • </span>}
                    {act.deal_name && <span>Deal: {act.deal_name}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
