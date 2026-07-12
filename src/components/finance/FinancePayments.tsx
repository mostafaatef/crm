import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Table } from '../ui/Table';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

export interface Payment {
  id: number;
  invoice_id: number;
  amount: number;
  payment_date: string | null;
  method: string | null;
  created_at: string;
}

interface Props {
  invoiceId: number;
}

const FinancePayments: React.FC<Props> = ({ invoiceId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Payment>>({});

  const fetchPayments = async () => {
    const res = await fetch(`/api/finance/invoices/${invoiceId}/payments`);
    if (res.ok) {
      setPayments(await res.json());
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [invoiceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/finance/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, invoice_id: invoiceId }),
    });
    if (res.ok) {
      setIsModalOpen(false);
      setFormData({});
      fetchPayments();
    }
  };

  const columns = [
    { header: 'Amount', accessor: (p: Payment) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.amount) },
    { header: 'Payment Date', accessor: (p: Payment) => p.payment_date || 'N/A' },
    { header: 'Method', accessor: (p: Payment) => p.method || 'N/A' },
  ];

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ margin: 0, fontWeight: 500 }}>Payments</p>
        <Button onClick={() => setIsModalOpen(true)} variant="ghost">Add Payment</Button>
      </div>

      <Table data={payments} columns={columns} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Payment">
        <form onSubmit={handleSubmit}>
          <Input 
            label="Amount" 
            type="number" 
            value={formData.amount || ''} 
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} 
            required
          />
          <Input 
            label="Payment Date" 
            type="date" 
            value={formData.payment_date || ''} 
            onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })} 
          />
          <div className="input-group">
            <label className="input-label">Method</label>
            <select 
              className="input-field select-field"
              value={formData.method || 'Transfer'}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
            >
              <option value="Transfer">Transfer</option>
              <option value="Check">Check</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
            </select>
          </div>
          <div className="modal-footer">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinancePayments;
