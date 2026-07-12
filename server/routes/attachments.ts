import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { attachments } from '../models/attachments';

export const attachmentsRouter = new Hono<{ Bindings: { DB: D1Database, BUCKET: R2Bucket } }>();

// Upload attachment
attachmentsRouter.post('/upload', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'] as File;
  const dealId = body['deal_id'];
  const contactId = body['contact_id'];
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400);
  }

  const objectKey = `attachments/${crypto.randomUUID()}-${file.name}`;
  
  // Upload to R2
  const fileData = await file.arrayBuffer();
  await c.env.BUCKET.put(objectKey, fileData, {
    httpMetadata: { contentType: file.type }
  });

  // Save to DB
  const record = await attachments.createAttachment(c.env.DB, {
    deal_id: dealId ? Number(dealId) : null,
    contact_id: contactId ? Number(contactId) : null,
    file_name: file.name,
    content_type: file.type,
    size: file.size,
    object_key: objectKey
  });

  return c.json(record, 201);
});

// Download/View attachment
attachmentsRouter.get('/:id/download', async (c) => {
  const id = Number(c.req.param('id'));
  const record: any = await attachments.getAttachmentById(c.env.DB, id);
  
  if (!record) {
    return c.json({ error: 'Not found' }, 404);
  }

  const object = await c.env.BUCKET.get(record.object_key);
  
  if (!object) {
    return c.json({ error: 'File not found in storage' }, 404);
  }

  c.header('Content-Type', record.content_type);
  // Optional: change to inline if you want PDFs to open in browser
  c.header('Content-Disposition', `inline; filename="${record.file_name}"`);
  
  return c.body(object.body as any);
});

// Delete attachment
attachmentsRouter.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const record: any = await attachments.getAttachmentById(c.env.DB, id);
  if (!record) {
    return c.json({ error: 'Not found' }, 404);
  }
  
  await c.env.BUCKET.delete(record.object_key);
  await attachments.deleteAttachment(c.env.DB, id);
  
  return c.json({ success: true });
});

// Get attachments for a deal
attachmentsRouter.get('/deals/:dealId', async (c) => {
  const dealId = Number(c.req.param('dealId'));
  const results = await attachments.getAttachmentsByDealId(c.env.DB, dealId);
  return c.json(results);
});
