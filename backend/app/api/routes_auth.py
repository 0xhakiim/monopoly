from fastapi import APIRouter
from app.schemas.auth_schema import registerUserSchema, loginUserSchema, TokenResponse
from app.services import auth_service
from typing import List, Optional

router = APIRouter()


@router.get("/auth/status")
async def auth_status():
    return {"status": "Authentication service is running"}


@router.post("/auth/register")
async def register(data: registerUserSchema) -> TokenResponse:
    # Registration logic here
    user = auth_service.register_user(data.username, data.password)
    if user == 0:
        return TokenResponse(
            access_token="",
            token_type="",
        )
    token = TokenResponse(
        access_token=user["access_token"], token_type=user["token_type"]
    )
    print(token)
    return token


@router.post("/auth/login")
async def login(data: loginUserSchema) -> TokenResponse:
    # Login logic here
    access_token = auth_service.authenticate_user(data.username, data.password)
    if not access_token:
        return TokenResponse(
            access_token="",
            token_type="",
        )
    return TokenResponse(access_token=access_token, token_type="bearer")


@router.post("/auth/change_password")
async def change_password(username: str, old_password: str, new_password: str):
    result = auth_service.change_password(username, old_password, new_password)
    if result:
        return {"message": "Password changed successfully"}
    else:
        return {"message": "Failed to change password"}
