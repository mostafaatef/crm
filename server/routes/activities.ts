import { Hono } from 'hono';
import { Env } from '../index';
import { activities } from '../models/activities';

export const activityRouter = new Hono<Env>();

activityRouter.use('*', async (c, next) => {
  if (!c.get('tenantId')) return c.json({ error: 'Tenant ID required' }, 401);
  await next();
});

activityRouter.get('/', async (c) => {
  const data = await activities.getAll(c.env.DB, c.get('tenantId')!);
  return c.json(data);
});

activityRouter.get('/contact/:contactId', async (c) => {
  const data = await activities.getByContactId(c.env.DB, c.get('tenantId')!, Number(c.req.param('contactId')));
  return c.json(data);
});

activityRouter.get('/deal/:dealId', async (c) => {
  const data = await activities.getByDealId(c.env.DB, c.get('tenantId')!, Number(c.req.param('dealId')));
  return c.json(data);
});

activityRouter.post('/', async (c) => {
  const body = await c.req.json();
  const activity = await activities.create(c.env.DB, c.get('tenantId')!, body);
  return c.json(activity, 201);
});

activityRouter.put('/:id', async (c) => {
  const body = await c.req.json();
  const activity = await activities.update(c.env.DB, c.get('tenantId')!, Number(c.req.param('id')), body);
  if (!activity) return c.json({ error: 'Not found' }, 404);
  return c.json(activity);
});

activityRouter.delete('/:id', async (c) => {
  await activities.delete(c.env.DB, c.get('tenantId')!, Number(c.req.param('id')));
  return new Response(null, { status: 204 });
});
