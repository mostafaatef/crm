import { Hono } from 'hono';
import { Env } from '../index';
import { contacts } from '../models/contacts';

export const contactRouter = new Hono<Env>();

contactRouter.use('*', async (c, next) => {
  if (!c.get('tenantId')) return c.json({ error: 'Tenant ID required' }, 401);
  await next();
});

contactRouter.get('/', async (c) => {
  const data = await contacts.getAll(c.env.DB, c.get('tenantId')!);
  return c.json(data);
});

contactRouter.get('/:id', async (c) => {
  const contact = await contacts.getById(c.env.DB, c.get('tenantId')!, Number(c.req.param('id')));
  if (!contact) return c.json({ error: 'Not found' }, 404);
  return c.json(contact);
});

contactRouter.post('/', async (c) => {
  const body = await c.req.json();
  const contact = await contacts.create(c.env.DB, c.get('tenantId')!, body);
  return c.json(contact, 201);
});

contactRouter.post('/batch', async (c) => {
  const items = await c.req.json();
  if (!Array.isArray(items)) return c.json({ error: 'Expected an array' }, 400);

  const tenantId = c.get('tenantId')!;
  const statements = items.map(item => {
    return c.env.DB.prepare(`INSERT INTO contacts (tenant_id, name, email, phone, job_title, status) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`)
      .bind(
        tenantId,
        item.name,
        item.email || null,
        item.phone || null,
        item.job_title || null,
        item.status || 'lead'
      );
  });

  try {
    const results = await c.env.DB.batch(statements);
    return c.json({ inserted: results.length }, 201);
  } catch (err) {
    console.error('Batch insert failed:', err);
    return c.json({ error: 'Batch insert failed' }, 500);
  }
});

contactRouter.put('/:id', async (c) => {
  const body = await c.req.json();
  const contact = await contacts.update(c.env.DB, c.get('tenantId')!, Number(c.req.param('id')), body);
  if (!contact) return c.json({ error: 'Not found' }, 404);
  return c.json(contact);
});

contactRouter.delete('/:id', async (c) => {
  await contacts.delete(c.env.DB, c.get('tenantId')!, Number(c.req.param('id')));
  return new Response(null, { status: 204 });
});
