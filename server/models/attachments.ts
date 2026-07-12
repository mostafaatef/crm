import type { D1Database } from '@cloudflare/workers-types';

export const attachments = {
  getAttachmentsByDealId: async (db: D1Database, tenantId: number, dealId: number) => {
    return (await db.prepare('SELECT * FROM attachments WHERE tenant_id = ? AND deal_id = ? ORDER BY created_at DESC').bind(tenantId, dealId).all()).results;
  },
  getAttachmentsByContactId: async (db: D1Database, tenantId: number, contactId: number) => {
    return (await db.prepare('SELECT * FROM attachments WHERE tenant_id = ? AND contact_id = ? ORDER BY created_at DESC').bind(tenantId, contactId).all()).results;
  },
  getAttachmentById: async (db: D1Database, tenantId: number, id: number) => {
    return await db.prepare('SELECT * FROM attachments WHERE tenant_id = ? AND id = ?').bind(tenantId, id).first();
  },
  createAttachment: async (db: D1Database, tenantId: number, data: any) => {
    return await db.prepare(
      'INSERT INTO attachments (tenant_id, deal_id, contact_id, organization_id, file_name, content_type, size, object_key) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) RETURNING *'
    ).bind(
      tenantId,
      data.deal_id || null, 
      data.contact_id || null, 
      data.organization_id || null, 
      data.file_name, 
      data.content_type, 
      data.size, 
      data.object_key
    ).first();
  },
  deleteAttachment: async (db: D1Database, tenantId: number, id: number) => {
    return await db.prepare('DELETE FROM attachments WHERE tenant_id = ? AND id = ? RETURNING *').bind(tenantId, id).first();
  }
};
