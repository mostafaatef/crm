import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Table } from '../ui/Table';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import FinanceInvoices from './FinanceInvoices';

export interface Contract {
  id: number;
  deal_id: number;
  contract_number: string;
  status: string;
  total_value: number;
  signed_date: string | null;
  scope_of_work: string | null;
  created_at: string;
}

interface Props {
  dealId: number;
}

const FinanceContracts: React.FC<Props> = ({ dealId }) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Contract>>({});
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const fetchContracts = async () => {
    const res = await fetch(`/api/finance/deals/${dealId}/contracts`);
    if (res.ok) {
      setContracts(await res.json());
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [dealId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/finance/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, deal_id: dealId }),
    });
    if (res.ok) {
      setIsModalOpen(false);
      setFormData({});
      fetchContracts();
    }
  };

  const columns = [
    { header: 'Contract #', accessor: 'contract_number' as keyof Contract },
    { header: 'Status', accessor: 'status' as keyof Contract },
    { header: 'Total Value', accessor: (c: Contract) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(c.total_value) },
    { header: 'Signed Date', accessor: (c: Contract) => c.signed_date || 'N/A' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>Contracts</h3>
        <Button onClick={() => setIsModalOpen(true)}>Add Contract</Button>
      </div>

      <Table 
        data={contracts} 
        columns={columns} 
        onRowClick={(row) => setSelectedContract(selectedContract?.id === row.id ? null : row)} 
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Contract">
        <form onSubmit={handleSubmit}>
          <Input 
            label="Contract Number" 
            value={formData.contract_number || ''} 
            onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })} 
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
              <option value="Signed">Signed</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <Input 
            label="Total Value" 
            type="number" 
            value={formData.total_value || ''} 
            onChange={(e) => setFormData({ ...formData, total_value: Number(e.target.value) })} 
          />
          <Input 
            label="Signed Date" 
            type="date" 
            value={formData.signed_date || ''} 
            onChange={(e) => setFormData({ ...formData, signed_date: e.target.value })} 
          />
          <div className="modal-footer">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {selectedContract && (
        <div style={{ marginTop: '32px', padding: '16px', border: '1px solid var(--color-primary)', borderRadius: '8px' }}>
          <h4>Invoices for Contract: {selectedContract.contract_number}</h4>
          <FinanceInvoices contractId={selectedContract.id} />
        </div>
      )}
    </div>
  );
};

export default FinanceContracts;
