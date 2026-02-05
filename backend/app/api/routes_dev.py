from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.gamesManager import gamesManager, getsManager
from app.models.Game import Game
from typing import Optional, Any

router = APIRouter(prefix="/dev")


class DevUpdate(BaseModel):
    target: str  # "player" or "game"
    player_id: Optional[int] = None
    field: Optional[str] = None  # e.g., "money", "position", "phase"
    value: Any  # The new value


@router.post("/{game_id}/update")
async def manual_update(game_id: str, data: DevUpdate):
    manager: gamesManager = getsManager()
    game: Game = manager.get_game(game_id)

    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    print(f"Dev Update Requested: {data}")
    # 1. Update logic
    if data.target == "add_property":
        player = game.players_map.get(game.players.get(data.player_id))
        property_id = int(data.value)  # The Square index (0-39)

        # 1. Update Player's internal list if you track it there
        if property_id not in player.properties:
            player.properties.append(property_id)

        # 2. Update the Board State in Game.state
        # This ensures the UI renders the correct owner color
        if "mutable_properties" not in game.state:
            game.state["mutable_properties"] = {}

        game.state["mutable_properties"][property_id] = {
            "owner_id": player.id,
            "houses": 0,
            "hotel": False,
        }
    elif data.target == "player":
        player = game.players_map.get(game.players.get(data.player_id))
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        setattr(player, data.field, data.value)

    elif data.target == "game":
        game.state[data.field] = data.value

    # 2. Persist change to Redis (if you implemented Redis)
    manager.save_game_to_redis(game)

    # 3. CRITICAL: Trigger a broadcast so the frontend updates immediately
    await game.broadcast(
        {
            "type": "DEV_UPDATE",
            "message": f"Dev changed {data.field} to {data.value}",
            "state": {
                **game.state,
                "players": list(game.get_players().values()),
                "turn": game.turn.player_id,
            },
        }
    )

    return {"status": "success"}
