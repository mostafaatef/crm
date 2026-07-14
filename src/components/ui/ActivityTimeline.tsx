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
    if (contactId) url = `/api/activities/contact/${contactId}`;
    else if (dealId) url = `/api/activities/deal/${dealId}`;
    else return;
    
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data: Activity[] = await res.json();
        setActivities(data);
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
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

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setDescription('');
        setDueDate('');
        setType('note');
        fetchActivities();
      }
    } catch (err) {
      console.error('Failed to add activity:', err);
    }
  };

  const handleToggleDone = async (activity: Activity) => {
    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...activity, done: activity.done ? 0 : 1 })
      });
      if (res.ok) {
        fetchActivities();
      }
    } catch (err) {
      console.error('Failed to toggle activity:', err);
    }
  };

  const getTypeIcon = (actType: string) => {
    switch(actType) {
      case 'call': return '📞';
      case 'email': return '✉️';
      default: return '📝';
    }
  };

  const getTypeColor = (actType: string) => {
    switch(actType) {
      case 'call': return '#ecad0a';
      case 'email': return '#209dd7';
      default: return '#753991';
    }
  };

  return (
    <div className="activity-timeline" style={{ position: 'relative' }}>
      <div className="card activity-add-box" style={{ marginBottom: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid var(--color-border)' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', color: 'var(--color-text)' }}>Log Activity</h3>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <Select 
            value={type} 
            onChange={e => setType(e.target.value)} 
            options={[
              { value: 'note', label: 'Note 📝' },
              { value: 'call', label: 'Call 📞' },
              { value: 'email', label: 'Email ✉️' }
            ]}
            style={{ width: '140px', marginBottom: 0 }}
          />
          <Input 
            placeholder="What happened? Or what needs to happen?" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}
            onKeyDown={(e) => { if(e.key === 'Enter') handleAdd() }}
          />
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 500 }}>Due:</span>
            <Input 
              type="date" 
              value={dueDate} 
              onChange={e => setDueDate(e.target.value)} 
              style={{ width: '160px', marginBottom: 0 }}
            />
          </div>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', flex: 1 }}>Set a due date to create a follow-up task.</span>
          <Button onClick={handleAdd} variant="primary" style={{ padding: '8px 24px' }}>Save Activity</Button>
        </div>
      </div>

      <div className="activity-feed" style={{ position: 'relative', paddingLeft: '24px' }}>
        <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '0', width: '2px', background: 'var(--color-border)' }}></div>
        {activities.length === 0 ? (
          <p className="table-empty" style={{ paddingLeft: '16px' }}>No activities logged yet.</p>
        ) : (
          activities.map((act, index) => (
            <div key={act.id} className="activity-item" style={{ 
              position: 'relative', 
              marginBottom: '24px',
              paddingLeft: '24px'
            }}>
              {/* Timeline dot */}
              <div style={{ 
                position: 'absolute', 
                left: '-24px', 
                top: '4px', 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: getTypeColor(act.type),
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                zIndex: 1,
                boxShadow: '0 0 0 4px var(--color-bg-alt)'
              }}>
                {getTypeIcon(act.type)}
              </div>
              
              <div className="card" style={{ 
                padding: '16px', 
                borderLeft: `4px solid ${getTypeColor(act.type)}`,
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
                borderTopLeftRadius: '0',
                borderBottomLeftRadius: '0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <div className="activity-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="activity-type" style={{ fontWeight: 600, color: 'var(--color-text)', textTransform: 'capitalize' }}>
                    {act.type}
                  </span>
                  <span className="activity-date" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {new Date(act.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <p className="activity-desc" style={{ margin: '0 0 12px 0', color: 'var(--color-text-light)', lineHeight: '1.5' }}>
                  {act.description}
                </p>
                
                {act.due_date && (
                  <div className={`activity-task ${act.done ? 'task-done' : ''}`} style={{ 
                    marginTop: '12px', 
                    paddingTop: '12px', 
                    borderTop: '1px dashed var(--color-border)' 
                  }}>
                    <label style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: act.done ? 'rgba(32, 157, 215, 0.1)' : 'rgba(236, 173, 10, 0.1)',
                      color: act.done ? '#209dd7' : '#ecad0a',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={!!act.done} 
                        onChange={() => handleToggleDone(act)} 
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span>
                        Due: {new Date(act.due_date).toLocaleDateString()} {act.done ? '✓ Completed' : '(Pending)'}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
