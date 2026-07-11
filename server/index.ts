import type { D1Database, Fetcher } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { organizationRouter } from './routes/organizations';
import { contactRouter } from './routes/contacts';
import { dealRouter } from './routes/deals';
import { activityRouter } from './routes/activities';
import { dashboardRouter } from './routes/dashboard';

const app = new Hono<{ Bindings: { DB: D1Database; ASSETS: Fetcher } }>();

app.use('/api/*', cors());

app.route('/api/organizations', organizationRouter);
app.route('/api/contacts', contactRouter);
app.route('/api/deals', dealRouter);
app.route('/api/activities', activityRouter);
app.route('/api/dashboard', dashboardRouter);

// Fallback for Single Page Application
app.get('*', async (c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.notFound();
  }
  // Let the ASSETS binding serve the index.html for unknown paths
  const url = new URL(c.req.url);
  url.pathname = '/';
  return c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
});

export default app;
