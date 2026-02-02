from fastapi import (
    WebSocket,
    WebSocketDisconnect,
    Depends,
    Query,
    status,
    HTTPException,
)
from fastapi.security import OAuth2PasswordBearer
from app.config import SECRET_KEY, ALGORITHM
import jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_user_http(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
            )
        print(user_id)
        return user_id  # Returns the authenticated player's ID
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


async def get_current_user_ws(websocket: WebSocket, token: str = Query(...)):
    try:
        # 1. Decode and Validate the JWT token from the query parameter
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise Exception("Token payload missing user_id")
        return user_id  # Returns the authenticated user's ID
    except Exception:
        # 2. If validation fails, close the socket immediately BEFORE accepting
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION, reason="Invalid authentication token"
        )
        # Raising an exception here will prevent the function body from running
        raise WebSocketDisconnect(code=status.WS_1008_POLICY_VIOLATION)
