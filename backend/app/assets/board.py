# app/data/board_data.py
from typing import Final, Dict
from app.models.board import Square, get_board

# Assuming load_monopoly_board is imported/defined here

# Load once when the server starts
MONOPOLY_BOARD_SCHEMA: Final[Dict[int, Square]] = get_board().tiles
