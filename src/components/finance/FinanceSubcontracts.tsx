import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Table } from '../ui/Table';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

export interface Subcontract {
  id: number;
  deal_id: number;
  subcontractor_organization_id: number;
  subcontractor_name?: string; // Included from JOIN
  status: string;
  committed_value: number;
  scope_of_work: string | null;
  created_at: string;
}

interface Props {
  dealId: number;
}

const FinanceSubcontracts: React.FC<Props> = ({ dealId }) => {
  const [subcontracts, setSubcontracts] = useState<Subcontract[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Subcontract>>({});
  const [organizations, setOrganizations] = useState<{ id: number; name: string }[]>([]);

  const fetchSubcontracts = async () => {
    const res = await fetch(`/api/finance/deals/${dealId}/subcontracts`);
    if (res.ok) {
      setSubcontracts(await res.json());
    }
  };

  const fetchOrganizations = async () => {
    const res = await fetch('/api/organizations');
    if (res.ok) {
      setOrganizations(await res.json());
    }
  };

  useEffect(() => {
    fetchSubcontracts();
    fetchOrganizations();
  }, [dealId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/finance/subcontracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, deal_id: dealId }),
    });
    if (res.ok) {
      setIsModalOpen(false);
      setFormData({});
      fetchSubcontracts();
    }
  };

  const columns = [
    { header: 'Subcontractor', accessor: (s: Subcontract) => s.subcontractor_name || `Org ID: ${s.subcontractor_organization_id}` },
    { header: 'Status', accessor: 'status' as keyof Subcontract },
    { header: 'Committed Value', accessor: (s: Subcontract) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(s.committed_value) },
    { header: 'Scope of Work', accessor: (s: Subcontract) => s.scope_of_work || 'N/A' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>Subcontracts</h3>
        <Button onClick={() => setIsModalOpen(true)}>Add Subcontract</Button>
      </div>

      <Table data={subcontracts} columns={columns} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Subcontract">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Subcontractor</label>
            <select 
              className="input-field select-field"
              value={formData.subcontractor_organization_id || ''}
              onChange={(e) => setFormData({ ...formData, subcontractor_organization_id: Number(e.target.value) })}
              required
            >
              <option value="" disabled>Select Organization</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Status</label>
            <select 
              className="input-field select-field"
              value={formData.status || 'Draft'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <Input 
            label="Committed Value" 
            type="number" 
            value={formData.committed_value || ''} 
            onChange={(e) => setFormData({ ...formData, committed_value: Number(e.target.value) })} 
          />
          <Input 
            label="Scope of Work" 
            value={formData.scope_of_work || ''} 
            onChange={(e) => setFormData({ ...formData, scope_of_work: e.target.value })} 
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

export default FinanceSubcontracts;
