import type { D1Database } from '@cloudflare/workers-types';

export interface Deal {
  id?: number;
  tenant_id?: number;
  organization_id?: number | null;
  contact_id?: number | null;
  name: string;
  stage: string;
  value: number;
  close_date?: string | null;
  created_at?: string;
}

export const deals = {
  getAll: async (db: D1Database, tenantId: number) => {
    const { results } = await db.prepare(`
      SELECT d.*, o.name as organization_name, c.name as contact_name
      FROM deals d
      LEFT JOIN organizations o ON d.organization_id = o.id
      LEFT JOIN contacts c ON d.contact_id = c.id
      WHERE d.tenant_id = ?
      ORDER BY d.created_at DESC
    `).bind(tenantId).all<Deal & { organization_name: string | null, contact_name: string | null }>();
    return results;
  },
  getById: async (db: D1Database, tenantId: number, id: number) => {
    return await db.prepare(`
      SELECT d.*, o.name as organization_name, c.name as contact_name
      FROM deals d
      LEFT JOIN organizations o ON d.organization_id = o.id
      LEFT JOIN contacts c ON d.contact_id = c.id
      WHERE d.tenant_id = ? AND d.id = ?
    `).bind(tenantId, id).first<Deal & { organization_name: string | null, contact_name: string | null }>();
  },
  getByOrganizationId: async (db: D1Database, tenantId: number, orgId: number) => {
    const { results } = await db.prepare('SELECT * FROM deals WHERE tenant_id = ? AND organization_id = ?').bind(tenantId, orgId).all<Deal>();
    return results;
  },
  create: async (db: D1Database, tenantId: number, deal: Deal) => {
    const info = await db.prepare(`INSERT INTO deals (tenant_id, organization_id, contact_id, name, stage, value, close_date) 
                             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) RETURNING *`)
      .bind(
        tenantId,
        deal.organization_id || null,
        deal.contact_id || null,
        deal.name,
        deal.stage || 'New',
        deal.value || 0,
        deal.close_date || null
      )
      .first<Deal>();
    if (!info) return undefined;
    return await deals.getById(db, tenantId, info.id as number);
  },
  update: async (db: D1Database, tenantId: number, id: number, deal: Partial<Deal>) => {
    const fields = ['organization_id', 'contact_id', 'name', 'stage', 'value', 'close_date'].filter(f => deal[f as keyof Deal] !== undefined);
    if (fields.length === 0) return await deals.getById(db, tenantId, id);
    const sets = fields.map((f, i) => `${f} = ?${i + 1}`).join(', ');
    const values = fields.map(f => deal[f as keyof Deal]);
    const info = await db.prepare(`UPDATE deals SET ${sets} WHERE tenant_id = ?${fields.length + 1} AND id = ?${fields.length + 2} RETURNING *`)
      .bind(...values, tenantId, id)
      .first<Deal>();
    if (!info) return undefined;
    return await deals.getById(db, tenantId, info.id as number);
  },
  delete: async (db: D1Database, tenantId: number, id: number) => {
    await db.prepare('DELETE FROM deals WHERE tenant_id = ? AND id = ?').bind(tenantId, id).run();
  }
};
