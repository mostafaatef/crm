CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
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
