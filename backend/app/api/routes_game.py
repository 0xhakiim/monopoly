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
    print(game_manager.list_games())
    game = game_manager.get_game(uuid)
    if not game:
        await ws.send_text("Game not found")
        await ws.close()
        return
    try:
        game.connections[player_id] = ws
        while True:
            data = await ws.receive_text()
            # Handle game actions here
            await ws.send_text(f"Received action: {data} in game {uuid}")
    except WebSocketDisconnect:
        print(f"Client disconnected from game {uuid}")


@router.get("/game/{uuid}/state")
async def get_game_state(uuid: str):
    game_manager = gamesManager()
    game = game_manager.get_game(uuid)
    if not game:
        return {"error": "Game not found"}
    return {"state": game.get_state()}


@router.websocket("/ws/game/{uuid}/action")
async def post_game_action(ws: WebSocket, uuid: str):
    await ws.accept()
    game_manager = gamesManager()
    game = game_manager.get_game(uuid)

    if not game:
        await ws.send_text("Game not found")
        await ws.close()
        return
    try:
        while True:
            data = await ws.receive_json()
            # Handle game actions here
            data = WSMessage(**data)
            if data.action == "roll_dice":
                result = game.roll_dice()
                await ws.send_json({"dice": result, "new_position": result})

            await ws.send_text(f"Received action: {data.action} in game {uuid}")

    except WebSocketDisconnect:
        print(f"Client disconnected from game {uuid}")
