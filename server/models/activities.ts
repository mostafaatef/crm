import type { D1Database } from '@cloudflare/workers-types';

export interface Activity {
  id?: number;
  contact_id?: number | null;
  deal_id?: number | null;
  type: string;
  description: string;
  done?: number;
  due_date?: string | null;
  created_at?: string;
}

export const activities = {
  getAll: async (db: D1Database) => {
    const { results } = await db.prepare('SELECT * FROM activities ORDER BY created_at DESC').all<Activity>();
    return results;
  },
  getByContactId: async (db: D1Database, contactId: number) => {
    const { results } = await db.prepare('SELECT * FROM activities WHERE contact_id = ? ORDER BY created_at DESC').bind(contactId).all<Activity>();
    return results;
  },
  getByDealId: async (db: D1Database, dealId: number) => {
    const { results } = await db.prepare('SELECT * FROM activities WHERE deal_id = ? ORDER BY created_at DESC').bind(dealId).all<Activity>();
    return results;
  },
  getById: async (db: D1Database, id: number) => {
    return await db.prepare('SELECT * FROM activities WHERE id = ?').bind(id).first<Activity>();
  },
  create: async (db: D1Database, activity: Activity) => {
    const info = await db.prepare(`INSERT INTO activities (contact_id, deal_id, type, description, done, due_date) 
                             VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING *`)
      .bind(
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
  update: async (db: D1Database, id: number, activity: Partial<Activity>) => {
    const fields = ['contact_id', 'deal_id', 'type', 'description', 'done', 'due_date'].filter(f => activity[f as keyof Activity] !== undefined);
    if (fields.length === 0) return await activities.getById(db, id);
    const sets = fields.map((f, i) => `${f} = ?${i + 1}`).join(', ');
    const values = fields.map(f => activity[f as keyof Activity]);
    const info = await db.prepare(`UPDATE activities SET ${sets} WHERE id = ?${fields.length + 1} RETURNING *`)
      .bind(...values, id)
      .first<Activity>();
    return info;
  },
  delete: async (db: D1Database, id: number) => {
    await db.prepare('DELETE FROM activities WHERE id = ?').bind(id).run();
  }
};
