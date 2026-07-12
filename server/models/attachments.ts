import type { D1Database } from '@cloudflare/workers-types';

export const attachments = {
  getAttachmentsByDealId: async (db: D1Database, dealId: number) => {
    return (await db.prepare('SELECT * FROM attachments WHERE deal_id = ? ORDER BY created_at DESC').bind(dealId).all()).results;
  },
  getAttachmentsByContactId: async (db: D1Database, contactId: number) => {
    return (await db.prepare('SELECT * FROM attachments WHERE contact_id = ? ORDER BY created_at DESC').bind(contactId).all()).results;
  },
  getAttachmentById: async (db: D1Database, id: number) => {
    return await db.prepare('SELECT * FROM attachments WHERE id = ?').bind(id).first();
  },
  createAttachment: async (db: D1Database, data: any) => {
    return await db.prepare(
      'INSERT INTO attachments (deal_id, contact_id, organization_id, file_name, content_type, size, object_key) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) RETURNING *'
    ).bind(
      data.deal_id || null, 
      data.contact_id || null, 
      data.organization_id || null, 
      data.file_name, 
      data.content_type, 
      data.size, 
      data.object_key
    ).first();
  },
  deleteAttachment: async (db: D1Database, id: number) => {
    return await db.prepare('DELETE FROM attachments WHERE id = ? RETURNING *').bind(id).first();
  }
};
