import type { D1Database } from '@cloudflare/workers-types';

export interface Activity {
  id?: number;
  tenant_id?: number;
  contact_id?: number | null;
  deal_id?: number | null;
  type: string;
  description: string;
  done?: number;
  due_date?: string | null;
  created_at?: string;
}

export const activities = {
  getAll: async (db: D1Database, tenantId: number) => {
    const { results } = await db.prepare('SELECT * FROM activities WHERE tenant_id = ? ORDER BY created_at DESC').bind(tenantId).all<Activity>();
    return results;
  },
  getByContactId: async (db: D1Database, tenantId: number, contactId: number) => {
    const { results } = await db.prepare('SELECT * FROM activities WHERE tenant_id = ? AND contact_id = ? ORDER BY created_at DESC').bind(tenantId, contactId).all<Activity>();
    return results;
  },
  getByDealId: async (db: D1Database, tenantId: number, dealId: number) => {
    const { results } = await db.prepare('SELECT * FROM activities WHERE tenant_id = ? AND deal_id = ? ORDER BY created_at DESC').bind(tenantId, dealId).all<Activity>();
    return results;
  },
  getById: async (db: D1Database, tenantId: number, id: number) => {
    return await db.prepare('SELECT * FROM activities WHERE tenant_id = ? AND id = ?').bind(tenantId, id).first<Activity>();
  },
  create: async (db: D1Database, tenantId: number, activity: Activity) => {
    const info = await db.prepare(`INSERT INTO activities (tenant_id, contact_id, deal_id, type, description, done, due_date) 
                             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) RETURNING *`)
      .bind(
        tenantId,
        activity.contact_id || null,
        activity.deal_id || null,
        activity.type,
        activity.description,
        activity.done || 0,
        activity.due_date || null
      )
      .first<Activity>();
    return info;
  },
  update: async (db: D1Database, tenantId: number, id: number, activity: Partial<Activity>) => {
    const fields = ['contact_id', 'deal_id', 'type', 'description', 'done', 'due_date'].filter(f => activity[f as keyof Activity] !== undefined);
    if (fields.length === 0) return await activities.getById(db, tenantId, id);
    const sets = fields.map((f, i) => `${f} = ?${i + 1}`).join(', ');
    const values = fields.map(f => activity[f as keyof Activity]);
    const info = await db.prepare(`UPDATE activities SET ${sets} WHERE tenant_id = ?${fields.length + 1} AND id = ?${fields.length + 2} RETURNING *`)
      .bind(...values, tenantId, id)
      .first<Activity>();
    return info;
  },
  delete: async (db: D1Database, tenantId: number, id: number) => {
    await db.prepare('DELETE FROM activities WHERE tenant_id = ? AND id = ?').bind(tenantId, id).run();
  }
};
