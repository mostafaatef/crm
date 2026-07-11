import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';

interface Deal {
  id?: number;
  organization_id?: number | null;
  organization_name?: string | null;
  contact_id?: number | null;
  contact_name?: string | null;
  name: string;
  stage: string;
  value: number;
  close_date?: string | null;
}

interface Organization { id: number; name: string; }
interface Contact { id: number; name: string; organization_id: number | null; }

const Deals: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [stage, setStage] = useState('New');
  const [value, setValue] = useState(0);
  const [closeDate, setCloseDate] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [contactId, setContactId] = useState('');
  
  const navigate = useNavigate();

  const fetchData = async () => {
    const [dRes, oRes, cRes] = await Promise.all([
      fetch('/api/deals'),
      fetch('/api/organizations'),
      fetch('/api/contacts')
    ]);
    setDeals(await dRes.json());
    setOrgs(await oRes.json());
    setContacts(await cRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (deal?: Deal) => {
    if (deal) {
      setEditingDeal(deal);
      setName(deal.name);
      setStage(deal.stage);
      setValue(deal.value);
      setCloseDate(deal.close_date || '');
      setOrganizationId(deal.organization_id ? String(deal.organization_id) : '');
      setContactId(deal.contact_id ? String(deal.contact_id) : '');
    } else {
      setEditingDeal(null);
      setName('');
      setStage('New');
      setValue(0);
      setCloseDate('');
      setOrganizationId('');
      setContactId('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name) return;
    
    const payload = { 
      name, 
      stage, 
      value: Number(value), 
      close_date: closeDate || null, 
      organization_id: organizationId ? Number(organizationId) : null,
      contact_id: contactId ? Number(contactId) : null
    };
    const method = editingDeal ? 'PUT' : 'POST';
    const url = editingDeal ? `/api/deals/${editingDeal.id}` : '/api/deals';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this deal?')) return;
    await fetch(`/api/deals/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const filteredDeals = deals.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Deal },
    { header: 'Organization', accessor: 'organization_name' as keyof Deal },
    { header: 'Primary Contact', accessor: 'contact_name' as keyof Deal },
    { header: 'Stage', accessor: 'stage' as keyof Deal },
    { 
      header: 'Value', 
      accessor: (deal: Deal) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.value) 
    },
    { header: 'Close Date', accessor: 'close_date' as keyof Deal },
    { 
      header: 'Actions', 
      accessor: (deal: Deal) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleOpenModal(deal); }}>Edit</Button>
          <Button variant="danger" onClick={(e) => handleDelete(e, deal.id!)}>Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Deals</h1>
        <Button onClick={() => handleOpenModal()}>Add Deal</Button>
      </div>
      
      <div style={{ marginBottom: '20px', maxWidth: '300px' }}>
        <Input 
          placeholder="Search deals..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      <div className="card">
        <Table 
          data={filteredDeals} 
          columns={columns} 
          onRowClick={(deal) => navigate(`/deals/${deal.id}`)}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDeal ? 'Edit Deal' : 'Add Deal'}>
        <Input label="Name" value={name} onChange={e => setName(e.target.value)} />
        <Select 
          label="Stage"
          options={[
            { value: 'New', label: 'New' },
            { value: 'Qualified', label: 'Qualified' },
            { value: 'Proposal', label: 'Proposal' },
            { value: 'Negotiation', label: 'Negotiation' },
            { value: 'Won', label: 'Won' },
            { value: 'Lost', label: 'Lost' }
          ]}
          value={stage}
          onChange={e => setStage(e.target.value)}
        />
        <Input label="Value (USD)" type="number" value={value} onChange={e => setValue(Number(e.target.value))} />
        <Input label="Close Date" type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)} />
        <Select 
          label="Organization"
          options={[
            { value: '', label: 'None' },
            ...orgs.map(o => ({ value: String(o.id), label: o.name }))
          ]}
          value={organizationId}
          onChange={e => setOrganizationId(e.target.value)}
        />
        <Select 
          label="Primary Contact"
          options={[
            { value: '', label: 'None' },
            ...contacts
                .filter(c => !organizationId || String(c.organization_id) === organizationId)
                .map(c => ({ value: String(c.id), label: c.name }))
          ]}
          value={contactId}
          onChange={e => setContactId(e.target.value)}
        />
        <div className="modal-footer">
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Deals;
