from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
from app.game.schemas import WSMessage
from app.models.Game import Game
from app.models.gamesManager import gamesManager, getsManager

router = APIRouter()
queue = []
connections = {}


@router.websocket("/ws/game/{uuid}")
async def game_endpoint(ws: WebSocket, uuid: str, player_id: int):
    await ws.accept()
    game_manager = getsManager()
    print(f"Fetching game with UUID: {uuid}")
    game: Game = game_manager.get_game(uuid)
    if not game:
        await ws.send_text("Game not found")
        await ws.close()
        return
    try:
        game.connections[player_id] = ws
        while True:
            data = await ws.receive_json()
            # Handle game actions here
            data = WSMessage(**data)
            if data.action == "roll_dice":
                print("recieved dice roll")
                result = game.roll_dice()
                game.set_player_position(player_id, (result[0] + result[1]) % 40)
                update_data = {
                    "type": "game_update",
                    "player_id": player_id,
                    "action": "dice_rolled",
                    "dice": result,
                    "new_position": game.get_player_position(player_id),
                }

                # 3. Broadcast the update to ALL connected players
                print(update_data)
                await game.broadcast(update_data)
            await ws.send_text(f"Received action: {data.action} in game {uuid}")
    except WebSocketDisconnect:
        print(f"Client disconnected from game {uuid}")
