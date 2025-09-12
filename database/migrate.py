#!/usr/bin/env python3
"""
Database Migration Manager for Resume Editor
Similar to Laravel/Django migrations but for SQLite
"""

import os
import sqlite3
import sys
from pathlib import Path
from datetime import datetime
from typing import List, Optional


class MigrationManager:
    """Manages database migrations similar to Laravel/Django"""
    
    def __init__(self, db_path: str = "resume_editor.db"):
        self.db_path = db_path
        self.migrations_dir = Path(__file__).parent / "migrations"
        self.seeds_dir = Path(__file__).parent / "seeds"
        self.init_migrations_table()
    
    def init_migrations_table(self):
        """Create migrations tracking table"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS migrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    migration TEXT UNIQUE NOT NULL,
                    batch INTEGER NOT NULL,
                    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
    
    def get_migration_files(self) -> List[Path]:
        """Get all migration files sorted by name"""
        if not self.migrations_dir.exists():
            return []
        
        migration_files = []
        for file_path in self.migrations_dir.glob("*.sql"):
            if file_path.is_file():
                migration_files.append(file_path)
        
        return sorted(migration_files)
    
    def get_executed_migrations(self) -> List[str]:
        """Get list of executed migrations"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT migration FROM migrations ORDER BY id")
            return [row[0] for row in cursor.fetchall()]
    
    def get_next_batch(self) -> int:
        """Get next batch number for migrations"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT MAX(batch) FROM migrations")
            result = cursor.fetchone()
            return (result[0] or 0) + 1
    
    def execute_migration(self, migration_file: Path) -> bool:
        """Execute a single migration file"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Read migration file
                with open(migration_file, 'r') as f:
                    sql_content = f.read()
                
                # Execute migration
                conn.executescript(sql_content)
                
                # Record migration
                migration_name = migration_file.name
                batch = self.get_next_batch()
                
                conn.execute("""
                    INSERT INTO migrations (migration, batch, executed_at)
                    VALUES (?, ?, ?)
                """, (migration_name, batch, datetime.now()))
                
                conn.commit()
                print(f"✓ Executed migration: {migration_name}")
                return True
                
        except Exception as e:
            print(f"✗ Failed to execute migration {migration_file.name}: {str(e)}")
            return False
    
    def migrate(self, target: Optional[str] = None) -> bool:
        """Run all pending migrations"""
        print("🔄 Running database migrations...")
        
        migration_files = self.get_migration_files()
        executed_migrations = self.get_executed_migrations()
        
        pending_migrations = []
        for migration_file in migration_files:
            if migration_file.name not in executed_migrations:
                pending_migrations.append(migration_file)
        
        if not pending_migrations:
            print("✓ No pending migrations")
            return True
        
        print(f"Found {len(pending_migrations)} pending migrations:")
        for migration in pending_migrations:
            print(f"  - {migration.name}")
        
        success = True
        for migration_file in pending_migrations:
            if not self.execute_migration(migration_file):
                success = False
                break
        
        if success:
            print("🎉 All migrations completed successfully!")
        else:
            print("❌ Some migrations failed!")
        
        return success
    
    def rollback(self, steps: int = 1) -> bool:
        """Rollback last batch of migrations"""
        print(f"🔄 Rolling back {steps} migration batch(es)...")
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Get last batch
            cursor.execute("SELECT MAX(batch) FROM migrations")
            last_batch = cursor.fetchone()[0]
            
            if not last_batch:
                print("No migrations to rollback")
                return True
            
            # Get migrations to rollback
            cursor.execute("""
                SELECT migration FROM migrations 
                WHERE batch = ? 
                ORDER BY id DESC
            """, (last_batch,))
            
            migrations_to_rollback = [row[0] for row in cursor.fetchall()]
            
            if not migrations_to_rollback:
                print("No migrations to rollback")
                return True
            
            print(f"Rolling back migrations from batch {last_batch}:")
            for migration in migrations_to_rollback:
                print(f"  - {migration}")
            
            # Note: SQLite doesn't support DROP COLUMN easily, so we'll just remove from tracking
            # In a real scenario, you'd need rollback SQL files
            cursor.execute("DELETE FROM migrations WHERE batch = ?", (last_batch,))
            conn.commit()
            
            print("✓ Rollback completed (migration tracking only)")
            return True
    
    def status(self):
        """Show migration status"""
        print("📊 Migration Status:")
        print("=" * 50)
        
        migration_files = self.get_migration_files()
        executed_migrations = self.get_executed_migrations()
        
        print(f"Total migration files: {len(migration_files)}")
        print(f"Executed migrations: {len(executed_migrations)}")
        print(f"Pending migrations: {len(migration_files) - len(executed_migrations)}")
        
        print("\nMigration Details:")
        for migration_file in migration_files:
            status = "✓" if migration_file.name in executed_migrations else "⏳"
            print(f"  {status} {migration_file.name}")
    
    def fresh(self) -> bool:
        """Drop all tables and re-run all migrations"""
        print("🔄 Fresh migration (drop and recreate)...")
        
        # Drop all tables
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Get all table names
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            
            # Drop all tables
            for table in tables:
                if table != 'sqlite_sequence':  # Don't drop sqlite_sequence
                    cursor.execute(f"DROP TABLE IF EXISTS {table}")
            
            conn.commit()
            print("✓ Dropped all tables")
        
        # Re-run all migrations
        return self.migrate()
    
    def seed(self) -> bool:
        """Run database seeds"""
        print("🌱 Running database seeds...")
        
        if not self.seeds_dir.exists():
            print("No seeds directory found")
            return True
        
        seed_files = sorted(self.seeds_dir.glob("*.sql"))
        if not seed_files:
            print("No seed files found")
            return True
        
        success = True
        for seed_file in seed_files:
            try:
                with sqlite3.connect(self.db_path) as conn:
                    with open(seed_file, 'r') as f:
                        sql_content = f.read()
                    conn.executescript(sql_content)
                    conn.commit()
                    print(f"✓ Executed seed: {seed_file.name}")
            except Exception as e:
                print(f"✗ Failed to execute seed {seed_file.name}: {str(e)}")
                success = False
        
        return success


def main():
    """CLI for migration manager"""
    if len(sys.argv) < 2:
        print("Usage: python migrate.py <command> [options]")
        print("Commands:")
        print("  migrate          Run all pending migrations")
        print("  rollback [n]     Rollback last n batches (default: 1)")
        print("  fresh            Drop all tables and re-run migrations")
        print("  status           Show migration status")
        print("  seed             Run database seeds")
        return
    
    command = sys.argv[1]
    manager = MigrationManager()
    
    if command == "migrate":
        manager.migrate()
    elif command == "rollback":
        steps = int(sys.argv[2]) if len(sys.argv) > 2 else 1
        manager.rollback(steps)
    elif command == "fresh":
        manager.fresh()
    elif command == "status":
        manager.status()
    elif command == "seed":
        manager.seed()
    else:
        print(f"Unknown command: {command}")


if __name__ == "__main__":
    main()
