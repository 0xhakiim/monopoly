from pydantic import BaseModel, Field, root_validator
from typing import List, Optional


class Player(BaseModel):
    """
    Represents the mutable state of a single player in the Monopoly game.
    """

    user_id: Optional[int] = Field(
        None, description="The user ID associated with this player."
    )
    id: int = Field(..., description="Unique ID for the player.")
    money: int = Field(1500, description="Current cash balance, starting at $1500.")
    position: int = Field(0, ge=0, le=39, description="Current board position (0-39).")
    properties: List[int] = Field([], description="List of board IDs the player owns.")
    name: str = Field(f"Player{id}", description="player name")
    # Jail state management
    in_jail: bool = Field(False, description="True if the player is currently in jail.")
    jail_turns: int = Field(0, description="Number of turns spent in jail (max 3).")
    get_out_of_jail_free: int = Field(
        0, description="Count of 'Get Out of Jail Free' cards."
    )

    # Status flags
    is_bankrupt: bool = Field(
        False, description="True if the player is out of the game."
    )

    @root_validator(pre=True)
    def set_default_name(cls, values):
        if "name" not in values or values["name"] is None:
            values["name"] = f"Player{values['id']}"
        return values
