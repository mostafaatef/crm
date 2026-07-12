import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

interface Organization {
  id: number;
  name: string;
  website: string | null;
  industry: string | null;
  notes: string | null;
}

interface Contact {
  id: number;
  name: string;
  email: string | null;
  status: string;
}

interface Deal {
  id: number;
  name: string;
  stage: string;
  value: number;
}

const OrganizationDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Organization | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [oRes, cRes, dRes] = await Promise.all([
        fetch(`/api/organizations/${id}`),
        fetch(`/api/organizations/${id}/contacts`),
        fetch(`/api/organizations/${id}/deals`)
      ]);
      if (oRes.ok) setOrg(await oRes.json());
      if (cRes.ok) setContacts(await cRes.json());
      if (dRes.ok) setDeals(await dRes.json());
    };
    fetchData();
  }, [id]);

  if (!org) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Button variant="ghost" onClick={() => navigate('/organizations')}>&larr; Back</Button>
        <h1 className="page-title">{org.name}</h1>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <p>
          <strong>Website:</strong>{' '}
          {org.website ? (
            <a 
              href={org.website.startsWith('http') ? org.website : `https://${org.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
            >
              {org.website}
            </a>
          ) : 'N/A'}
        </p>
        <p><strong>Industry:</strong> {org.industry || 'N/A'}</p>
        <p><strong>Notes:</strong> {org.notes || 'N/A'}</p>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Contacts ({contacts.length})</h2>
          <div className="card">
            {contacts.length === 0 ? <p className="table-empty">No contacts.</p> : (
              <ul style={{ listStyle: 'none' }}>
                {contacts.map(c => (
                  <li key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }} onClick={() => navigate(`/contacts/${c.id}`)}>
                    <strong>{c.name}</strong> - {c.email ? <a href={`mailto:${c.email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{c.email}</a> : 'No email'} ({c.status})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Deals ({deals.length})</h2>
          <div className="card">
            {deals.length === 0 ? <p className="table-empty">No deals.</p> : (
              <ul style={{ listStyle: 'none' }}>
                {deals.map(d => (
                  <li key={d.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }} onClick={() => navigate(`/deals/${d.id}`)}>
                    <strong>{d.name}</strong> - ${d.value} ({d.stage})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetail;
