import type { D1Database } from '@cloudflare/workers-types';

export interface Contact {
  id?: number;
  organization_id?: number | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  job_title?: string | null;
  status?: string; // lead, qualified, customer
  created_at?: string;
}

export const contacts = {
  getAll: async (db: D1Database) => {
    const { results } = await db.prepare('SELECT * FROM contacts ORDER BY name ASC').all<Contact>();
    return results;
  },
  getById: async (db: D1Database, id: number) => {
    return await db.prepare('SELECT * FROM contacts WHERE id = ?').bind(id).first<Contact>();
  },
  getByOrganizationId: async (db: D1Database, orgId: number) => {
    const { results } = await db.prepare('SELECT * FROM contacts WHERE organization_id = ?').bind(orgId).all<Contact>();
    return results;
  },
  create: async (db: D1Database, contact: Contact) => {
    const info = await db.prepare(`INSERT INTO contacts (organization_id, name, email, phone, job_title, status) 
                             VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING *`)
      .bind(
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
  update: async (db: D1Database, id: number, contact: Partial<Contact>) => {
    const fields = ['organization_id', 'name', 'email', 'phone', 'job_title', 'status'].filter(f => contact[f as keyof Contact] !== undefined);
    if (fields.length === 0) return await contacts.getById(db, id);
    const sets = fields.map((f, i) => `${f} = ?${i + 1}`).join(', ');
    const values = fields.map(f => contact[f as keyof Contact]);
    const info = await db.prepare(`UPDATE contacts SET ${sets} WHERE id = ?${fields.length + 1} RETURNING *`)
      .bind(...values, id)
      .first<Contact>();
    return info;
  },
  delete: async (db: D1Database, id: number) => {
    await db.prepare('DELETE FROM contacts WHERE id = ?').bind(id).run();
  }
};
