import { Hono } from 'hono';
import { Env } from '../index';

export const dashboardRouter = new Hono<Env>();

dashboardRouter.use('*', async (c, next) => {
  if (!c.get('tenantId')) return c.json({ error: 'Tenant ID required' }, 401);
  await next();
});

dashboardRouter.get('/', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId')!;
  
  // 1. KPIs
  const kpiRow = await db.prepare(`
    SELECT 
      (SELECT SUM(value) FROM deals WHERE tenant_id = ?1 AND stage NOT IN ('Won', 'Lost')) as totalPipeline,
      (SELECT SUM(value) FROM deals WHERE tenant_id = ?1 AND stage = 'Won') as totalRevenue,
      (SELECT SUM(amount) FROM expenses WHERE tenant_id = ?1) as totalExpenses,
      (SELECT SUM(amount) FROM invoices WHERE tenant_id = ?1 AND status IN ('Sent', 'Overdue')) as outstandingReceivables
  `).bind(tenantId).first() as any;

  const kpis = {
    totalPipeline: kpiRow?.totalPipeline || 0,
    totalRevenue: kpiRow?.totalRevenue || 0,
    totalExpenses: kpiRow?.totalExpenses || 0,
    netProfit: (kpiRow?.totalRevenue || 0) - (kpiRow?.totalExpenses || 0),
    outstandingReceivables: kpiRow?.outstandingReceivables || 0,
  };

  // 2. Metrics: Deals Won, Revenue, and Expenses per month
  const { results: revenueRaw } = await db.prepare(`
    SELECT 
      strftime('%Y-%m', close_date) as month,
      COUNT(id) as dealsWon,
      SUM(value) as revenue
    FROM deals
    WHERE tenant_id = ?1 AND stage = 'Won' AND close_date IS NOT NULL
    GROUP BY strftime('%Y-%m', close_date)
  `).bind(tenantId).all();

  const { results: expensesRaw } = await db.prepare(`
    SELECT 
      strftime('%Y-%m', date_incurred) as month,
      SUM(amount) as expenses
    FROM expenses
    WHERE tenant_id = ?1 AND date_incurred IS NOT NULL
    GROUP BY strftime('%Y-%m', date_incurred)
  `).bind(tenantId).all();

  // Merge revenue and expenses by month
  const metricsMap: Record<string, any> = {};
  
  for (const r of revenueRaw) {
    if (r.month) {
      metricsMap[r.month as string] = { month: r.month, dealsWon: r.dealsWon, revenue: r.revenue, expenses: 0, profit: r.revenue };
    }
  }

  for (const e of expensesRaw) {
    if (e.month) {
      if (!metricsMap[e.month as string]) {
        metricsMap[e.month as string] = { month: e.month, dealsWon: 0, revenue: 0, expenses: 0, profit: 0 };
      }
      metricsMap[e.month as string].expenses = e.expenses;
      metricsMap[e.month as string].profit = metricsMap[e.month as string].revenue - (e.expenses as number);
    }
  }

  const metricsMerged = Object.values(metricsMap).sort((a: any, b: any) => a.month.localeCompare(b.month));

  // 3. Recent Activity (last 10)
  const { results: recentActivityRaw } = await db.prepare(`
    SELECT 
      a.id, a.type, a.description, a.created_at, a.due_date, a.done,
      c.name as contact_name,
      d.name as deal_name
    FROM activities a
    LEFT JOIN contacts c ON a.contact_id = c.id
    LEFT JOIN deals d ON a.deal_id = d.id
    WHERE a.tenant_id = ?1
    ORDER BY a.created_at DESC
    LIMIT 10
  `).bind(tenantId).all();

  // 4. Open Tasks (due_date is not null and done = 0)
  const { results: openTasksRaw } = await db.prepare(`
    SELECT 
      a.id, a.type, a.description, a.created_at, a.due_date, a.done,
      c.name as contact_name,
      d.name as deal_name
    FROM activities a
    LEFT JOIN contacts c ON a.contact_id = c.id
    LEFT JOIN deals d ON a.deal_id = d.id
    WHERE a.tenant_id = ?1 AND a.due_date IS NOT NULL AND a.done = 0
    ORDER BY a.due_date ASC
  `).bind(tenantId).all();

  return c.json({
    kpis,
    metrics: metricsMerged,
    recentActivity: recentActivityRaw,
    openTasks: openTasksRaw
  });
});
