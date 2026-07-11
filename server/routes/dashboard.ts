import type { D1Database } from '@cloudflare/workers-types';
import { Hono } from 'hono';

export const dashboardRouter = new Hono<{ Bindings: { DB: D1Database } }>();

dashboardRouter.get('/', async (c) => {
  const db = c.env.DB;
  
  // 1. Metrics: Deals Won and Revenue per month
  const { results: metricsRaw } = await db.prepare(`
    SELECT 
      strftime('%Y-%m', close_date) as month,
      COUNT(id) as dealsWon,
      SUM(value) as revenue
    FROM deals
    WHERE stage = 'Won' AND close_date IS NOT NULL
    GROUP BY strftime('%Y-%m', close_date)
    ORDER BY month ASC
  `).all();

  // 2. Recent Activity (last 10)
  const { results: recentActivityRaw } = await db.prepare(`
    SELECT 
      a.id, a.type, a.description, a.created_at, a.due_date, a.done,
      c.name as contact_name,
      d.name as deal_name
    FROM activities a
    LEFT JOIN contacts c ON a.contact_id = c.id
    LEFT JOIN deals d ON a.deal_id = d.id
    ORDER BY a.created_at DESC
    LIMIT 10
  `).all();

  // 3. Open Tasks (due_date is not null and done = 0)
  const { results: openTasksRaw } = await db.prepare(`
    SELECT 
      a.id, a.type, a.description, a.created_at, a.due_date, a.done,
      c.name as contact_name,
      d.name as deal_name
    FROM activities a
    LEFT JOIN contacts c ON a.contact_id = c.id
    LEFT JOIN deals d ON a.deal_id = d.id
    WHERE a.due_date IS NOT NULL AND a.done = 0
    ORDER BY a.due_date ASC
  `).all();

  return c.json({
    metrics: metricsRaw,
    recentActivity: recentActivityRaw,
    openTasks: openTasksRaw
  });
});
