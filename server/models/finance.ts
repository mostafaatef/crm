import type { D1Database } from '@cloudflare/workers-types';

function buildUpdateQuery(tableName: string, fields: string[], data: any, tenantId: number, id: number) {
  const setFields = fields.filter(f => data[f] !== undefined);
  if (setFields.length === 0) return null;
  const sets = setFields.map((f, i) => `${f} = ?${i + 1}`).join(', ');
  const values = setFields.map(f => data[f]);
  return { query: `UPDATE ${tableName} SET ${sets} WHERE tenant_id = ?${setFields.length + 1} AND id = ?${setFields.length + 2} RETURNING *`, values: [...values, tenantId, id] };
}

export const finance = {
  // Overview
  getOverview: async (db: D1Database, tenantId: number) => {
    const revenueRow = await db.prepare('SELECT SUM(amount) as total FROM invoices WHERE tenant_id = ? AND status = ?').bind(tenantId, 'Paid').first<{total: number}>();
    const revenue = revenueRow?.total || 0;

    const expenseRow = await db.prepare('SELECT SUM(amount) as total FROM expenses WHERE tenant_id = ?').bind(tenantId).first<{total: number}>();
    const expenses = expenseRow?.total || 0;

    const subRow = await db.prepare('SELECT SUM(committed_value) as total FROM subcontracts WHERE tenant_id = ? AND status != ?').bind(tenantId, 'Draft').first<{total: number}>();
    const subcontracts = subRow?.total || 0;

    const estimateRow = await db.prepare('SELECT SUM(total_amount) as total FROM estimates WHERE tenant_id = ? AND status != ?').bind(tenantId, 'Rejected').first<{total: number}>();
    const potentialRevenue = estimateRow?.total || 0;

    const costs = expenses + subcontracts;
    const profit = revenue - costs;

    return {
      revenue,
      potentialRevenue,
      costs,
      expenses,
      subcontracts,
      profit
    };
  },

  // Contracts
  getAllContracts: async (db: D1Database, tenantId: number) => {
    return (await db.prepare('SELECT c.*, d.name as deal_name FROM contracts c LEFT JOIN deals d ON c.deal_id = d.id WHERE c.tenant_id = ? ORDER BY c.created_at DESC').bind(tenantId).all()).results;
  },
  getContractsByDealId: async (db: D1Database, tenantId: number, dealId: number) => {
    return (await db.prepare('SELECT * FROM contracts WHERE tenant_id = ? AND deal_id = ? ORDER BY created_at DESC').bind(tenantId, dealId).all()).results;
  },
  createContract: async (db: D1Database, tenantId: number, data: any) => {
    return await db.prepare('INSERT INTO contracts (tenant_id, deal_id, contract_number, status, total_value, signed_date, scope_of_work) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) RETURNING *')
      .bind(tenantId, data.deal_id, data.contract_number, data.status || 'Draft', data.total_value || 0, data.signed_date || null, data.scope_of_work || null).first();
  },
  updateContract: async (db: D1Database, tenantId: number, id: number, data: any) => {
    const q = buildUpdateQuery('contracts', ['status', 'total_value', 'signed_date', 'scope_of_work'], data, tenantId, id);
    if (!q) return await db.prepare('SELECT * FROM contracts WHERE tenant_id = ? AND id = ?').bind(tenantId, id).first();
    return await db.prepare(q.query).bind(...q.values).first();
  },

  // Subcontracts
  getAllSubcontracts: async (db: D1Database, tenantId: number) => {
    return (await db.prepare('SELECT s.*, o.name as subcontractor_name, d.name as deal_name FROM subcontracts s LEFT JOIN organizations o ON s.subcontractor_organization_id = o.id LEFT JOIN deals d ON s.deal_id = d.id WHERE s.tenant_id = ? ORDER BY s.created_at DESC').bind(tenantId).all()).results;
  },
  getSubcontractsByDealId: async (db: D1Database, tenantId: number, dealId: number) => {
    return (await db.prepare('SELECT s.*, o.name as subcontractor_name FROM subcontracts s LEFT JOIN organizations o ON s.subcontractor_organization_id = o.id WHERE s.tenant_id = ? AND s.deal_id = ? ORDER BY s.created_at DESC').bind(tenantId, dealId).all()).results;
  },
  createSubcontract: async (db: D1Database, tenantId: number, data: any) => {
    return await db.prepare('INSERT INTO subcontracts (tenant_id, deal_id, subcontractor_organization_id, status, committed_value, scope_of_work) VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING *')
      .bind(tenantId, data.deal_id, data.subcontractor_organization_id, data.status || 'Draft', data.committed_value || 0, data.scope_of_work || null).first();
  },
  updateSubcontract: async (db: D1Database, tenantId: number, id: number, data: any) => {
    const q = buildUpdateQuery('subcontracts', ['status', 'committed_value', 'scope_of_work'], data, tenantId, id);
    if (!q) return await db.prepare('SELECT * FROM subcontracts WHERE tenant_id = ? AND id = ?').bind(tenantId, id).first();
    return await db.prepare(q.query).bind(...q.values).first();
  },
  
  // Expenses
  getAllExpenses: async (db: D1Database, tenantId: number) => {
    return (await db.prepare('SELECT e.*, d.name as deal_name FROM expenses e LEFT JOIN deals d ON e.deal_id = d.id WHERE e.tenant_id = ? ORDER BY e.date_incurred DESC').bind(tenantId).all()).results;
  },
  getExpensesByDealId: async (db: D1Database, tenantId: number, dealId: number) => {
    return (await db.prepare('SELECT * FROM expenses WHERE tenant_id = ? AND deal_id = ? ORDER BY date_incurred DESC').bind(tenantId, dealId).all()).results;
  },
  createExpense: async (db: D1Database, tenantId: number, data: any) => {
    return await db.prepare('INSERT INTO expenses (tenant_id, deal_id, subcontract_id, category, amount, date_incurred, vendor_name, description) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) RETURNING *')
      .bind(tenantId, data.deal_id, data.subcontract_id || null, data.category, data.amount || 0, data.date_incurred || null, data.vendor_name || null, data.description || null).first();
  },
  updateExpense: async (db: D1Database, tenantId: number, id: number, data: any) => {
    const q = buildUpdateQuery('expenses', ['category', 'amount', 'date_incurred', 'vendor_name', 'description'], data, tenantId, id);
    if (!q) return await db.prepare('SELECT * FROM expenses WHERE tenant_id = ? AND id = ?').bind(tenantId, id).first();
    return await db.prepare(q.query).bind(...q.values).first();
  },

  // Estimates
  getAllEstimates: async (db: D1Database, tenantId: number) => {
    return (await db.prepare('SELECT e.*, d.name as deal_name FROM estimates e LEFT JOIN deals d ON e.deal_id = d.id WHERE e.tenant_id = ? ORDER BY e.created_at DESC').bind(tenantId).all()).results;
  },
  getEstimatesByDealId: async (db: D1Database, tenantId: number, dealId: number) => {
    return (await db.prepare('SELECT * FROM estimates WHERE tenant_id = ? AND deal_id = ? ORDER BY created_at DESC').bind(tenantId, dealId).all()).results;
  },
  createEstimate: async (db: D1Database, tenantId: number, data: any) => {
    return await db.prepare('INSERT INTO estimates (tenant_id, deal_id, estimate_number, status, total_amount, valid_until, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) RETURNING *')
      .bind(tenantId, data.deal_id, data.estimate_number, data.status || 'Draft', data.total_amount || 0, data.valid_until || null, data.notes || null).first();
  },
  updateEstimate: async (db: D1Database, tenantId: number, id: number, data: any) => {
    const q = buildUpdateQuery('estimates', ['status', 'total_amount', 'valid_until', 'notes'], data, tenantId, id);
    if (!q) return await db.prepare('SELECT * FROM estimates WHERE tenant_id = ? AND id = ?').bind(tenantId, id).first();
    return await db.prepare(q.query).bind(...q.values).first();
  },
  
  // Invoices
  getAllInvoices: async (db: D1Database, tenantId: number) => {
    return (await db.prepare('SELECT i.*, c.contract_number, d.name as deal_name, d.id as deal_id FROM invoices i LEFT JOIN contracts c ON i.contract_id = c.id LEFT JOIN deals d ON c.deal_id = d.id WHERE i.tenant_id = ? ORDER BY i.issue_date DESC').bind(tenantId).all()).results;
  },
  getInvoicesByContractId: async (db: D1Database, tenantId: number, contractId: number) => {
    return (await db.prepare('SELECT * FROM invoices WHERE tenant_id = ? AND contract_id = ? ORDER BY issue_date DESC').bind(tenantId, contractId).all()).results;
  },
  createInvoice: async (db: D1Database, tenantId: number, data: any) => {
    return await db.prepare('INSERT INTO invoices (tenant_id, contract_id, invoice_number, status, amount, issue_date, due_date, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) RETURNING *')
      .bind(tenantId, data.contract_id, data.invoice_number, data.status || 'Draft', data.amount || 0, data.issue_date || null, data.due_date || null, data.notes || null).first();
  },
  updateInvoice: async (db: D1Database, tenantId: number, id: number, data: any) => {
    const q = buildUpdateQuery('invoices', ['status', 'amount', 'issue_date', 'due_date', 'notes'], data, tenantId, id);
    if (!q) return await db.prepare('SELECT * FROM invoices WHERE tenant_id = ? AND id = ?').bind(tenantId, id).first();
    return await db.prepare(q.query).bind(...q.values).first();
  },
  
  // Payments
  getPaymentsByInvoiceId: async (db: D1Database, tenantId: number, invoiceId: number) => {
    return (await db.prepare('SELECT * FROM payments WHERE tenant_id = ? AND invoice_id = ? ORDER BY payment_date DESC').bind(tenantId, invoiceId).all()).results;
  },
  createPayment: async (db: D1Database, tenantId: number, data: any) => {
    return await db.prepare('INSERT INTO payments (tenant_id, invoice_id, amount, payment_date, method, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING *')
      .bind(tenantId, data.invoice_id, data.amount || 0, data.payment_date || null, data.method || null, data.notes || null).first();
  }
};
