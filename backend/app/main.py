import fastapi
from app.api import routes_auth, matchmaking
from fastapi.middleware.cors import CORSMiddleware
import app.db.init_db as db_init
app = fastapi.FastAPI()
app.include_router(routes_auth.router)
app.include_router(matchmaking.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def root():
    return {"message": "Welcome to the Monopoly API"}