import type { D1Database } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { finance } from '../models/finance';

export const financeRouter = new Hono<{ Bindings: { DB: D1Database } }>();

// Contracts
financeRouter.get('/deals/:dealId/contracts', async (c) => {
  const result = await finance.getContractsByDealId(c.env.DB, Number(c.req.param('dealId')));
  return c.json(result);
});

financeRouter.post('/contracts', async (c) => {
  const body = await c.req.json();
  const contract = await finance.createContract(c.env.DB, body);
  return c.json(contract, 201);
});

financeRouter.put('/contracts/:id', async (c) => {
  const body = await c.req.json();
  const contract = await finance.updateContract(c.env.DB, Number(c.req.param('id')), body);
  if (!contract) return c.json({ error: 'Not found' }, 404);
  return c.json(contract);
});

// Subcontracts
financeRouter.get('/deals/:dealId/subcontracts', async (c) => {
  const result = await finance.getSubcontractsByDealId(c.env.DB, Number(c.req.param('dealId')));
  return c.json(result);
});

financeRouter.post('/subcontracts', async (c) => {
  const body = await c.req.json();
  const subcontract = await finance.createSubcontract(c.env.DB, body);
  return c.json(subcontract, 201);
});

financeRouter.put('/subcontracts/:id', async (c) => {
  const body = await c.req.json();
  const subcontract = await finance.updateSubcontract(c.env.DB, Number(c.req.param('id')), body);
  if (!subcontract) return c.json({ error: 'Not found' }, 404);
  return c.json(subcontract);
});

// Expenses
financeRouter.get('/deals/:dealId/expenses', async (c) => {
  const result = await finance.getExpensesByDealId(c.env.DB, Number(c.req.param('dealId')));
  return c.json(result);
});

financeRouter.post('/expenses', async (c) => {
  const body = await c.req.json();
  const expense = await finance.createExpense(c.env.DB, body);
  return c.json(expense, 201);
});

financeRouter.put('/expenses/:id', async (c) => {
  const body = await c.req.json();
  const expense = await finance.updateExpense(c.env.DB, Number(c.req.param('id')), body);
  if (!expense) return c.json({ error: 'Not found' }, 404);
  return c.json(expense);
});

// Estimates
financeRouter.get('/deals/:dealId/estimates', async (c) => {
  const result = await finance.getEstimatesByDealId(c.env.DB, Number(c.req.param('dealId')));
  return c.json(result);
});

financeRouter.post('/estimates', async (c) => {
  const body = await c.req.json();
  const estimate = await finance.createEstimate(c.env.DB, body);
  return c.json(estimate, 201);
});

financeRouter.put('/estimates/:id', async (c) => {
  const body = await c.req.json();
  const estimate = await finance.updateEstimate(c.env.DB, Number(c.req.param('id')), body);
  if (!estimate) return c.json({ error: 'Not found' }, 404);
  return c.json(estimate);
});

// Invoices
financeRouter.get('/contracts/:contractId/invoices', async (c) => {
  const result = await finance.getInvoicesByContractId(c.env.DB, Number(c.req.param('contractId')));
  return c.json(result);
});

financeRouter.post('/invoices', async (c) => {
  const body = await c.req.json();
  const invoice = await finance.createInvoice(c.env.DB, body);
  return c.json(invoice, 201);
});

financeRouter.put('/invoices/:id', async (c) => {
  const body = await c.req.json();
  const invoice = await finance.updateInvoice(c.env.DB, Number(c.req.param('id')), body);
  if (!invoice) return c.json({ error: 'Not found' }, 404);
  return c.json(invoice);
});

// Payments
financeRouter.get('/invoices/:invoiceId/payments', async (c) => {
  const result = await finance.getPaymentsByInvoiceId(c.env.DB, Number(c.req.param('invoiceId')));
  return c.json(result);
});

financeRouter.post('/payments', async (c) => {
  const body = await c.req.json();
  const payment = await finance.createPayment(c.env.DB, body);
  return c.json(payment, 201);
});
