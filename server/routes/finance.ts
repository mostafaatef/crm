import { Hono } from 'hono';
import { Env } from '../index';
import { finance } from '../models/finance';

export const financeRouter = new Hono<Env>();

financeRouter.use('*', async (c, next) => {
  if (!c.get('tenantId')) return c.json({ error: 'Tenant ID required' }, 401);
  await next();
});

// Overview
financeRouter.get('/overview', async (c) => {
  const result = await finance.getOverview(c.env.DB, c.get('tenantId')!);
  return c.json(result);
});

// Contracts
financeRouter.get('/contracts/all', async (c) => {
  const result = await finance.getAllContracts(c.env.DB, c.get('tenantId')!);
  return c.json(result);
});
financeRouter.get('/deals/:dealId/contracts', async (c) => {
  const result = await finance.getContractsByDealId(c.env.DB, c.get('tenantId')!, Number(c.req.param('dealId')));
  return c.json(result);
});

financeRouter.post('/contracts', async (c) => {
  const body = await c.req.json();
  const contract = await finance.createContract(c.env.DB, c.get('tenantId')!, body);
  return c.json(contract, 201);
});

financeRouter.put('/contracts/:id', async (c) => {
  const body = await c.req.json();
  const contract = await finance.updateContract(c.env.DB, c.get('tenantId')!, Number(c.req.param('id')), body);
  if (!contract) return c.json({ error: 'Not found' }, 404);
  return c.json(contract);
});

// Subcontracts
financeRouter.get('/subcontracts/all', async (c) => {
  const result = await finance.getAllSubcontracts(c.env.DB, c.get('tenantId')!);
  return c.json(result);
});
financeRouter.get('/deals/:dealId/subcontracts', async (c) => {
  const result = await finance.getSubcontractsByDealId(c.env.DB, c.get('tenantId')!, Number(c.req.param('dealId')));
  return c.json(result);
});

financeRouter.post('/subcontracts', async (c) => {
  const body = await c.req.json();
  const subcontract = await finance.createSubcontract(c.env.DB, c.get('tenantId')!, body);
  return c.json(subcontract, 201);
});

financeRouter.put('/subcontracts/:id', async (c) => {
  const body = await c.req.json();
  const subcontract = await finance.updateSubcontract(c.env.DB, c.get('tenantId')!, Number(c.req.param('id')), body);
  if (!subcontract) return c.json({ error: 'Not found' }, 404);
  return c.json(subcontract);
});

// Expenses
financeRouter.get('/expenses/all', async (c) => {
  const result = await finance.getAllExpenses(c.env.DB, c.get('tenantId')!);
  return c.json(result);
});
financeRouter.get('/deals/:dealId/expenses', async (c) => {
  const result = await finance.getExpensesByDealId(c.env.DB, c.get('tenantId')!, Number(c.req.param('dealId')));
  return c.json(result);
});

financeRouter.post('/expenses', async (c) => {
  const body = await c.req.json();
  const expense = await finance.createExpense(c.env.DB, c.get('tenantId')!, body);
  return c.json(expense, 201);
});

financeRouter.put('/expenses/:id', async (c) => {
  const body = await c.req.json();
  const expense = await finance.updateExpense(c.env.DB, c.get('tenantId')!, Number(c.req.param('id')), body);
  if (!expense) return c.json({ error: 'Not found' }, 404);
  return c.json(expense);
});

// Estimates
financeRouter.get('/estimates/all', async (c) => {
  const result = await finance.getAllEstimates(c.env.DB, c.get('tenantId')!);
  return c.json(result);
});
financeRouter.get('/deals/:dealId/estimates', async (c) => {
  const result = await finance.getEstimatesByDealId(c.env.DB, c.get('tenantId')!, Number(c.req.param('dealId')));
  return c.json(result);
});

financeRouter.post('/estimates', async (c) => {
  const body = await c.req.json();
  const estimate = await finance.createEstimate(c.env.DB, c.get('tenantId')!, body);
  return c.json(estimate, 201);
});

financeRouter.put('/estimates/:id', async (c) => {
  const body = await c.req.json();
  const estimate = await finance.updateEstimate(c.env.DB, c.get('tenantId')!, Number(c.req.param('id')), body);
  if (!estimate) return c.json({ error: 'Not found' }, 404);
  return c.json(estimate);
});

// Invoices
financeRouter.get('/invoices/all', async (c) => {
  const result = await finance.getAllInvoices(c.env.DB, c.get('tenantId')!);
  return c.json(result);
});
financeRouter.get('/contracts/:contractId/invoices', async (c) => {
  const result = await finance.getInvoicesByContractId(c.env.DB, c.get('tenantId')!, Number(c.req.param('contractId')));
  return c.json(result);
});

financeRouter.post('/invoices', async (c) => {
  const body = await c.req.json();
  const invoice = await finance.createInvoice(c.env.DB, c.get('tenantId')!, body);
  return c.json(invoice, 201);
});

financeRouter.put('/invoices/:id', async (c) => {
  const body = await c.req.json();
  const invoice = await finance.updateInvoice(c.env.DB, c.get('tenantId')!, Number(c.req.param('id')), body);
  if (!invoice) return c.json({ error: 'Not found' }, 404);
  return c.json(invoice);
});

// Payments
financeRouter.get('/invoices/:invoiceId/payments', async (c) => {
  const result = await finance.getPaymentsByInvoiceId(c.env.DB, c.get('tenantId')!, Number(c.req.param('invoiceId')));
  return c.json(result);
});

financeRouter.post('/payments', async (c) => {
  const body = await c.req.json();
  const payment = await finance.createPayment(c.env.DB, c.get('tenantId')!, body);
  return c.json(payment, 201);
});
