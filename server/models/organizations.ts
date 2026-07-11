import type { D1Database } from '@cloudflare/workers-types';

export interface Organization {
  id?: number;
  name: string;
  website?: string | null;
  industry?: string | null;
  notes?: string | null;
  created_at?: string;
}

export const organizations = {
  getAll: async (db: D1Database) => {
    const { results } = await db.prepare('SELECT * FROM organizations ORDER BY name ASC').all<Organization>();
    return results;
  },
  getById: async (db: D1Database, id: number) => {
    return await db.prepare('SELECT * FROM organizations WHERE id = ?').bind(id).first<Organization>();
  },
  create: async (db: D1Database, org: Organization) => {
    const info = await db.prepare('INSERT INTO organizations (name, website, industry, notes) VALUES (?1, ?2, ?3, ?4) RETURNING *')
      .bind(org.name, org.website || null, org.industry || null, org.notes || null)
      .first<Organization>();
    return info;
  },
  update: async (db: D1Database, id: number, org: Partial<Organization>) => {
    const fields = ['name', 'website', 'industry', 'notes'].filter(f => org[f as keyof Organization] !== undefined);
    if (fields.length === 0) return await organizations.getById(db, id);
    const sets = fields.map((f, i) => `${f} = ?${i + 1}`).join(', ');
    const values = fields.map(f => org[f as keyof Organization]);
    const info = await db.prepare(`UPDATE organizations SET ${sets} WHERE id = ?${fields.length + 1} RETURNING *`)
      .bind(...values, id)
      .first<Organization>();
    return info;
  },
  delete: async (db: D1Database, id: number) => {
    await db.prepare('DELETE FROM organizations WHERE id = ?').bind(id).run();
  }
};
