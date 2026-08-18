from fastapi import APIRouter,Depends,HTTPException,WebSocket,WebSocketDisconnect
from app.api.security import get_current_user_http, get_current_user_ws 
from app.services.matchmaker import matchmaker_service
from app.services.freinds_service import get_friends
router = APIRouter(prefix="/friends")


@router.websocket("/ws")
async def handle_friends(ws:WebSocket,user_id:int=Depends(get_current_user_ws)):
    await ws.accept()
    data = await ws.receive_json()
    action = data.get("action")
    #invite to lobby
    if action == "invite_friend":
        try:
            friend_id = data.get("user_id")
            matchmaker_service.invite(user_id,friend_id)
        except :
            print("error inviting friend")
@router.get("/all")
async def all_friends(user_id:int=Depends(get_current_user_http)):
    print(f"finding friends for {user_id}")
    if friends :=get_friends(user_id)!= None:
        return friends
    else:
        return {"message":"no friends for corrasponding user id"}


    