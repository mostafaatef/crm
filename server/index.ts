import type { D1Database, Fetcher, R2Bucket } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { organizationRouter } from './routes/organizations';
import { contactRouter } from './routes/contacts';
import { dealRouter } from './routes/deals';
import { activityRouter } from './routes/activities';
import { dashboardRouter } from './routes/dashboard';
import { financeRouter } from './routes/finance';
import { attachmentsRouter } from './routes/attachments';
import { searchRouter } from './routes/search';
import { exportRouter } from './routes/export';
import { aiRouter } from './routes/ai';
import { tenantRouter } from './routes/tenants';

export type Env = {
  Bindings: { DB: D1Database; ASSETS: Fetcher; BUCKET: R2Bucket; AI: any; AUTH_USERNAME?: string; AUTH_PASSWORD?: string };
  Variables: { tenantId?: number };
};

const app = new Hono<Env>();

// Removed basicAuth as per user rules.

app.use('/api/*', cors());

app.use('/api/*', async (c, next) => {
  const tenantIdHeader = c.req.header('X-Tenant-ID');
  if (tenantIdHeader) {
    c.set('tenantId', parseInt(tenantIdHeader, 10));
  }
  await next();
});

app.route('/api/organizations', organizationRouter);
app.route('/api/contacts', contactRouter);
app.route('/api/deals', dealRouter);
app.route('/api/activities', activityRouter);
app.route('/api/dashboard', dashboardRouter);
app.route('/api/finance', financeRouter);
app.route('/api/attachments', attachmentsRouter);
app.route('/api/search', searchRouter);
app.route('/api/export', exportRouter);
app.route('/api/ai', aiRouter);
app.route('/api/tenants', tenantRouter);

// Fallback for Single Page Application
app.get('*', async (c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.notFound();
  }
  // Let the ASSETS binding serve the index.html for unknown paths
  const url = new URL(c.req.url);
  url.pathname = '/';
  return c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw as any) as any) as any;
});

export default app;
