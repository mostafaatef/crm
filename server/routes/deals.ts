import type { D1Database } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { deals } from '../models/deals';
import { activities } from '../models/activities';

export const dealRouter = new Hono<{ Bindings: { DB: D1Database } }>();

dealRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  let result;
  if (orgId) {
    result = await deals.getByOrganizationId(c.env.DB, Number(orgId));
  } else {
    result = await deals.getAll(c.env.DB);
  }
  return c.json(result);
});

dealRouter.get('/:id', async (c) => {
  const deal = await deals.getById(c.env.DB, Number(c.req.param('id')));
  if (!deal) return c.json({ error: 'Not found' }, 404);
  return c.json(deal);
});

dealRouter.post('/', async (c) => {
  const body = await c.req.json();
  const deal = await deals.create(c.env.DB, body);
  return c.json(deal, 201);
});

dealRouter.put('/:id', async (c) => {
  const body = await c.req.json();
  const deal = await deals.update(c.env.DB, Number(c.req.param('id')), body);
  if (!deal) return c.json({ error: 'Not found' }, 404);
  return c.json(deal);
});

dealRouter.delete('/:id', async (c) => {
  await deals.delete(c.env.DB, Number(c.req.param('id')));
  return new Response(null, { status: 204 });
});

// Nested activities
dealRouter.get('/:id/activities', async (c) => {
  const result = await activities.getByDealId(c.env.DB, Number(c.req.param('id')));
  return c.json(result);
});
