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
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenantId, setCurrentTenantIdState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We cannot use apiFetch here easily without circular dependencies or just plain fetch is fine since we don't need tenant ID to fetch tenants
    fetch('/api/tenants')
      .then(res => res.json())
      .then((data: unknown) => {
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
      })
      .catch(err => {
        console.error('Failed to load tenants', err);
        setIsLoading(false);
      });
  }, []);

  const setCurrentTenantId = (id: number) => {
    setCurrentTenantIdState(id);
    setLocalTenantId(id.toString());
    // Reload the page to reset all application state
    window.location.reload();
  };

  return (
    <TenantContext.Provider value={{ tenants, currentTenantId, setCurrentTenantId, isLoading }}>
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
