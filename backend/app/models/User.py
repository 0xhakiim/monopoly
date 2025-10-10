from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped
from sqlalchemy import String, Integer, Boolean, ForeignKey
from typing import List, Optional
class Base(DeclarativeBase):
    pass
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False,unique=True)
    password: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=True)
    token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    








class Playerr:
    def __init__(self, name, piece):
        self.name = name
        self.piece = piece
        self.position = 0
        self.money = 1500
        self.properties = []
        self.in_jail = False
        self.jail_turns = 0
        self.get_out_of_jail_free_cards = 0
    def move(self, steps):
        self.position = (self.position + steps) % 40
        
    def pay(self, amount):
        self.money -= amount
    def receive(self, amount):
        self.money += amount
    def buy_property(self, property):
        if property.owner:
            self.money -= property.rent
            property.owner.receive(property.rent)
            return True
        if self.money >= property.price:
            self.pay(property.price)
            self.properties.append(property)
            property.owner = self
            return True
        self.money =0
        return False
    