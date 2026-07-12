import type { D1Database } from '@cloudflare/workers-types';

function buildUpdateQuery(tableName: string, fields: string[], data: any, id: number) {
  const setFields = fields.filter(f => data[f] !== undefined);
  if (setFields.length === 0) return null;
  const sets = setFields.map((f, i) => `${f} = ?${i + 1}`).join(', ');
  const values = setFields.map(f => data[f]);
  return { query: `UPDATE ${tableName} SET ${sets} WHERE id = ?${setFields.length + 1} RETURNING *`, values: [...values, id] };
}

export const finance = {
  // Contracts
  getContractsByDealId: async (db: D1Database, dealId: number) => {
    return (await db.prepare('SELECT * FROM contracts WHERE deal_id = ? ORDER BY created_at DESC').bind(dealId).all()).results;
  },
  createContract: async (db: D1Database, data: any) => {
    return await db.prepare('INSERT INTO contracts (deal_id, contract_number, status, total_value, signed_date, scope_of_work) VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING *')
      .bind(data.deal_id, data.contract_number, data.status || 'Draft', data.total_value || 0, data.signed_date || null, data.scope_of_work || null).first();
  },
  updateContract: async (db: D1Database, id: number, data: any) => {
    const q = buildUpdateQuery('contracts', ['status', 'total_value', 'signed_date', 'scope_of_work'], data, id);
    if (!q) return await db.prepare('SELECT * FROM contracts WHERE id = ?').bind(id).first();
    return await db.prepare(q.query).bind(...q.values).first();
  },

  // Subcontracts
  getSubcontractsByDealId: async (db: D1Database, dealId: number) => {
    return (await db.prepare('SELECT s.*, o.name as subcontractor_name FROM subcontracts s LEFT JOIN organizations o ON s.subcontractor_organization_id = o.id WHERE s.deal_id = ? ORDER BY s.created_at DESC').bind(dealId).all()).results;
  },
  createSubcontract: async (db: D1Database, data: any) => {
    return await db.prepare('INSERT INTO subcontracts (deal_id, subcontractor_organization_id, status, committed_value, scope_of_work) VALUES (?1, ?2, ?3, ?4, ?5) RETURNING *')
      .bind(data.deal_id, data.subcontractor_organization_id, data.status || 'Draft', data.committed_value || 0, data.scope_of_work || null).first();
  },
  updateSubcontract: async (db: D1Database, id: number, data: any) => {
    const q = buildUpdateQuery('subcontracts', ['status', 'committed_value', 'scope_of_work'], data, id);
    if (!q) return await db.prepare('SELECT * FROM subcontracts WHERE id = ?').bind(id).first();
    return await db.prepare(q.query).bind(...q.values).first();
  },
  
  // Expenses
  getExpensesByDealId: async (db: D1Database, dealId: number) => {
    return (await db.prepare('SELECT * FROM expenses WHERE deal_id = ? ORDER BY date_incurred DESC').bind(dealId).all()).results;
  },
  createExpense: async (db: D1Database, data: any) => {
    return await db.prepare('INSERT INTO expenses (deal_id, subcontract_id, category, amount, date_incurred, vendor_name, description) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) RETURNING *')
      .bind(data.deal_id, data.subcontract_id || null, data.category, data.amount || 0, data.date_incurred || null, data.vendor_name || null, data.description || null).first();
  },
  updateExpense: async (db: D1Database, id: number, data: any) => {
    const q = buildUpdateQuery('expenses', ['category', 'amount', 'date_incurred', 'vendor_name', 'description'], data, id);
    if (!q) return await db.prepare('SELECT * FROM expenses WHERE id = ?').bind(id).first();
    return await db.prepare(q.query).bind(...q.values).first();
  },

  // Estimates
  getEstimatesByDealId: async (db: D1Database, dealId: number) => {
    return (await db.prepare('SELECT * FROM estimates WHERE deal_id = ? ORDER BY created_at DESC').bind(dealId).all()).results;
  },
  createEstimate: async (db: D1Database, data: any) => {
    return await db.prepare('INSERT INTO estimates (deal_id, estimate_number, status, total_amount, valid_until, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING *')
      .bind(data.deal_id, data.estimate_number, data.status || 'Draft', data.total_amount || 0, data.valid_until || null, data.notes || null).first();
  },
  updateEstimate: async (db: D1Database, id: number, data: any) => {
    const q = buildUpdateQuery('estimates', ['status', 'total_amount', 'valid_until', 'notes'], data, id);
    if (!q) return await db.prepare('SELECT * FROM estimates WHERE id = ?').bind(id).first();
    return await db.prepare(q.query).bind(...q.values).first();
  },
  
  // Invoices
  getInvoicesByContractId: async (db: D1Database, contractId: number) => {
    return (await db.prepare('SELECT * FROM invoices WHERE contract_id = ? ORDER BY issue_date DESC').bind(contractId).all()).results;
  },
  createInvoice: async (db: D1Database, data: any) => {
    return await db.prepare('INSERT INTO invoices (contract_id, invoice_number, status, amount, issue_date, due_date) VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING *')
      .bind(data.contract_id, data.invoice_number, data.status || 'Draft', data.amount || 0, data.issue_date || null, data.due_date || null).first();
  },
  updateInvoice: async (db: D1Database, id: number, data: any) => {
    const q = buildUpdateQuery('invoices', ['status', 'amount', 'issue_date', 'due_date'], data, id);
    if (!q) return await db.prepare('SELECT * FROM invoices WHERE id = ?').bind(id).first();
    return await db.prepare(q.query).bind(...q.values).first();
  },
  
  // Payments
  getPaymentsByInvoiceId: async (db: D1Database, invoiceId: number) => {
    return (await db.prepare('SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC').bind(invoiceId).all()).results;
  },
  createPayment: async (db: D1Database, data: any) => {
    return await db.prepare('INSERT INTO payments (invoice_id, amount, payment_date, method) VALUES (?1, ?2, ?3, ?4) RETURNING *')
      .bind(data.invoice_id, data.amount || 0, data.payment_date || null, data.method || null).first();
  }
};
