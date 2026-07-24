# backend/seed_db_clean.py
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.config.config import settings
from app.models.models import Base, Role, Permission, User, SystemSetting
from app.utils.auth_utils import hash_password

def seed_db():
    print(f"Connecting to database to seed default roles and settings...")
    
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    engine = create_engine(db_url)
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Seed Roles
        roles_data = [
            (1, 'Super Admin', 'Full system administrator with access to all controls and configurations'),
            (2, 'Faculty', 'Academic staff with access to department-level systems and student directories'),
            (3, 'Student', 'Campus students with access to their own records and student portal'),
            (4, 'Parent Visitor', 'Parents of students visiting the campus with temporary access'),
            (5, 'Guest', 'General visitors requiring temporary guest network and campus access')
        ]
        
        for rid, name, desc in roles_data:
            role = db.query(Role).filter(Role.id == rid).first()
            if not role:
                db.add(Role(id=rid, role_name=name, description=desc))
                print(f"Seeded Role: {name}")
            else:
                role.role_name = name
                role.description = desc
        db.commit()
        
        # 2. Seed default system settings
        setting = db.query(SystemSetting).first()
        if not setting:
            db.add(SystemSetting(
                id=1,
                account_approval_mode="AUTO",
                session_timeout=15,
                mfa_required_for_admin=False,
                unauthorized_attempts_limit=5
            ))
            print("Seeded default System Settings.")
            db.commit()
            
        # 3. Seed Admin User if missing
        admin_check = db.query(User).filter(User.email == 'admin@securecampus.com').first()
        if not admin_check:
            admin_hash = hash_password("Admin@123")
            db.add(User(
                fullname='Super Admin',
                email='admin@securecampus.com',
                phone='9988776655',
                password_hash=admin_hash,
                role_id=1,
                account_status='Active',
                is_verified=True,
                is_first_login=False,
                employee_id='ADM-001'
            ))
            print("Seeded Super Admin user (admin@securecampus.com / Admin@123)")
            db.commit()
            
        print("Database seeding completed successfully!")
        
    except Exception as e:
        print(f"Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
