import type { D1Database } from '@cloudflare/workers-types';

export interface Deal {
  id?: number;
  organization_id?: number | null;
  contact_id?: number | null;
  name: string;
  stage: string;
  value: number;
  close_date?: string | null;
  created_at?: string;
}

export const deals = {
  getAll: async (db: D1Database) => {
    const { results } = await db.prepare(`
      SELECT d.*, o.name as organization_name, c.name as contact_name
      FROM deals d
      LEFT JOIN organizations o ON d.organization_id = o.id
      LEFT JOIN contacts c ON d.contact_id = c.id
      ORDER BY d.created_at DESC
    `).all<Deal & { organization_name: string | null, contact_name: string | null }>();
    return results;
  },
  getById: async (db: D1Database, id: number) => {
    return await db.prepare(`
      SELECT d.*, o.name as organization_name, c.name as contact_name
      FROM deals d
      LEFT JOIN organizations o ON d.organization_id = o.id
      LEFT JOIN contacts c ON d.contact_id = c.id
      WHERE d.id = ?
    `).bind(id).first<Deal & { organization_name: string | null, contact_name: string | null }>();
  },
  getByOrganizationId: async (db: D1Database, orgId: number) => {
    const { results } = await db.prepare('SELECT * FROM deals WHERE organization_id = ?').bind(orgId).all<Deal>();
    return results;
  },
  create: async (db: D1Database, deal: Deal) => {
    const info = await db.prepare(`INSERT INTO deals (organization_id, contact_id, name, stage, value, close_date) 
                             VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING *`)
      .bind(
        deal.organization_id || null,
        deal.contact_id || null,
        deal.name,
        deal.stage || 'New',
        deal.value || 0,
        deal.close_date || null
      )
      .first<Deal>();
    if (!info) return undefined;
    return await deals.getById(db, info.id as number);
  },
  update: async (db: D1Database, id: number, deal: Partial<Deal>) => {
    const fields = ['organization_id', 'contact_id', 'name', 'stage', 'value', 'close_date'].filter(f => deal[f as keyof Deal] !== undefined);
    if (fields.length === 0) return await deals.getById(db, id);
    const sets = fields.map((f, i) => `${f} = ?${i + 1}`).join(', ');
    const values = fields.map(f => deal[f as keyof Deal]);
    const info = await db.prepare(`UPDATE deals SET ${sets} WHERE id = ?${fields.length + 1} RETURNING *`)
      .bind(...values, id)
      .first<Deal>();
    if (!info) return undefined;
    return await deals.getById(db, info.id as number);
  },
  delete: async (db: D1Database, id: number) => {
    await db.prepare('DELETE FROM deals WHERE id = ?').bind(id).run();
  }
};
