from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped,relationship
from sqlalchemy import VARCHAR, String, Integer, Boolean, ForeignKey,Date
from typing import List, Optional
from enum import Enum
import datetime

class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=True)
    token: Mapped[Optional[str]] = mapped_column(VARCHAR(255), nullable=True)

    sent_friendships = relationship(
        "friendships",
        foreign_keys="friendships.sender_id"
    )

    received_friendships = relationship(
        "friendships",
        foreign_keys="friendships.receiver_id"
    )
class status(Enum):
    Pending=0
    Declined=1
    Accepted=2

class friendships(Base):
    __tablename__ ="friendships"
    
    sender_id: Mapped[int] =mapped_column(ForeignKey("users.id"),primary_key=True)
    receiver_id :Mapped[int] = mapped_column(ForeignKey("users.id"),primary_key=True)
    created_at :Mapped[Date] = mapped_column("created_at",Date,default=datetime.time())
    status: Mapped[Integer] = mapped_column("status",Integer,default=0)