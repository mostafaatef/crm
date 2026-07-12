DELETE FROM payments;
DELETE FROM invoices;
DELETE FROM expenses;
DELETE FROM subcontracts;
DELETE FROM contracts;
DELETE FROM estimates;
DELETE FROM activities;
DELETE FROM deals;
DELETE FROM contacts;
DELETE FROM organizations;

INSERT INTO organizations (id, name, type, website, industry, notes) VALUES 
(1, 'Acme Real Estate', 'Client', 'acme.com', 'Real Estate', 'Top client for commercial builds'),
(2, 'Globex Corp', 'Client', 'globex.com', 'Technology', 'Office renovations'),
(3, 'Bob''s Plumbing', 'Subcontractor', 'bobsplumbing.com', 'Construction', 'Reliable plumber for commercial'),
(4, 'Sparky Electrics', 'Subcontractor', 'sparkyelec.com', 'Construction', 'Commercial electricians');

INSERT INTO contacts (id, organization_id, name, email, phone, job_title, status) VALUES 
(1, 1, 'Wile E. Coyote', 'wile@acme.com', '555-0100', 'Director of Operations', 'customer'),
(2, 2, 'Hank Scorpio', 'hank@globex.com', '555-0200', 'CEO', 'customer'),
(3, 3, 'Bob Builder', 'bob@bobsplumbing.com', '555-0300', 'Owner', 'customer');

INSERT INTO deals (id, organization_id, contact_id, name, stage, value, close_date) VALUES 
(1, 1, 1, 'Acme HQ Renovation', 'Won', 150000, '2026-06-01'),
(2, 2, 2, 'Globex Server Room Build', 'Negotiation', 45000, '2026-08-15'),
(3, 1, 1, 'Acme Warehouse Extension', 'Proposal', 250000, '2026-10-15');

INSERT INTO activities (id, contact_id, deal_id, type, description, done, due_date) VALUES 
(1, 1, 1, 'call', 'Kickoff meeting completed.', 1, '2026-06-05'),
(2, 1, 3, 'note', 'Need to revise structural drawings.', 0, '2026-07-20');

-- FINANCE DATA FOR 'Acme HQ Renovation' (deal_id = 1)

INSERT INTO estimates (id, deal_id, estimate_number, status, total_amount, valid_until, notes) VALUES
(1, 1, 'EST-001', 'Accepted', 150000, '2026-05-30', 'Full HQ interior renovation');

INSERT INTO contracts (id, deal_id, contract_number, status, total_value, signed_date, scope_of_work) VALUES
(1, 1, 'CON-001', 'Active', 150000, '2026-06-01', 'Demolition, framing, drywall, finishing for HQ interior.');

INSERT INTO subcontracts (id, deal_id, subcontractor_organization_id, status, committed_value, scope_of_work) VALUES
(1, 1, 3, 'Active', 20000, 'All rough and finish plumbing for restrooms and kitchen'),
(2, 1, 4, 'Active', 35000, 'Complete electrical rewiring and lighting installation');

INSERT INTO expenses (id, deal_id, subcontract_id, category, amount, date_incurred, vendor_name, description) VALUES
(1, 1, NULL, 'Material', 15000, '2026-06-10', 'Home Depot', 'Lumber and framing materials'),
(2, 1, NULL, 'Equipment', 2500, '2026-06-12', 'Sunbelt Rentals', 'Scissor lift rental'),
(3, 1, 1, 'Subcontractor', 10000, '2026-06-25', 'Bob''s Plumbing', '50% progress billing for plumbing rough-in');

INSERT INTO invoices (id, contract_id, invoice_number, status, amount, issue_date, due_date) VALUES
(1, 1, 'INV-001', 'Paid', 30000, '2026-06-01', '2026-06-15'), -- 20% Deposit
(2, 1, 'INV-002', 'Sent', 60000, '2026-07-01', '2026-07-15'); -- 40% Midpoint

INSERT INTO payments (id, invoice_id, amount, payment_date, method) VALUES
(1, 1, 30000, '2026-06-10', 'Transfer');
