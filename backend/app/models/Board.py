from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator, ValidationInfo
import json
from pathlib import Path


# --- 1. Pydantic Models for State ---
class BuildInfo(BaseModel):
    can_build: bool
    house_cost: Optional[int] = None
    houses: int


# Defines the specific data for property squares (non-Go, non-Tax, non-Chance/CC)
class PropertyDetails(BaseModel):
    """Static details for purchasable squares (Property, Railroad, Utility)."""

    price: int = Field(..., gt=0)
    # rent list must have 6 items: [unimproved, 1h, 2h, 3h, 4h, hotel]
    rent: List[int] = Field(..., min_items=6, max_items=6)
    house_cost: int
    group_id: str  # e.g., 'Brown', 'Railroad'


class Square(BaseModel):
    """Represents a single square on the board, including static data."""

    id: int = Field(..., ge=0, le=39)  # Position 0-39
    name: str
    type: str = Field(
        ...,
        pattern=r"^(Go|Property|Railroad|Utility|Tax|CommunityChest|Chance|Jail|FreeParking|GoToJail)$",
    )

    # Static data (only present for certain types)
    details: Optional[PropertyDetails] = None
    tax_amount: Optional[int] = None  # Used for Tax spaces

    @field_validator("details", mode="after")
    @classmethod
    def validate_details_for_type(
        cls, v: Optional[PropertyDetails], info: ValidationInfo
    ):
        """Ensures 'details' is present only for purchasable types, using Pydantic V2 syntax."""
        # Use info.data to access the raw input data, including the 'type' field for cross-field validation
        square_type = info.data.get("type")
        is_purchasable = square_type in ["Property", "Railroad", "Utility"]

        if is_purchasable and v is None:
            raise ValueError(f"Square of type '{square_type}' must have 'details'.")
        if not is_purchasable and v is not None:
            raise ValueError(f"Square of type '{square_type}' cannot have 'details'.")
        return v


class Board(BaseModel):
    """The complete static board schema."""

    tiles: Dict[int, Square]  # Keyed by position (0 to 39)

    @field_validator("tiles", mode="after")
    @classmethod
    def validate_board_size(cls, v: Dict[int, Square]):
        """Ensure the board has exactly 40 tiles, using Pydantic V2 syntax."""
        if len(v) != 40:
            raise ValueError(
                f"Board must contain exactly 40 tiles, but found {len(v)}."
            )
        return v


def get_board() -> Board:
    """
    Loads the Monopoly board configuration from JSON, validates it using Pydantic,
    and returns a structured Board object.
    """
    # Use Pathlib to find the configuration file relative to this script
    current_dir = Path(__file__).parent
    # Assuming board_config.json is in the sibling directory 'app/data'
    config_path = current_dir.parent / "assets" / "board_config.json"

    if not config_path.exists():
        # Raise an exception if the critical configuration is missing
        raise FileNotFoundError(
            f"Monopoly board configuration file not found at: {config_path}"
        )

    print(f"Loading board schema from: {config_path}")

    try:
        with open(config_path, "r") as f:
            raw_data = json.load(f)

        # Pydantic validation: Ensure all keys are integers (positions 0-39)
        # and wrap the raw dict under the 'tiles' key for the Board model
        # which will in turn validate every nested Square and PropertyDetails.
        validated_board = Board(tiles={int(k): v for k, v in raw_data.items()})

        # After validation, we can safely access the structured tiles
        return validated_board

    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to decode board configuration JSON: {e}")
    except Exception as e:
        raise RuntimeError(f"An error occurred during board loading or validation: {e}")
