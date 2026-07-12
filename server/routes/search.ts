import type { D1Database } from '@cloudflare/workers-types';
import { Hono } from 'hono';

export const searchRouter = new Hono<{ Bindings: { DB: D1Database } }>();

searchRouter.get('/', async (c) => {
  const query = c.req.query('q');
  if (!query || query.trim().length < 2) {
    return c.json([]);
  }

  const db = c.env.DB;
  const searchPattern = `%${query}%`;

  // Search Organizations
  const orgs = await db.prepare(`
    SELECT id, 'organization' as type, name as title, industry as subtitle
    FROM organizations
    WHERE name LIKE ?1 OR industry LIKE ?1
    LIMIT 5
  `).bind(searchPattern).all();

  // Search Contacts
  const contacts = await db.prepare(`
    SELECT id, 'contact' as type, name as title, email as subtitle
    FROM contacts
    WHERE name LIKE ?1 OR email LIKE ?1
    LIMIT 5
  `).bind(searchPattern).all();

  // Search Deals
  const deals = await db.prepare(`
    SELECT id, 'deal' as type, name as title, stage as subtitle
    FROM deals
    WHERE name LIKE ?1
    LIMIT 5
  `).bind(searchPattern).all();

  // Combine results
  const results = [
    ...(orgs.results || []),
    ...(contacts.results || []),
    ...(deals.results || []),
  ];

  return c.json(results);
});
