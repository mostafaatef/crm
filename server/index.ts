import type { D1Database } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { organizationRouter } from './routes/organizations';
import { contactRouter } from './routes/contacts';
import { dealRouter } from './routes/deals';
import { activityRouter } from './routes/activities';
import { dashboardRouter } from './routes/dashboard';

const app = new Hono<{ Bindings: { DB: D1Database } }>();

app.use('/api/*', cors());

app.route('/api/organizations', organizationRouter);
app.route('/api/contacts', contactRouter);
app.route('/api/deals', dealRouter);
app.route('/api/activities', activityRouter);
app.route('/api/dashboard', dashboardRouter);

export default app;
