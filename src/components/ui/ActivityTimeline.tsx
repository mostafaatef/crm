import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';

interface Activity {
  id: number;
  contact_id: number | null;
  deal_id: number | null;
  type: string;
  description: string;
  done: number; // SQLite boolean
  due_date: string | null;
  created_at: string;
}

interface ActivityTimelineProps {
  contactId?: number;
  dealId?: number;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ contactId, dealId }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // Form state
  const [type, setType] = useState('note');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const fetchActivities = async () => {
    let url = '';
    if (contactId) url = `/api/contacts/${contactId}/activities`;
    else if (dealId) url = `/api/deals/${dealId}/activities`;
    else return;
    
    const res = await fetch(url);
    if (res.ok) setActivities(await res.json());
  };

  useEffect(() => {
    fetchActivities();
  }, [contactId, dealId]);

  const handleAdd = async () => {
    if (!description) return;
    
    const payload = {
      contact_id: contactId || null,
      deal_id: dealId || null,
      type,
      description,
      done: 0,
      due_date: dueDate || null
    };

    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    setDescription('');
    setDueDate('');
    setType('note');
    fetchActivities();
  };

  const handleToggleDone = async (activity: Activity) => {
    await fetch(`/api/activities/${activity.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...activity, done: activity.done ? 0 : 1 })
    });
    fetchActivities();
  };

  return (
    <div className="activity-timeline">
      <div className="card activity-add-box" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>Add Activity</h3>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <Select 
            value={type} 
            onChange={e => setType(e.target.value)} 
            options={[
              { value: 'note', label: 'Note' },
              { value: 'call', label: 'Call' },
              { value: 'email', label: 'Email' }
            ]}
            style={{ width: '120px', marginBottom: 0 }}
          />
          <Input 
            placeholder="What happened? Or what needs to happen?" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            style={{ flex: 1, marginBottom: 0 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Input 
            type="date" 
            value={dueDate} 
            onChange={e => setDueDate(e.target.value)} 
            style={{ width: '180px', marginBottom: 0 }}
          />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Optional due date to make it a task</span>
          <div style={{ flex: 1 }}></div>
          <Button onClick={handleAdd}>Save</Button>
        </div>
      </div>

      <div className="activity-feed">
        {activities.length === 0 ? (
          <p className="table-empty">No activities yet.</p>
        ) : (
          activities.map(act => (
            <div key={act.id} className="activity-item card" style={{ marginBottom: '12px' }}>
              <div className="activity-header">
                <span className="activity-type">{act.type.toUpperCase()}</span>
                <span className="activity-date">{new Date(act.created_at).toLocaleString()}</span>
              </div>
              <p className="activity-desc">{act.description}</p>
              
              {act.due_date && (
                <div className={`activity-task ${act.done ? 'task-done' : ''}`}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={!!act.done} 
                      onChange={() => handleToggleDone(act)} 
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                    />
                    <span>
                      Due: {act.due_date} {act.done ? '(Completed)' : ''}
                    </span>
                  </label>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
