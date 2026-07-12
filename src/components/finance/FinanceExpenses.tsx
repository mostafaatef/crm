import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Table } from '../ui/Table';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Subcontract } from './FinanceSubcontracts';

export interface Expense {
  id: number;
  deal_id: number;
  subcontract_id: number | null;
  category: string;
  amount: number;
  date_incurred: string | null;
  vendor_name: string | null;
  description: string | null;
  created_at: string;
}

interface Props {
  dealId: number;
}

const FinanceExpenses: React.FC<Props> = ({ dealId }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subcontracts, setSubcontracts] = useState<Subcontract[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({});

  const fetchExpenses = async () => {
    const res = await fetch(`/api/finance/deals/${dealId}/expenses`);
    if (res.ok) {
      setExpenses(await res.json());
    }
  };

  const fetchSubcontracts = async () => {
    const res = await fetch(`/api/finance/deals/${dealId}/subcontracts`);
    if (res.ok) {
      setSubcontracts(await res.json());
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchSubcontracts();
  }, [dealId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, deal_id: dealId };
    if (!payload.subcontract_id) delete payload.subcontract_id;

    const res = await fetch('/api/finance/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setIsModalOpen(false);
      setFormData({});
      fetchExpenses();
    }
  };

  const columns = [
    { header: 'Category', accessor: 'category' as keyof Expense },
    { header: 'Amount', accessor: (e: Expense) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(e.amount) },
    { header: 'Date Incurred', accessor: (e: Expense) => e.date_incurred || 'N/A' },
    { header: 'Vendor', accessor: (e: Expense) => e.vendor_name || 'N/A' },
    { header: 'Description', accessor: (e: Expense) => e.description || 'N/A' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>Expenses</h3>
        <Button onClick={() => setIsModalOpen(true)}>Add Expense</Button>
      </div>

      <Table data={expenses} columns={columns} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Expense">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Category</label>
            <select 
              className="input-field select-field"
              value={formData.category || 'Material'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Material">Material</option>
              <option value="Labor">Labor</option>
              <option value="Equipment">Equipment</option>
              <option value="Subcontractor">Subcontractor</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Related Subcontract (Optional)</label>
            <select 
              className="input-field select-field"
              value={formData.subcontract_id || ''}
              onChange={(e) => setFormData({ ...formData, subcontract_id: Number(e.target.value) })}
            >
              <option value="">None</option>
              {subcontracts.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.subcontractor_name || `Org ID: ${sub.subcontractor_organization_id}`} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(sub.committed_value)}
                </option>
              ))}
            </select>
          </div>
          <Input 
            label="Amount" 
            type="number" 
            value={formData.amount || ''} 
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} 
            required
          />
          <Input 
            label="Date Incurred" 
            type="date" 
            value={formData.date_incurred || ''} 
            onChange={(e) => setFormData({ ...formData, date_incurred: e.target.value })} 
          />
          <Input 
            label="Vendor Name" 
            value={formData.vendor_name || ''} 
            onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })} 
          />
          <Input 
            label="Description" 
            value={formData.description || ''} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
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

export default FinanceExpenses;
