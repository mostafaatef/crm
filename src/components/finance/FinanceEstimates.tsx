import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Table } from '../ui/Table';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

interface Estimate {
  id: number;
  deal_id: number;
  estimate_number: string;
  status: string;
  total_amount: number;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
}

interface Props {
  dealId: number;
}

const FinanceEstimates: React.FC<Props> = ({ dealId }) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Estimate>>({});

  const fetchEstimates = async () => {
    const res = await fetch(`/api/finance/deals/${dealId}/estimates`);
    if (res.ok) {
      setEstimates(await res.json());
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, [dealId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/finance/estimates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, deal_id: dealId }),
    });
    if (res.ok) {
      setIsModalOpen(false);
      setFormData({});
      fetchEstimates();
    }
  };

  const columns = [
    { header: 'Number', accessor: 'estimate_number' as keyof Estimate },
    { header: 'Status', accessor: 'status' as keyof Estimate },
    { header: 'Total Amount', accessor: (est: Estimate) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(est.total_amount) },
    { header: 'Valid Until', accessor: (est: Estimate) => est.valid_until || 'N/A' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>Estimates</h3>
        <Button onClick={() => setIsModalOpen(true)}>Add Estimate</Button>
      </div>

      <Table data={estimates} columns={columns} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Estimate">
        <form onSubmit={handleSubmit}>
          <Input 
            label="Estimate Number" 
            value={formData.estimate_number || ''} 
            onChange={(e) => setFormData({ ...formData, estimate_number: e.target.value })} 
            required 
          />
          <div className="input-group">
            <label className="input-label">Status</label>
            <select 
              className="input-field select-field"
              value={formData.status || 'Draft'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <Input 
            label="Total Amount" 
            type="number" 
            value={formData.total_amount || ''} 
            onChange={(e) => setFormData({ ...formData, total_amount: Number(e.target.value) })} 
          />
          <Input 
            label="Valid Until" 
            type="date" 
            value={formData.valid_until || ''} 
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })} 
          />
          <div className="modal-footer">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinanceEstimates;
