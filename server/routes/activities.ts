import type { D1Database } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { activities } from '../models/activities';

export const activityRouter = new Hono<{ Bindings: { DB: D1Database } }>();

activityRouter.get('/', async (c) => {
  const result = await activities.getAll(c.env.DB);
  return c.json(result);
});

activityRouter.post('/', async (c) => {
  const body = await c.req.json();
  const activity = await activities.create(c.env.DB, body);
  return c.json(activity, 201);
});

activityRouter.put('/:id', async (c) => {
  const body = await c.req.json();
  const activity = await activities.update(c.env.DB, Number(c.req.param('id')), body);
  if (!activity) return c.json({ error: 'Not found' }, 404);
  return c.json(activity);
});

activityRouter.delete('/:id', async (c) => {
  await activities.delete(c.env.DB, Number(c.req.param('id')));
  return new Response(null, { status: 204 });
});
