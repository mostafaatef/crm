DELETE FROM activities;
DELETE FROM deals;
DELETE FROM contacts;
DELETE FROM organizations;

INSERT INTO organizations (id, name, website, industry, notes) VALUES 
(1, 'Acme Corp', 'acme.com', 'Manufacturing', 'Top prospect for Q3'),
(2, 'Globex', 'globex.com', 'Technology', 'Existing customer');

INSERT INTO contacts (id, organization_id, name, email, phone, job_title, status) VALUES 
(1, 1, 'Wile E. Coyote', 'wile@acme.com', '555-0100', 'CEO', 'lead'),
(2, 2, 'Hank Scorpio', 'hank@globex.com', '555-0200', 'Founder', 'customer');

INSERT INTO deals (id, organization_id, contact_id, name, stage, value, close_date) VALUES 
(1, 1, 1, 'Acme Q3 Order', 'Negotiation', 10000, '2026-09-30'),
(2, 2, 2, 'Globex Renewal', 'Won', 5000, '2026-01-15'),
(3, 1, 1, 'Acme Service Contract', 'Proposal', 2500, '2026-10-15');

INSERT INTO activities (id, contact_id, deal_id, type, description, done, due_date) VALUES 
(1, 1, 1, 'call', 'Initial pitch went well.', 1, '2026-07-01'),
(2, 1, 1, 'note', 'Need to send revised proposal by end of week.', 0, '2026-07-15'),
(3, 2, 2, 'email', 'Sent renewal invoice.', 1, '2026-01-14');
