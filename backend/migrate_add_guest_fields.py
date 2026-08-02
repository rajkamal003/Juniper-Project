"""
migrate_add_guest_fields.py
----------------------------
Adds host_faculty (VARCHAR 255) and visit_date (DATE) columns to the
`users` table if they do not already exist.

Run from the backend/ directory:
  py migrate_add_guest_fields.py
"""
import sys, os

# Ensure app package is importable
sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine
from sqlalchemy import text, inspect

def column_exists(conn, table_name, col_name):
    result = conn.execute(text(
        "SELECT COUNT(*) FROM information_schema.columns "
        "WHERE table_name = :t AND column_name = :c"
    ), {"t": table_name, "c": col_name})
    return result.scalar() > 0

def migrate():
    with engine.connect() as conn:
        # Add host_faculty
        if not column_exists(conn, "users", "host_faculty"):
            conn.execute(text("ALTER TABLE users ADD COLUMN host_faculty VARCHAR(255) NULL"))
            print("[+] Added column: users.host_faculty")
        else:
            print("[=] Column already exists: users.host_faculty")

        # Add visit_date
        if not column_exists(conn, "users", "visit_date"):
            conn.execute(text("ALTER TABLE users ADD COLUMN visit_date DATE NULL"))
            print("[+] Added column: users.visit_date")
        else:
            print("[=] Column already exists: users.visit_date")

        conn.commit()
        print("[OK] Migration complete.")

if __name__ == "__main__":
    migrate()
