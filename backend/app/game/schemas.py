from pydantic import BaseModel
from typing import List, Optional


class WSMessage(BaseModel):
    action: str
    payload: Optional[dict] = None


class DiceResult(BaseModel):
    dice: List[int]
    new_position: int


class GameState(BaseModel):
    game_id: str
    players: List[str]
    turn_index: int
    positions: dict
    balances: dict
