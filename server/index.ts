import type { D1Database, Fetcher, R2Bucket } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { basicAuth } from 'hono/basic-auth';

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

// Enforce basic auth if credentials are provided in the environment
app.use('*', async (c, next) => {
  if (c.env.AUTH_USERNAME && c.env.AUTH_PASSWORD) {
    const auth = basicAuth({
      username: c.env.AUTH_USERNAME,
      password: c.env.AUTH_PASSWORD,
    });
    return auth(c, next);
  }
  await next();
});
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
  
  if (c.env.ASSETS) {
    try {
      const url = new URL(c.req.url);
      url.pathname = '/';
      const res = await c.env.ASSETS.fetch(new Request(url.toString()) as any) as any;
      if (res.ok) return res;
    } catch (e) {
      console.error('ASSETS fetch failed:', e);
    }
  }
  
  return c.notFound();
});

export default app;
