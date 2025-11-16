from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create the engine once (usually at app startup)

engine = create_engine("mysql+pymysql://root@localhost/monopoly", pool_pre_ping=True)

# Create a Session factory
SessionLocal = sessionmaker(bind=engine)
