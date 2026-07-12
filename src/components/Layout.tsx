import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';
import { useTenant } from '../context/TenantContext';

const Layout: React.FC = () => {
  const { tenants, currentTenantId, setCurrentTenantId } = useTenant();

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          Personal CRM
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-light)', marginBottom: '4px' }}>Tenant</label>
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
    </div>
  );
};

export default Layout;
