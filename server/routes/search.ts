import { Hono } from 'hono';
import { Env } from '../index';

export const searchRouter = new Hono<Env>();

searchRouter.use('*', async (c, next) => {
  if (!c.get('tenantId')) return c.json({ error: 'Tenant ID required' }, 401);
  await next();
});

searchRouter.get('/', async (c) => {
  const query = c.req.query('q');
  if (!query || query.trim().length < 2) {
    return c.json([]);
  }

  const db = c.env.DB;
  const tenantId = c.get('tenantId')!;
  const searchPattern = `%${query}%`;

  // Search Organizations
  const orgs = await db.prepare(`
    SELECT id, 'organization' as type, name as title, industry as subtitle
    FROM organizations
    WHERE tenant_id = ?1 AND (name LIKE ?2 OR industry LIKE ?2)
    LIMIT 5
  `).bind(tenantId, searchPattern).all();

  // Search Contacts
  const contacts = await db.prepare(`
    SELECT id, 'contact' as type, name as title, email as subtitle
    FROM contacts
    WHERE tenant_id = ?1 AND (name LIKE ?2 OR email LIKE ?2)
    LIMIT 5
  `).bind(tenantId, searchPattern).all();

  // Search Deals
  const deals = await db.prepare(`
    SELECT id, 'deal' as type, name as title, stage as subtitle
    FROM deals
    WHERE tenant_id = ?1 AND name LIKE ?2
    LIMIT 5
  `).bind(tenantId, searchPattern).all();

  // Combine results
  const results = [
    ...(orgs.results || []),
    ...(contacts.results || []),
    ...(deals.results || []),
  ];

  return c.json(results);
});
