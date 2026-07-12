
## Database Migrations & Data Safety
**CRITICAL RULE:** Never drop or reset the production database tables to apply schema changes. Always use safe migration strategies (like `ALTER TABLE`) to preserve existing data. Dropping production tables causes irreversible data loss.
