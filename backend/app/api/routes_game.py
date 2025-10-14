from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
from app.models.Game import Game
from app.models.gamesManager import gamesManager

router = APIRouter()
queue =[]
connections = {}
@router.websocket("/ws/game/{uuid}")
async def game_endpoint(ws: WebSocket, uuid: str):
    await ws.accept()
    game_manager = gamesManager()
    game = game_manager.get_game(uuid)
    if not game:
        await ws.send_text("Game not found")
        await ws.close()
        return
    try:
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
@router.post("/game/{uuid}/action")
async def post_game_action(uuid: str, action: str):
    game_manager = gamesManager()
    game = game_manager.get_game(uuid)
    if not game:
        return {"error": "Game not found"}
    # Process the action here
    return {"message": f"Action {action} processed for game {uuid}"}