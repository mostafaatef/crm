import type { D1Database } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { contacts } from '../models/contacts';
import { activities } from '../models/activities';

export const contactRouter = new Hono<{ Bindings: { DB: D1Database } }>();

contactRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  let result;
  if (orgId) {
    result = await contacts.getByOrganizationId(c.env.DB, Number(orgId));
  } else {
    result = await contacts.getAll(c.env.DB);
  }
  return c.json(result);
});

contactRouter.get('/:id', async (c) => {
  const contact = await contacts.getById(c.env.DB, Number(c.req.param('id')));
  if (!contact) return c.json({ error: 'Not found' }, 404);
  return c.json(contact);
});

contactRouter.post('/', async (c) => {
  const body = await c.req.json();
  const contact = await contacts.create(c.env.DB, body);
  return c.json(contact, 201);
});

contactRouter.put('/:id', async (c) => {
  const body = await c.req.json();
  const contact = await contacts.update(c.env.DB, Number(c.req.param('id')), body);
  if (!contact) return c.json({ error: 'Not found' }, 404);
  return c.json(contact);
});

contactRouter.delete('/:id', async (c) => {
  await contacts.delete(c.env.DB, Number(c.req.param('id')));
  return new Response(null, { status: 204 });
});

// Nested activities
contactRouter.get('/:id/activities', async (c) => {
  const result = await activities.getByContactId(c.env.DB, Number(c.req.param('id')));
  return c.json(result);
});
