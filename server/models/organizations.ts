import type { D1Database } from '@cloudflare/workers-types';

export interface Organization {
  id?: number;
  tenant_id?: number;
  name: string;
  type?: string | null;
  website?: string | null;
  industry?: string | null;
  notes?: string | null;
  created_at?: string;
}

export const organizations = {
  getAll: async (db: D1Database, tenantId: number) => {
    const { results } = await db.prepare('SELECT * FROM organizations WHERE tenant_id = ? ORDER BY name ASC').bind(tenantId).all<Organization>();
    return results;
  },
  getById: async (db: D1Database, tenantId: number, id: number) => {
    return await db.prepare('SELECT * FROM organizations WHERE tenant_id = ? AND id = ?').bind(tenantId, id).first<Organization>();
  },
  create: async (db: D1Database, tenantId: number, org: Organization) => {
    const info = await db.prepare('INSERT INTO organizations (tenant_id, name, type, website, industry, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING *')
      .bind(tenantId, org.name, org.type || 'Client', org.website || null, org.industry || null, org.notes || null)
      .first<Organization>();
    return info;
  },
  update: async (db: D1Database, tenantId: number, id: number, org: Partial<Organization>) => {
    const fields = ['name', 'type', 'website', 'industry', 'notes'].filter(f => org[f as keyof Organization] !== undefined);
    if (fields.length === 0) return await organizations.getById(db, tenantId, id);
    const sets = fields.map((f, i) => `${f} = ?${i + 1}`).join(', ');
    const values = fields.map(f => org[f as keyof Organization]);
    const info = await db.prepare(`UPDATE organizations SET ${sets} WHERE tenant_id = ?${fields.length + 1} AND id = ?${fields.length + 2} RETURNING *`)
      .bind(...values, tenantId, id)
      .first<Organization>();
    return info;
  },
  delete: async (db: D1Database, tenantId: number, id: number) => {
    await db.prepare('DELETE FROM organizations WHERE tenant_id = ? AND id = ?').bind(tenantId, id).run();
  }
};
