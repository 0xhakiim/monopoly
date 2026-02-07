import json
from operator import ge
import re
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List, Optional
from app.models.Game import Game
from app.models.gamesManager import gamesManager, getsManager
from app.api.security import get_current_user_http, get_current_user_ws
from app.models.RedisGameStore import RedisGameStore

router = APIRouter()
queue: List[int] = []
connections: Dict[int, WebSocket] = {}


@router.websocket("/ws/matchmaking")
async def join_queue(ws: WebSocket, user_id: int = Depends(get_current_user_ws)):
    global queue, connections
    await ws.accept()
    try:
        while True:
            data = await ws.receive_json()
            if data.get("action") == "join":
                print(data)
                print(connections)
                if user_id not in connections:
                    queue.append(user_id)
                    connections[user_id] = ws
                    await ws.send_json(
                        {"message": f"Player {user_id} joined the queue"}
                    )
                else:
                    await ws.send_json(
                        {"error": f"Player {user_id} is already in the queue"}
                    )
            elif data.get("action") == "leave":
                if user_id in queue:
                    queue.remove(user_id)
                    await ws.send_json({"message": f"Player {user_id} left the queue"})
                else:
                    await ws.send_json(
                        {"error": f"Player {user_id} is not in the queue"}
                    )
            else:
                print("Invalid command received:", data)
                await ws.send_json(
                    {
                        "error": "Invalid command. Use 'join:<user_id>' or 'leave:<user_id>'"
                    }
                )
            print(queue)
            # Check if we can start a game
            if len(queue) >= 2:
                print("Starting a game...")
                player1 = queue.pop(0)
                player2 = queue.pop(0)
                await connections[player1].send_json(
                    {"message": f"Game created with players {player1} and {player2}."}
                )
                await connections[player2].send_json(
                    {"message": f"Game created with players {player1} and {player2}."}
                )
                game_manager = getsManager()
                game: Game = game_manager.create_game([player1, player2])

                if game:
                    print(game.get_players().items())
                    await connections[player1].send_json(
                        {
                            "action": "match_found",
                            "game_id": str(game.id),
                            "players": list(game.get_players().items()),
                        }
                    )
                    await connections[player2].send_json(
                        {
                            "action": "match_found",
                            "game_id": str(game.id),
                            "players": list(game.get_players().items()),
                        }
                    )
                    game_manager.save_game_to_redis(game)
                    return game.id
                else:
                    await connections[player1].send_json(
                        {"error": "Failed to create game."}
                    )
                    await connections[player2].send_json(
                        {"error": "Failed to create game."}
                    )
                    print("Failed to create game.")
                    return 0
    except WebSocketDisconnect:
        if user_id in queue:
            queue.remove(user_id)
            connections.pop(user_id, None)
