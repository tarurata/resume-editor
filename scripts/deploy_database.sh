#!/bin/bash
# Database Deployment Script for Resume Editor
# Similar to Laravel/Django deployment

set -e

echo "🚀 Deploying Resume Editor Database..."

# Configuration
DB_PATH="${DB_PATH:-resume_editor.db}"
MIGRATIONS_DIR="database/migrations"
SEEDS_DIR="database/seeds"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "📁 Creating new database: $DB_PATH"
    touch "$DB_PATH"
fi

# Run migrations
echo "🔄 Running migrations..."
python3 database/migrate.py migrate

# Run seeds (optional)
if [ "$1" = "--seed" ] || [ "$1" = "-s" ]; then
    echo "🌱 Running seeds..."
    python3 database/migrate.py seed
fi

# Show status
echo "📊 Database status:"
python3 database/migrate.py status

echo "✅ Database deployment complete!"
echo "Database file: $DB_PATH"
