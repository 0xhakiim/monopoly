from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.User import Base


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create the engine once (usually at app startup)

engine = create_engine("postgresql+psycopg2://postgres:admin@localhost:5432/monopoly", pool_pre_ping=True)
Base.metadata.create_all(bind=engine)
# Create a Session factory
SessionLocal = sessionmaker(bind=engine)
