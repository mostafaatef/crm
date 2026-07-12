import { Hono } from 'hono';
import { Env } from '../index';
import { deals } from '../models/deals';

export const dealRouter = new Hono<Env>();

dealRouter.use('*', async (c, next) => {
  if (!c.get('tenantId')) return c.json({ error: 'Tenant ID required' }, 401);
  await next();
});

dealRouter.get('/', async (c) => {
  const data = await deals.getAll(c.env.DB, c.get('tenantId')!);
  return c.json(data);
});

dealRouter.get('/:id', async (c) => {
  const deal = await deals.getById(c.env.DB, c.get('tenantId')!, Number(c.req.param('id')));
  if (!deal) return c.json({ error: 'Not found' }, 404);
  return c.json(deal);
});

dealRouter.post('/', async (c) => {
  const body = await c.req.json();
  const deal = await deals.create(c.env.DB, c.get('tenantId')!, body);
  return c.json(deal, 201);
});

dealRouter.put('/:id', async (c) => {
  const body = await c.req.json();
  const deal = await deals.update(c.env.DB, c.get('tenantId')!, Number(c.req.param('id')), body);
  if (!deal) return c.json({ error: 'Not found' }, 404);
  return c.json(deal);
});

dealRouter.delete('/:id', async (c) => {
  await deals.delete(c.env.DB, c.get('tenantId')!, Number(c.req.param('id')));
  return new Response(null, { status: 204 });
});
