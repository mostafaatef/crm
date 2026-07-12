import type { D1Database } from '@cloudflare/workers-types';

export interface Contact {
  id?: number;
  tenant_id?: number;
  organization_id?: number | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  job_title?: string | null;
  status?: string; // lead, qualified, customer
  created_at?: string;
}

export const contacts = {
  getAll: async (db: D1Database, tenantId: number) => {
    const { results } = await db.prepare('SELECT * FROM contacts WHERE tenant_id = ? ORDER BY name ASC').bind(tenantId).all<Contact>();
    return results;
  },
  getById: async (db: D1Database, tenantId: number, id: number) => {
    return await db.prepare('SELECT * FROM contacts WHERE tenant_id = ? AND id = ?').bind(tenantId, id).first<Contact>();
  },
  getByOrganizationId: async (db: D1Database, tenantId: number, orgId: number) => {
    const { results } = await db.prepare('SELECT * FROM contacts WHERE tenant_id = ? AND organization_id = ?').bind(tenantId, orgId).all<Contact>();
    return results;
  },
  create: async (db: D1Database, tenantId: number, contact: Contact) => {
    const info = await db.prepare(`INSERT INTO contacts (tenant_id, organization_id, name, email, phone, job_title, status) 
                             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) RETURNING *`)
      .bind(
        tenantId,
        contact.organization_id || null,
        contact.name,
        contact.email || null,
        contact.phone || null,
        contact.job_title || null,
        contact.status || 'lead'
      )
      .first<Contact>();
    return info;
  },
  update: async (db: D1Database, tenantId: number, id: number, contact: Partial<Contact>) => {
    const fields = ['organization_id', 'name', 'email', 'phone', 'job_title', 'status'].filter(f => contact[f as keyof Contact] !== undefined);
    if (fields.length === 0) return await contacts.getById(db, tenantId, id);
    const sets = fields.map((f, i) => `${f} = ?${i + 1}`).join(', ');
    const values = fields.map(f => contact[f as keyof Contact]);
    const info = await db.prepare(`UPDATE contacts SET ${sets} WHERE tenant_id = ?${fields.length + 1} AND id = ?${fields.length + 2} RETURNING *`)
      .bind(...values, tenantId, id)
      .first<Contact>();
    return info;
  },
  delete: async (db: D1Database, tenantId: number, id: number) => {
    await db.prepare('DELETE FROM contacts WHERE tenant_id = ? AND id = ?').bind(tenantId, id).run();
  }
};
