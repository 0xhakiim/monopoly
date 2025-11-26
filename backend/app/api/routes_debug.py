from fastapi import APIRouter
from app.models.gamesManager import getsManager
from app.services import auth_service
from app.models.Game import Game

router = APIRouter()


@router.get("/debug/all_games")
async def get_all_games():
    game_manager = getsManager()
    return {"games": list(game_manager.games.keys())}


@router.get("/auth/dump")
async def dump_users():
    users = auth_service.get_all_users()
    return {"users": [user.username for user in users]}


@router.get("/game/{uuid}/state")
async def get_game_state(uuid: str):
    game_manager = getsManager()
    game: Game = game_manager.get_game(str(uuid))
    return game.state
