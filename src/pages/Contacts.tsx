import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';

interface Contact {
  id?: number;
  organization_id?: number | null;
  organization_name?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  job_title?: string | null;
  status: string;
}

interface Organization {
  id: number;
  name: string;
}

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState('lead');
  const [organizationId, setOrganizationId] = useState('');
  
  const navigate = useNavigate();

  const fetchData = async () => {
    const [cRes, oRes] = await Promise.all([
      fetch('/api/contacts'),
      fetch('/api/organizations')
    ]);
    setContacts(await cRes.json());
    setOrgs(await oRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setName(contact.name);
      setEmail(contact.email || '');
      setPhone(contact.phone || '');
      setJobTitle(contact.job_title || '');
      setStatus(contact.status);
      setOrganizationId(contact.organization_id ? String(contact.organization_id) : '');
    } else {
      setEditingContact(null);
      setName('');
      setEmail('');
      setPhone('');
      setJobTitle('');
      setStatus('lead');
      setOrganizationId('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name) return;
    
    const payload = { 
      name, 
      email, 
      phone, 
      job_title: jobTitle, 
      status, 
      organization_id: organizationId ? Number(organizationId) : null 
    };
    const method = editingContact ? 'PUT' : 'POST';
    const url = editingContact ? `/api/contacts/${editingContact.id}` : '/api/contacts';
    
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
    if (!confirm('Are you sure you want to delete this contact?')) return;
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Contact },
    { header: 'Email', accessor: 'email' as keyof Contact },
    { header: 'Organization', accessor: 'organization_name' as keyof Contact },
    { header: 'Status', accessor: 'status' as keyof Contact },
    { 
      header: 'Actions', 
      accessor: (contact: Contact) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleOpenModal(contact); }}>Edit</Button>
          <Button variant="danger" onClick={(e) => handleDelete(e, contact.id!)}>Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Contacts</h1>
        <Button onClick={() => handleOpenModal()}>Add Contact</Button>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', maxWidth: '500px' }}>
        <Input 
          placeholder="Search by name or email..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="flex-1"
          style={{ flex: 1, marginBottom: 0 }}
        />
        <Select 
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'lead', label: 'Lead' },
            { value: 'qualified', label: 'Qualified' },
            { value: 'customer', label: 'Customer' }
          ]}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ width: '150px', marginBottom: 0 }}
        />
      </div>

      <div className="card">
        <Table 
          data={filteredContacts} 
          columns={columns} 
          onRowClick={(contact) => navigate(`/contacts/${contact.id}`)}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingContact ? 'Edit Contact' : 'Add Contact'}>
        <Input label="Name" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <Input label="Job Title" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
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
          label="Status"
          options={[
            { value: 'lead', label: 'Lead' },
            { value: 'qualified', label: 'Qualified' },
            { value: 'customer', label: 'Customer' }
          ]}
          value={status}
          onChange={e => setStatus(e.target.value)}
        />
        <div className="modal-footer">
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Contacts;
