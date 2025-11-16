import re
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Optional
from app.models.Game import Game
from app.models.gamesManager import gamesManager

router = APIRouter()
queue = []
connections = {}


@router.websocket("/ws/matchmaking")
async def join_queue(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            if data.startswith("join:"):
                player_id = int(data.split(":")[1])
                if player_id not in connections:
                    queue.append(player_id)
                    connections[player_id] = ws
                    await ws.send_text(f"Player {player_id} joined the queue")
                else:
                    await ws.send_text(f"Player {player_id} is already in the queue")
            elif data.startswith("leave:"):
                player_id = int(data.split(":")[1])
                if player_id in queue:
                    queue.remove(player_id)
                    await ws.send_text(f"Player {player_id} left the queue")
                else:
                    await ws.send_text(f"Player {player_id} is not in the queue")
            else:
                await ws.send_text(
                    "Invalid command. Use 'join:<player_id>' or 'leave:<player_id>'"
                )
            # Check if we can start a game
            if len(queue) >= 2:
                player1 = queue.pop(0)
                player2 = queue.pop(0)
                await connections[player1].send_text(
                    f"Game created with players {player1} and {player2}."
                )
                await connections[player2].send_text(
                    f"Game created with players {player1} and {player2}."
                )
                game_manager = gamesManager()
                game = game_manager.create_game([player1, player2])
                if game:
                    await connections[player1].send_text(f"Game ID: {game.id}")
                    await connections[player2].send_text(f"Game ID: {game.id}")
                    return game.id
                else:
                    await connections[player1].send_text("Failed to create game.")
                    await connections[player2].send_text("Failed to create game.")
                    return 0
    except WebSocketDisconnect:
        if player_id in queue:
            queue.remove(player_id)
            connections.pop(player_id, None)
