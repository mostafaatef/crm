import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { TenantProvider } from './context/TenantContext';
import { getTenantId } from './lib/api';

// Intercept window.fetch to inject X-Tenant-ID header globally
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
  
  // Skip tenant header for /api/tenants to avoid circular/unnecessary
  if (url.startsWith('/api/') && !url.includes('/api/tenants')) {
    const tenantId = getTenantId();
    if (tenantId) {
      const headers = new Headers(init?.headers);
      headers.set('X-Tenant-ID', tenantId);
      init = { ...init, headers };
    }
  }
  return originalFetch(input, init);
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <TenantProvider>
      <App />
    </TenantProvider>
  </React.StrictMode>
);
