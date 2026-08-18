from fastapi import APIRouter, Depends, HTTPException
from app.api.security import get_current_user_http
from app.db.init_db import get_db  # Your MySQL session logic
from sqlalchemy import text
from app.services.matchmaker import matchmaker_service

router = APIRouter(prefix="/lobby")
@router.get("/{lobby_id}")
async def get(
    lobby_id:str, current_user=Depends(get_current_user_http), db=Depends(get_db)
):
    if (lobby :=matchmaker_service.get_game(lobby_id))!=None:
        return {lobby}
    else:
        return {"message":"no lobby with this id"}
