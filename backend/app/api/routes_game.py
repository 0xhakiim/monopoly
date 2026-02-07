from dis import Positions
from annotated_types import T
from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
    Depends,
)
from typing import List, Dict
from app.schemas.game_schemas import WSMessage
from app.models.Player import Player
from app.models.board import Square, get_board
from app.models.Game import Game, Turn
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
    print(f"Player {player_id} connected to game {uuid}")
    game_manager = getsManager()
    game: Game = game_manager.get_game(uuid)

    if not game:
        await ws.send_json({"type": "error", "message": "Game not found"})
        await ws.close()
        return
    await ws.send_json(
        {
            "type": "reconnect",
            "state": {**game.state, "players": list(game.get_players().values())},
        },
    )

    # Helper function to get the current snapshot of the game
    def get_game_snapshot(event_type: str, extra_data: dict = {}) -> dict:
        players_list = list(game.get_players().values())
        print(players_list)
        snapshot = {
            "type": event_type,
            "state": {
                **game.state,
                "players": players_list,
                "turn": game.turn.player_id,
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
            if not current_player:
                await ws.send_json({"type": "error", "message": "Player not in game!"})
                continue
            if data.action == "mortgage_property":
                square_id = data.payload.get("square_id")
                await game.mortgage_property(player_id, square_id)
                await game.broadcast(get_game_snapshot("property_mortgaged"))
                continue
            if data.action == "CHAT":
                message_data = data.payload
                # Broadcast this message to all connected clients in the same game room
                await game.broadcast({"type": "chat_message", "data": message_data})
            # 1. Validation: Is it the player's turn?
            # (Only validate for actions that require a turn)
            is_turn = game.state["turn_index"] == current_player.id
            if (
                data.action in ["roll_dice", "buy_property", "pass_on_buy"]
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
                dice_result = await game.roll_dice(player_id)

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
                await game.buy_property(player_id, current_player.position)
                await game.broadcast(get_game_snapshot("property_bought"))

            # auction start
            elif (
                data.action == "pass_on_buy" and game.state["phase"] == "DECIDE_TO_BUY"
            ):
                print("Passing on buying property: ", game.state["turn_index"])
                game.state["phase"] = "AUCTION_PROPERTY"
                await game.start_auction(current_player.position, player_id)
            elif data.action == "jail_action":
                action_type = data.payload.get("action", "")
                print(f"Player {player_id} performing jail action: {action_type}")
                await game.jail_decision(player_id, action_type)
                await game.broadcast(get_game_snapshot("game_update"))
            elif data.action == "build_house":
                property_id = data.payload.get("square_id", -1)
                print(f"Player {player_id} building on property: {property_id}")
                await game.build_house(player_id, property_id)
                await game.broadcast(get_game_snapshot("house_built"))
            if game.state["phase"] == "AUCTION":
                if data.action == "place_bid":
                    print("bidding !!!!!!!!!!!", game.state)

                    print(f"Player {player_id} placing bid")
                    bid_amount = data.payload.get("amount", 0)
                    print(f"Bid amount: {bid_amount}")
                    await game.place_bid(player_id, bid_amount)
                elif data.action == "fold_auction":
                    print(f"Player {player_id} folding from auction")
                    await game.fold_auction(player_id)
            if game.state["phase"] == "WAIT_FOR_NEXT_TURN":
                if game.turn.active == False:
                    print(f"Player {player_id} ending turn")
                    game.end_turn()
                    await game.broadcast(get_game_snapshot("end_turn"))
                else:
                    game.state["phase"] = "WAIT_FOR_ROLL"

                    await game.broadcast(get_game_snapshot("roll_dice"))
    except WebSocketDisconnect:
        print(f"Player {player_id} disconnected from {uuid}")
        if player_id in game.connections:
            del game.connections[player_id]
