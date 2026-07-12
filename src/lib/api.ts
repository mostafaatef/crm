export const getTenantId = (): string | null => {
  return localStorage.getItem('tenantId');
};

export const setTenantId = (id: string) => {
  localStorage.setItem('tenantId', id);
};

export const clearTenantId = () => {
  localStorage.removeItem('tenantId');
};

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const tenantId = getTenantId();
  const headers = new Headers(init?.headers);
  if (tenantId) {
    headers.set('X-Tenant-ID', tenantId);
  }
  
  return fetch(input, {
    ...init,
    headers,
  });
};
