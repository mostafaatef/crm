import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          Personal CRM
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
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
