import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../components/ui/Table';

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'estimates' | 'subcontracts' | 'expenses' | 'invoices'>('contracts');
  const [data, setData] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/finance/${activeTab}/all`);
      if (res.ok) {
        setData(await res.json());
      }
    };
    fetchData();
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'contracts':
        return (
          <Table 
            data={data} 
            columns={[
              { header: 'Deal', accessor: (c: any) => c.deal_name || `Deal ID: ${c.deal_id}` },
              { header: 'Contract #', accessor: 'contract_number' },
              { header: 'Status', accessor: 'status' },
              { header: 'Total Value', accessor: (c: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(c.total_value) },
              { header: 'Signed Date', accessor: (c: any) => c.signed_date || 'N/A' },
            ]}
            onRowClick={(row) => navigate(`/deals/${row.deal_id}`)}
          />
        );
      case 'invoices':
        return (
          <Table 
            data={data} 
            columns={[
              { header: 'Deal', accessor: (i: any) => i.deal_name || 'N/A' },
              { header: 'Contract #', accessor: (i: any) => i.contract_number || 'N/A' },
              { header: 'Invoice #', accessor: 'invoice_number' },
              { header: 'Status', accessor: 'status' },
              { header: 'Amount', accessor: (i: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(i.amount) },
              { header: 'Issue Date', accessor: (i: any) => i.issue_date || 'N/A' },
              { header: 'Due Date', accessor: (i: any) => i.due_date || 'N/A' },
            ]}
            onRowClick={(row) => navigate(`/deals/${row.deal_id}`)}
          />
        );
      case 'estimates':
        return (
          <Table 
            data={data} 
            columns={[
              { header: 'Deal', accessor: (e: any) => e.deal_name || `Deal ID: ${e.deal_id}` },
              { header: 'Estimate #', accessor: 'estimate_number' },
              { header: 'Status', accessor: 'status' },
              { header: 'Total Amount', accessor: (e: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(e.total_amount) },
              { header: 'Valid Until', accessor: (e: any) => e.valid_until || 'N/A' },
            ]}
            onRowClick={(row) => navigate(`/deals/${row.deal_id}`)}
          />
        );
      case 'subcontracts':
        return (
          <Table 
            data={data} 
            columns={[
              { header: 'Deal', accessor: (s: any) => s.deal_name || `Deal ID: ${s.deal_id}` },
              { header: 'Subcontractor', accessor: (s: any) => s.subcontractor_name || `Org ID: ${s.subcontractor_organization_id}` },
              { header: 'Status', accessor: 'status' },
              { header: 'Committed Value', accessor: (s: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(s.committed_value) },
            ]}
            onRowClick={(row) => navigate(`/deals/${row.deal_id}`)}
          />
        );
      case 'expenses':
        return (
          <Table 
            data={data} 
            columns={[
              { header: 'Deal', accessor: (e: any) => e.deal_name || `Deal ID: ${e.deal_id}` },
              { header: 'Category', accessor: 'category' },
              { header: 'Amount', accessor: (e: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(e.amount) },
              { header: 'Date Incurred', accessor: (e: any) => e.date_incurred || 'N/A' },
              { header: 'Vendor', accessor: (e: any) => e.vendor_name || 'N/A' },
            ]}
            onRowClick={(row) => navigate(`/deals/${row.deal_id}`)}
          />
        );
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Global Finance</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Overview of all financial records across all deals. Click a record to open the associated deal.
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          <button 
            className={`btn ${activeTab === 'contracts' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setActiveTab('contracts')}
          >
            Contracts
          </button>
          <button 
            className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setActiveTab('invoices')}
          >
            Invoices
          </button>
          <button 
            className={`btn ${activeTab === 'estimates' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setActiveTab('estimates')}
          >
            Estimates
          </button>
          <button 
            className={`btn ${activeTab === 'subcontracts' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setActiveTab('subcontracts')}
          >
            Subcontracts
          </button>
          <button 
            className={`btn ${activeTab === 'expenses' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setActiveTab('expenses')}
          >
            Expenses
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default Finance;
