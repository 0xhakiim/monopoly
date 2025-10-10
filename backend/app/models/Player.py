import User
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import String, Integer, Boolean, ForeignKey, create_engine
from typing import List, Optional

Base = declarative_base()

class Player:
    __tablename__ = "players"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    userid: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    avatar: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    level: Mapped[int] = mapped_column(Integer, default=1)


engine = create_engine('mysql+pymysql://root:password@localhost/dbname')
Base.metadata.create_all(engine)