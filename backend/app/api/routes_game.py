from dis import Positions
from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
    Depends,
)
from typing import List, Dict
from app.game.schemas import WSMessage
from app.models.board import Square, get_board
from app.models.Game import Game
from app.models.gamesManager import gamesManager, getsManager
from app.api.security import get_current_user_ws

STATIC_BOARD_TILES: Dict[int, Square] = get_board().tiles


router = APIRouter()
queue = []
connections = {}


@router.websocket("/ws/game/{uuid}")
async def game_endpoint(
    ws: WebSocket, uuid: str, player_id: int = Depends(get_current_user_ws)
):
    await ws.accept()
    game_manager = getsManager()
    game: Game = game_manager.get_game(uuid)

    if not game:
        await ws.send_json({"type": "error", "message": "Game not found"})
        await ws.close()
        return

    # Helper function to get the current snapshot of the game
    def get_game_snapshot(event_type: str, extra_data: dict = None):
        players_list = list(game.get_players().items())
        type = ""
        if event_type in (
            "game_start",
            "reset_game",
            "game_update",
            "property_bought",
            "auction_started",
            "end_turn",
        ):
            type = "game_state"
        snapshot = {
            "type": type,
            "state": {
                "action": event_type,
                "turn_index": game.state["turn_index"],
                "positions": [p.position for p in game.players_map.values()],
                "money": [p.money for p in game.players_map.values()],
                "board": game.state["mutable_properties"],
                "players": players_list,
                "phase": game.state["phase"],
            },
        }
        if extra_data:
            snapshot["state"].update(extra_data)
        return snapshot

    try:
        # Register connection
        game.connections[player_id] = ws

        # Initial Join Broadcast
        await game.broadcast(get_game_snapshot("game_start"))

        while True:
            data_raw = await ws.receive_json()
            data = WSMessage(**data_raw)
            current_player = game.players_map.get(player_id)

            # 1. Validation: Is it the player's turn?
            # (Only validate for actions that require a turn)
            is_turn = game.state["turn_index"] == current_player.id
            if (
                data.action in ["roll_dice", "buy_property", "pass_on_buy", "end_turn"]
                and not is_turn
            ):
                await ws.send_json({"type": "error", "message": "Not your turn!"})
                continue

            # 2. Action Logic
            if data.action == "reset_game":
                game.reset_game()
                await game.broadcast(get_game_snapshot("reset_game"))

            elif data.action == "roll_dice":
                print("Rolling dice")
                dice_result = game.roll_dice(player_id)

                # Check if we landed on a property to trigger the BUY phase
                extra = {
                    "action": "dice_rolled",
                    "dice": dice_result,
                    "new_position": current_player.position,
                }

                # If game logic moved phase to DECIDE_TO_BUY, include property info
                if game.state["phase"] == "DECIDE_TO_BUY":
                    prop = STATIC_BOARD_TILES[current_player.position]
                    extra["propertyForSale"] = prop.model_dump()
                await game.broadcast(get_game_snapshot("game_update", extra))

            elif (
                data.action == "buy_property" and game.state["phase"] == "DECIDE_TO_BUY"
            ):
                print("Buying property")
                game.buy_property(player_id, current_player.position)
                await game.broadcast(get_game_snapshot("property_bought"))

            elif (
                data.action == "pass_on_buy" and game.state["phase"] == "DECIDE_TO_BUY"
            ):
                print("Passing on buying property: ", game.state["turn_index"])
                game.state["phase"] = "AUCTION_PROPERTY"
                game.start_auction(current_player.position)
                await game.broadcast(get_game_snapshot("auction_started"))

            elif data.action == "end_turn":
                print("Ending turn")
                game.next_turn()
                await game.broadcast(get_game_snapshot("end_turn"))

    except WebSocketDisconnect:
        print(f"Player {player_id} disconnected from {uuid}")
        if player_id in game.connections:
            del game.connections[player_id]

    except Exception as e:
        print(f"Error: {e}")
        await ws.send_json({"type": "error", "message": "Internal server error"})
        await ws.close()
