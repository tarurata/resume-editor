# Database Migration System

A Laravel/Django-style migration system for Resume Editor using SQLite.

## �� Structure

```
database/
├── migrations/           # Migration files (numbered)
│   ├── 001_initial_schema.sql
│   ├── 002_add_indexes.sql
│   └── 003_add_triggers.sql
├── seeds/               # Seed files for sample data
│   ├── 001_sample_data.sql
│   └── 002_resume_templates.sql
├── migrate.py           # Migration manager
└── schema.sql           # Current complete schema
```

## 🚀 Usage

### Run Migrations
```bash
# Run all pending migrations
python3 database/migrate.py migrate

# Run with seeds
python3 database/migrate.py migrate && python3 database/migrate.py seed
```

### Check Status
```bash
# Show migration status
python3 database/migrate.py status
```

### Rollback
```bash
# Rollback last batch
python3 database/migrate.py rollback

# Rollback multiple batches
python3 database/migrate.py rollback 3
```

### Fresh Start
```bash
# Drop all tables and re-run migrations
python3 database/migrate.py fresh
```

### Run Seeds
```bash
# Run database seeds
python3 database/migrate.py seed
```

## 🛠️ Deployment

### Local Development
```bash
# Deploy database locally
./scripts/deploy_database.sh

# Deploy with seeds
./scripts/deploy_database.sh --seed
```

### Production Deployment
```bash
# Set database path
export DB_PATH="/path/to/production/resume_editor.db"

# Deploy
./scripts/deploy_database.sh
```

## 📝 Creating New Migrations

1. **Create migration file:**
```bash
# Create new migration file
touch database/migrations/004_add_new_feature.sql
```

2. **Write migration SQL:**
```sql
-- Migration: 004_add_new_feature.sql
-- Description: Add new feature to database
-- Created: 2024-01-15

-- Add new table
CREATE TABLE IF NOT EXISTS new_table (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add new column
ALTER TABLE existing_table ADD COLUMN new_column TEXT;
```

3. **Run migration:**
```bash
python3 database/migrate.py migrate
```

## 🌱 Creating Seeds

1. **Create seed file:**
```bash
touch database/seeds/003_new_sample_data.sql
```

2. **Write seed SQL:**
```sql
-- Seed: 003_new_sample_data.sql
-- Description: New sample data

INSERT OR IGNORE INTO new_table (id, name) VALUES 
('sample_001', 'Sample Data');
```

3. **Run seeds:**
```bash
python3 database/migrate.py seed
```

## 🔄 Migration Workflow

### Development
1. Create migration file
2. Write SQL changes
3. Test locally: `python3 database/migrate.py migrate`
4. Commit to Git

### Production
1. Pull latest code
2. Run: `./scripts/deploy_database.sh`
3. Verify: `python3 database/migrate.py status`

## 📊 Migration Tracking

The system tracks migrations in a `migrations` table:
- `id`: Auto-increment ID
- `migration`: Migration filename
- `batch`: Batch number (for rollback)
- `executed_at`: Timestamp

## ⚠️ Important Notes

- **Always backup** before running migrations in production
- **Test migrations** on a copy of production data first
- **SQLite limitations**: Some operations (like DROP COLUMN) are limited
- **Rollback**: Currently only removes from tracking (not actual SQL rollback)

## 🆚 vs Laravel/Django

| Feature | Laravel | Django | Our System |
|---------|---------|--------|------------|
| Migrations | ✅ | ✅ | ✅ |
| Rollback | ✅ | ✅ | ⚠️ Limited |
| Seeds | ✅ | ✅ | ✅ |
| Schema Dump | ✅ | ✅ | ✅ |
| Batch Tracking | ✅ | ✅ | ✅ |

## 🔧 Troubleshooting

### Migration Fails
```bash
# Check status
python3 database/migrate.py status

# Check database
sqlite3 resume_editor.db ".schema"

# Fresh start (careful!)
python3 database/migrate.py fresh
```

### Database Locked
```bash
# Check for running processes
lsof resume_editor.db

# Kill processes if needed
kill -9 <PID>
```
