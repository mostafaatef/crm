import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ActivityTimeline } from '../components/ui/ActivityTimeline';
import DealFinanceSection from '../components/finance/DealFinanceSection';
import AttachmentsSection from '../components/AttachmentsSection';

interface Deal {
  id: number;
  organization_name: string | null;
  contact_name: string | null;
  name: string;
  stage: string;
  value: number;
  close_date: string | null;
}

const DealDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/deals/${id}`);
      if (res.ok) setDeal(await res.json());
    };
    fetchData();
  }, [id]);

  if (!deal) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Button variant="ghost" onClick={() => navigate('/deals')}>&larr; Back</Button>
        <h1 className="page-title">{deal.name}</h1>
      </div>

      <div className="card">
        <p><strong>Organization:</strong> {deal.organization_name || 'N/A'}</p>
        <p><strong>Primary Contact:</strong> {deal.contact_name || 'N/A'}</p>
        <p><strong>Stage:</strong> {deal.stage}</p>
        <p><strong>Value:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.value)}</p>
        <p><strong>Close Date:</strong> {deal.close_date || 'N/A'}</p>
      </div>

      <DealFinanceSection dealId={Number(id)} />
      <AttachmentsSection dealId={Number(id)} />
      
      <div style={{ marginTop: '24px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Activity Timeline</h2>
        <ActivityTimeline dealId={Number(id)} />
      </div>
    </div>
  );
};

export default DealDetail;
