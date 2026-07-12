import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTenantId, setTenantId as setLocalTenantId } from '../lib/api';

interface Tenant {
  id: number;
  name: string;
}

interface TenantContextType {
  tenants: Tenant[];
  currentTenantId: number | null;
  setCurrentTenantId: (id: number) => void;
  refreshTenants: () => Promise<void>;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenantId, setCurrentTenantIdState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants');
      const data = await res.json();
      const tenantsData = data as Tenant[];
      setTenants(tenantsData);
      const storedId = getTenantId();
      if (storedId && tenantsData.find((t: Tenant) => t.id === parseInt(storedId))) {
        setCurrentTenantIdState(parseInt(storedId));
      } else if (tenantsData.length > 0) {
        setCurrentTenantIdState(tenantsData[0].id);
        setLocalTenantId(tenantsData[0].id.toString());
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load tenants', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const refreshTenants = async () => {
    await fetchTenants();
  };

  const setCurrentTenantId = (id: number) => {
    setCurrentTenantIdState(id);
    setLocalTenantId(id.toString());
    // Reload the page to reset all application state
    window.location.reload();
  };

  if (isLoading) {
    return <div style={{ padding: '24px' }}>Loading Workspace...</div>;
  }

  return (
    <TenantContext.Provider value={{ tenants, currentTenantId, setCurrentTenantId, refreshTenants, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
