import React, { useState } from 'react';
import FinanceEstimates from './FinanceEstimates';
import FinanceContracts from './FinanceContracts';
import FinanceSubcontracts from './FinanceSubcontracts';
import FinanceExpenses from './FinanceExpenses';

interface Props {
  dealId: number;
}

const DealFinanceSection: React.FC<Props> = ({ dealId }) => {
  const [activeTab, setActiveTab] = useState<'estimates' | 'contracts' | 'subcontracts' | 'expenses'>('estimates');

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Financials</h2>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
        <button 
          className={`btn ${activeTab === 'estimates' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('estimates')}
        >
          Estimates
        </button>
        <button 
          className={`btn ${activeTab === 'contracts' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('contracts')}
        >
          Contracts & Invoices
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

      <div>
        {activeTab === 'estimates' && <FinanceEstimates dealId={dealId} />}
        {activeTab === 'contracts' && <FinanceContracts dealId={dealId} />}
        {activeTab === 'subcontracts' && <FinanceSubcontracts dealId={dealId} />}
        {activeTab === 'expenses' && <FinanceExpenses dealId={dealId} />}
      </div>
    </div>
  );
};

export default DealFinanceSection;
