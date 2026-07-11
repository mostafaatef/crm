import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

interface Organization {
  id?: number;
  name: string;
  website?: string | null;
  industry?: string | null;
  notes?: string | null;
}

const Organizations: React.FC = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [notes, setNotes] = useState('');
  
  const navigate = useNavigate();

  const fetchOrgs = async () => {
    const res = await fetch('/api/organizations');
    const data = await res.json();
    setOrgs(data);
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleOpenModal = (org?: Organization) => {
    if (org) {
      setEditingOrg(org);
      setName(org.name);
      setWebsite(org.website || '');
      setIndustry(org.industry || '');
      setNotes(org.notes || '');
    } else {
      setEditingOrg(null);
      setName('');
      setWebsite('');
      setIndustry('');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name) return;
    
    const payload = { name, website, industry, notes };
    const method = editingOrg ? 'PUT' : 'POST';
    const url = editingOrg ? `/api/organizations/${editingOrg.id}` : '/api/organizations';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    setIsModalOpen(false);
    fetchOrgs();
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this organization?')) return;
    await fetch(`/api/organizations/${id}`, { method: 'DELETE' });
    fetchOrgs();
  };

  const filteredOrgs = orgs.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Organization },
    { header: 'Website', accessor: 'website' as keyof Organization },
    { header: 'Industry', accessor: 'industry' as keyof Organization },
    { 
      header: 'Actions', 
      accessor: (org: Organization) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleOpenModal(org); }}>Edit</Button>
          <Button variant="danger" onClick={(e) => handleDelete(e, org.id!)}>Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Organizations</h1>
        <Button onClick={() => handleOpenModal()}>Add Organization</Button>
      </div>
      
      <div style={{ marginBottom: '20px', maxWidth: '300px' }}>
        <Input 
          placeholder="Search organizations..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      <div className="card">
        <Table 
          data={filteredOrgs} 
          columns={columns} 
          onRowClick={(org) => navigate(`/organizations/${org.id}`)}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingOrg ? 'Edit Organization' : 'Add Organization'}>
        <Input label="Name" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Website" value={website} onChange={e => setWebsite(e.target.value)} />
        <Input label="Industry" value={industry} onChange={e => setIndustry(e.target.value)} />
        <Input label="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
        <div className="modal-footer">
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Organizations;
