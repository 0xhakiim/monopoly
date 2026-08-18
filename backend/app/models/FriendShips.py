
from sqlalchemy import ForeignKey, Integer, null,Date
from sqlalchemy.orm import DeclarativeBase, foreign, mapped_column, Mapped, relationship
from enum import Enum
import datetime
class Base(DeclarativeBase):
    pass
class status(Enum):
    Pending=0
    Declined=1
    Accepted=2

class friendships(Base):
    __tablename__ ="friendships"
    
    sender_id: Mapped[int] =mapped_column(ForeignKey("users.id"),primary_key=True)
    reciever_id :Mapped[int] = mapped_column(ForeignKey("users.id"),primary_key=True)
    created_at :Mapped[Date] = mapped_column("created_at",Date,default=datetime.time())
    status: Mapped[Integer] = mapped_column("status",Integer,default=0)