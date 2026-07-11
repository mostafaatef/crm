import { describe, it, expect, beforeAll } from 'vitest';
import { db, initDb } from '../server/db';
import { organizations } from '../server/models/organizations';
import { contacts } from '../server/models/contacts';
import { deals } from '../server/models/deals';
import { activities } from '../server/models/activities';

describe('Database Models', () => {
  beforeAll(() => {
    initDb();
    db.exec('DELETE FROM activities');
    db.exec('DELETE FROM deals');
    db.exec('DELETE FROM contacts');
    db.exec('DELETE FROM organizations');
  });

  let orgId: number;
  let contactId: number;
  let dealId: number;
  let activityId: number;

  describe('Organizations', () => {
    it('creates an organization', () => {
      const org = organizations.create({ name: 'Test Org', industry: 'Software' });
      expect(org.id).toBeDefined();
      expect(org.name).toBe('Test Org');
      orgId = org.id!;
    });

    it('reads an organization', () => {
      const org = organizations.getById(orgId);
      expect(org.name).toBe('Test Org');
    });

    it('updates an organization', () => {
      const org = organizations.update(orgId, { website: 'test.com' });
      expect(org.website).toBe('test.com');
    });
  });

  describe('Contacts', () => {
    it('creates a contact', () => {
      const contact = contacts.create({ organization_id: orgId, name: 'John Doe', email: 'john@test.com' });
      expect(contact.id).toBeDefined();
      expect(contact.organization_id).toBe(orgId);
      expect(contact.status).toBe('lead');
      contactId = contact.id!;
    });

    it('reads a contact', () => {
      const contact = contacts.getById(contactId);
      expect(contact.name).toBe('John Doe');
    });

    it('updates a contact', () => {
      const contact = contacts.update(contactId, { status: 'qualified' });
      expect(contact.status).toBe('qualified');
    });
  });

  describe('Deals', () => {
    it('creates a deal', () => {
      const deal = deals.create({ organization_id: orgId, contact_id: contactId, name: 'Test Deal', value: 1000 });
      expect(deal.id).toBeDefined();
      expect(deal.stage).toBe('New');
      dealId = deal.id!;
    });

    it('reads a deal', () => {
      const deal = deals.getById(dealId);
      expect(deal.name).toBe('Test Deal');
      expect(deal.value).toBe(1000);
    });

    it('updates a deal', () => {
      const deal = deals.update(dealId, { stage: 'Won' });
      expect(deal.stage).toBe('Won');
    });
  });

  describe('Activities', () => {
    it('creates an activity', () => {
      const activity = activities.create({ contact_id: contactId, deal_id: dealId, type: 'note', description: 'Test note' });
      expect(activity.id).toBeDefined();
      expect(activity.done).toBe(0);
      activityId = activity.id!;
    });

    it('reads an activity', () => {
      const activity = activities.getById(activityId);
      expect(activity.description).toBe('Test note');
    });

    it('updates an activity', () => {
      const activity = activities.update(activityId, { done: true });
      expect(activity.done).toBe(1);
    });
  });

  describe('Deletions', () => {
    it('deletes an activity', () => {
      activities.delete(activityId);
      expect(activities.getById(activityId)).toBeUndefined();
    });

    it('deletes a deal', () => {
      deals.delete(dealId);
      expect(deals.getById(dealId)).toBeUndefined();
    });

    it('deletes a contact', () => {
      contacts.delete(contactId);
      expect(contacts.getById(contactId)).toBeUndefined();
    });

    it('deletes an organization', () => {
      organizations.delete(orgId);
      expect(organizations.getById(orgId)).toBeUndefined();
    });
  });
});
