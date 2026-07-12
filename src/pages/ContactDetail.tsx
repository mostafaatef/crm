import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ActivityTimeline } from '../components/ui/ActivityTimeline';
import AIEmailDrafter from '../components/AIEmailDrafter';

interface Contact {
  id: number;
  organization_name: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  status: string;
}

const ContactDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/contacts/${id}`);
      if (res.ok) setContact(await res.json());
    };
    fetchData();
  }, [id]);

  if (!contact) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Button variant="ghost" onClick={() => navigate('/contacts')}>&larr; Back</Button>
          <h1 className="page-title" style={{ marginBottom: 0 }}>{contact.name}</h1>
        </div>
        <AIEmailDrafter 
          contactName={contact.name} 
          jobTitle={contact.job_title} 
          organization={contact.organization_name} 
        />
      </div>

      <div className="card">
        <p><strong>Organization:</strong> {contact.organization_name || 'N/A'}</p>
        <p><strong>Job Title:</strong> {contact.job_title || 'N/A'}</p>
        <p>
          <strong>Email:</strong>{' '}
          {contact.email ? (
            <a 
              href={`mailto:${contact.email}`} 
              style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
            >
              {contact.email}
            </a>
          ) : 'N/A'}
        </p>
        <p><strong>Phone:</strong> {contact.phone || 'N/A'}</p>
        <p><strong>Status:</strong> {contact.status}</p>
      </div>
      
      <div style={{ marginTop: '24px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Activity Timeline</h2>
        <ActivityTimeline contactId={Number(id)} />
      </div>
    </div>
  );
};

export default ContactDetail;
