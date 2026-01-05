from pathlib import Path
import sys
import traceback

# Ensure backend folder is on sys.path so imports like `database` resolve
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlmodel import Session
from database import engine, create_db_and_tables
from models import User
from auth_utils import get_password_hash
from sqlalchemy.exc import IntegrityError

def run():
    try:
        # ensure tables exist before inserting
        create_db_and_tables()
        with Session(engine) as s:
            u = User(email="test_user@example.com", hashed_password="password123", name="Test User")
            u.hashed_password = get_password_hash(u.hashed_password)
            s.add(u)
            try:
                s.commit()
            except IntegrityError:
                s.rollback()
                print('User already exists, skipping')
                return

            s.refresh(u)
            print('Created', u.id)
    except Exception as e:
        traceback.print_exc()
        print('ERROR:', e)

if __name__ == '__main__':
    run()
