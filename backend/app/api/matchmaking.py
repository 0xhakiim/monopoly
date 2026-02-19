from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.services.matchmaker import matchmaker_service
from app.models.matchmaking import MatchGroup
from app.api.security import get_current_user_ws

router = APIRouter()


@router.websocket("/ws/matchmaking")
async def matchmaking_endpoint(
    ws: WebSocket, user_id: int = Depends(get_current_user_ws)
):
    await ws.accept()
    matchmaker_service.connections[user_id] = ws

    try:
        while True:
            data = await ws.receive_json()
            action = data.get("action")

            if action == "join":
                # Structured: Create a group (even for 1 person)
                friends = data.get("friends", [])  # List of IDs
                target = data.get("game_size", 2)

                new_group = MatchGroup([user_id] + friends, target_size=target)
                matchmaker_service.add_group(new_group)

                await ws.send_json({"status": "queued", "group_id": new_group.id})

                # Run the algorithmic check
                await matchmaker_service.check_and_start_matches()

            elif action == "leave":
                matchmaker_service.remove_player(user_id)
                await ws.send_json({"status": "left"})

    except WebSocketDisconnect:
        matchmaker_service.remove_player(user_id)
