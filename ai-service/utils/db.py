import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# ── Connection string banao
DATABASE_URL = (
    f"postgresql://"
    f"{os.getenv('POSTGRES_USER', 'wholesale_user')}:"
    f"{os.getenv('POSTGRES_PASSWORD', 'changeme_dev')}@"
    f"{os.getenv('POSTGRES_HOST', 'localhost')}:"
    f"{os.getenv('POSTGRES_PORT', '5432')}/"
    f"{os.getenv('POSTGRES_DB', 'wholesale_db')}"
)

# ── Engine banao
engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ── DB session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ── Connection test
def test_connection() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ PostgreSQL connected")
        return True
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        return False