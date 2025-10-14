from fastapi import APIRouter
from app.schemas.auth_schema import registerUserSchema, loginUserSchema, TokenResponse
from app.services import auth_service
from typing import List, Optional

router = APIRouter()
@router.get("/auth/dump")
async def dump_users():
    users = auth_service.get_all_users()
    return {"users": [user.username for user in users]}

@router.get("/auth/status")
async def auth_status():
    return {"status": "Authentication service is running"}

@router.post("/auth/register")
async def register(data: registerUserSchema) -> TokenResponse:
    # Registration logic here
    return auth_service.register_user(data.username, data.password)
@router.post("/auth/login")
async def login(data: loginUserSchema) -> TokenResponse:
    # Login logic here
    access_token = auth_service.authenticate_user(data.username, data.password)
    if not access_token:
        return {"error": "Invalid credentials"} 
    return TokenResponse(access_token=access_token, token_type="bearer")