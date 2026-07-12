import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';
import { useTenant } from '../context/TenantContext';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

const Layout: React.FC = () => {
  const { tenants, currentTenantId, setCurrentTenantId, refreshTenants } = useTenant();
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');

  const handleCreateTenant = async () => {
    if (!newTenantName.trim()) return;
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTenantName.trim() })
      });
      if (res.ok) {
        const newTenant = await res.json() as { id: number };
        await refreshTenants();
        setCurrentTenantId(newTenant.id);
        setIsAddTenantOpen(false);
        setNewTenantName('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          Personal CRM
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>Workspace</label>
            <button 
              onClick={() => setIsAddTenantOpen(true)}
              style={{ fontSize: '12px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
            >
              + New
            </button>
          </div>
          <select 
            value={currentTenantId || ''} 
            onChange={(e) => setCurrentTenantId(Number(e.target.value))}
            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
          >
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <nav className="nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
          <NavLink to="/organizations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Organizations</NavLink>
          <NavLink to="/contacts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Contacts</NavLink>
          <NavLink to="/deals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Deals</NavLink>
          <NavLink to="/pipeline" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Pipeline</NavLink>
          <NavLink to="/finance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Finance</NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '16px', marginBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <GlobalSearch />
        </div>
        <Outlet />
      </main>

      <Modal isOpen={isAddTenantOpen} onClose={() => setIsAddTenantOpen(false)} title="New Workspace">
        <Input 
          label="Workspace Name" 
          value={newTenantName} 
          onChange={(e) => setNewTenantName(e.target.value)} 
          placeholder="e.g. My Startup"
        />
        <div className="modal-footer">
          <Button variant="ghost" onClick={() => setIsAddTenantOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTenant}>Create Workspace</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Layout;
