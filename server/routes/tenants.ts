import { Hono } from 'hono';
import { Env } from '../index';

export const tenantRouter = new Hono<Env>();

tenantRouter.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM tenants ORDER BY created_at ASC').all();
  return c.json(results);
});

tenantRouter.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.name) {
    return c.json({ error: 'Name is required' }, 400);
  }
  const result = await c.env.DB.prepare('INSERT INTO tenants (name) VALUES (?) RETURNING *').bind(body.name).first();
  return c.json(result, 201);
});
