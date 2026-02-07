from pydantic import BaseModel
from typing import List, Optional


class WSMessage(BaseModel):
    action: str
    payload: Optional[dict] = None


class Auction(BaseModel):
    property_id: int
    highest_bid: int
    highest_bidder: Optional[str] = None
    is_active: bool = True


class PlayerState(BaseModel):
    player_id: int
    name: str
    position: int
    money: int
    properties: List[int]
    in_jail: bool = False


class GameState(BaseModel):
    players: List[PlayerState]
    positions: dict
    balances: dict
    turn: int
    auction: Optional[Auction] = None
