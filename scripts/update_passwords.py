#!/usr/bin/env python3
import sys
from pathlib import Path
import getpass

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "backend-app"))

from database.database import DatabaseService
from core.security import get_password_hash

def update_passwords():
    """Update passwords for existing users"""
    db = DatabaseService("resume_editor.db")
    users = db.get_users()

    for user in users:
        if user['hashed_password'] == 'NOT_A_VALID_PASSWORD':
            while True:
                new_password = getpass.getpass(f"Enter new password for {user['email']}: ")
                if new_password:
                    break
                else:
                    print("Password cannot be empty.")
            
            hashed_password = get_password_hash(new_password)
            db.update_user_password(user['id'], hashed_password)
            print(f"Password for {user['email']} updated.")

if __name__ == "__main__":
    update_passwords()