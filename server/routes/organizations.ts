import type { D1Database } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { organizations } from '../models/organizations';

export const organizationRouter = new Hono<{ Bindings: { DB: D1Database } }>();

organizationRouter.get('/', async (c) => {
  const orgs = await organizations.getAll(c.env.DB);
  return c.json(orgs);
});

organizationRouter.get('/:id', async (c) => {
  const org = await organizations.getById(c.env.DB, Number(c.req.param('id')));
  if (!org) return c.json({ error: 'Not found' }, 404);
  return c.json(org);
});

organizationRouter.post('/', async (c) => {
  const body = await c.req.json();
  const org = await organizations.create(c.env.DB, body);
  return c.json(org, 201);
});

organizationRouter.put('/:id', async (c) => {
  const body = await c.req.json();
  const org = await organizations.update(c.env.DB, Number(c.req.param('id')), body);
  if (!org) return c.json({ error: 'Not found' }, 404);
  return c.json(org);
});

organizationRouter.delete('/:id', async (c) => {
  await organizations.delete(c.env.DB, Number(c.req.param('id')));
  return new Response(null, { status: 204 });
});
