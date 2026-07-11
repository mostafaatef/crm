import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardData {
  metrics: { month: string; dealsWon: number; revenue: number }[];
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
          <h3 style={{ marginBottom: '16px' }}>Revenue Per Month (USD)</h3>
          <div style={{ height: 300 }}>
            {data.metrics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.metrics}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)} />
                  <Line type="monotone" dataKey="revenue" stroke="#ecad0a" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="table-empty">No revenue yet.</p>
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
