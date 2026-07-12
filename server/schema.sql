CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Client', -- Client, Vendor, Subcontractor
  website TEXT,
  industry TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  job_title TEXT,
  status TEXT DEFAULT 'lead', -- lead, qualified, customer
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS deals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER,
  contact_id INTEGER,
  name TEXT NOT NULL,
  stage TEXT DEFAULT 'New', -- New, Qualified, Proposal, Negotiation, Won, Lost
  value INTEGER DEFAULT 0,
  close_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER,
  deal_id INTEGER,
  type TEXT NOT NULL, -- note, call, email
  description TEXT NOT NULL,
  done BOOLEAN DEFAULT 0,
  due_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE,
  FOREIGN KEY (deal_id) REFERENCES deals (id) ON DELETE CASCADE
);

-- FINANCE MODULE

CREATE TABLE IF NOT EXISTS estimates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id INTEGER NOT NULL,
  estimate_number TEXT NOT NULL,
  status TEXT DEFAULT 'Draft', -- Draft, Sent, Accepted, Rejected
  total_amount INTEGER DEFAULT 0,
  valid_until DATE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deal_id) REFERENCES deals (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id INTEGER NOT NULL,
  contract_number TEXT NOT NULL,
  status TEXT DEFAULT 'Draft', -- Draft, Signed, Active, Completed, Cancelled
  total_value INTEGER DEFAULT 0,
  signed_date DATE,
  scope_of_work TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deal_id) REFERENCES deals (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subcontracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id INTEGER NOT NULL,
  subcontractor_organization_id INTEGER NOT NULL,
  status TEXT DEFAULT 'Draft', -- Draft, Active, Completed, Cancelled
  committed_value INTEGER DEFAULT 0,
  scope_of_work TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deal_id) REFERENCES deals (id) ON DELETE CASCADE,
  FOREIGN KEY (subcontractor_organization_id) REFERENCES organizations (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id INTEGER NOT NULL,
  subcontract_id INTEGER,
  category TEXT NOT NULL, -- Material, Labor, Equipment, Subcontractor, Other
  amount INTEGER DEFAULT 0,
  date_incurred DATE,
  vendor_name TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deal_id) REFERENCES deals (id) ON DELETE CASCADE,
  FOREIGN KEY (subcontract_id) REFERENCES subcontracts (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id INTEGER NOT NULL,
  invoice_number TEXT NOT NULL,
  status TEXT DEFAULT 'Draft', -- Draft, Sent, Paid, Overdue
  amount INTEGER DEFAULT 0,
  issue_date DATE,
  due_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  amount INTEGER DEFAULT 0,
  payment_date DATE,
  method TEXT, -- Transfer, Check, Cash, Credit Card
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
);
