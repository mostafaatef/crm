import { Hono } from 'hono';
import { Env } from '../index';

export const exportRouter = new Hono<Env>();

exportRouter.use('*', async (c, next) => {
  if (!c.get('tenantId')) return c.json({ error: 'Tenant ID required' }, 401);
  await next();
});

const jsonToCsv = (data: any[]) => {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) val = '';
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};

exportRouter.get('/contacts', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId')!;
  const contacts = await db.prepare(`
    SELECT c.id, c.name, c.email, c.phone, c.job_title, c.status, o.name as organization_name, c.created_at
    FROM contacts c
    LEFT JOIN organizations o ON c.organization_id = o.id
    WHERE c.tenant_id = ?1
    ORDER BY c.name ASC
  `).bind(tenantId).all();

  const csvStr = jsonToCsv(contacts.results || []);
  c.header('Content-Type', 'text/csv');
  c.header('Content-Disposition', 'attachment; filename="contacts_export.csv"');
  return c.body(csvStr);
});

exportRouter.get('/deals', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId')!;
  const deals = await db.prepare(`
    SELECT d.id, d.name, d.stage, d.value, d.close_date, o.name as organization_name, c.name as contact_name, d.created_at
    FROM deals d
    LEFT JOIN organizations o ON d.organization_id = o.id
    LEFT JOIN contacts c ON d.contact_id = c.id
    WHERE d.tenant_id = ?1
    ORDER BY d.created_at DESC
  `).bind(tenantId).all();

  const csvStr = jsonToCsv(deals.results || []);
  c.header('Content-Type', 'text/csv');
  c.header('Content-Disposition', 'attachment; filename="deals_export.csv"');
  return c.body(csvStr);
});
