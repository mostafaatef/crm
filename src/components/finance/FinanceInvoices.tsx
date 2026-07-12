import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Table } from '../ui/Table';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import FinancePayments from './FinancePayments';

export interface Invoice {
  id: number;
  contract_id: number;
  invoice_number: string;
  status: string;
  amount: number;
  issue_date: string | null;
  due_date: string | null;
  created_at: string;
}

interface Props {
  contractId: number;
}

const FinanceInvoices: React.FC<Props> = ({ contractId }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Invoice>>({});
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    const res = await fetch(`/api/finance/contracts/${contractId}/invoices`);
    if (res.ok) {
      setInvoices(await res.json());
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [contractId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/finance/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, contract_id: contractId }),
    });
    if (res.ok) {
      setIsModalOpen(false);
      setFormData({});
      fetchInvoices();
    }
  };

  const columns = [
    { header: 'Invoice #', accessor: 'invoice_number' as keyof Invoice },
    { header: 'Status', accessor: 'status' as keyof Invoice },
    { header: 'Amount', accessor: (inv: Invoice) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(inv.amount) },
    { header: 'Issue Date', accessor: (inv: Invoice) => inv.issue_date || 'N/A' },
    { header: 'Due Date', accessor: (inv: Invoice) => inv.due_date || 'N/A' },
  ];

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h5 style={{ margin: 0 }}>Invoices</h5>
        <Button onClick={() => setIsModalOpen(true)} variant="secondary">Add Invoice</Button>
      </div>

      <Table 
        data={invoices} 
        columns={columns} 
        onRowClick={(row) => setSelectedInvoice(selectedInvoice?.id === row.id ? null : row)}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Invoice">
        <form onSubmit={handleSubmit}>
          <Input 
            label="Invoice Number" 
            value={formData.invoice_number || ''} 
            onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })} 
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
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <Input 
            label="Amount" 
            type="number" 
            value={formData.amount || ''} 
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} 
          />
          <Input 
            label="Issue Date" 
            type="date" 
            value={formData.issue_date || ''} 
            onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} 
          />
          <Input 
            label="Due Date" 
            type="date" 
            value={formData.due_date || ''} 
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} 
          />
          <div className="modal-footer">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {selectedInvoice && (
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <h6>Payments for Invoice: {selectedInvoice.invoice_number}</h6>
          <FinancePayments invoiceId={selectedInvoice.id} />
        </div>
      )}
    </div>
  );
};

export default FinanceInvoices;
