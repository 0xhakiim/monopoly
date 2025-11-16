import fastapi
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.api import routes_auth, matchmaking, routes_game, routes_debug
from app.models.gamesManager import getsManager
from contextlib import asynccontextmanager
import app.db.init_db as db_init
from app.models.board import get_board


@asynccontextmanager
async def lifespan(app: fastapi.FastAPI):
    engine = create_engine(
        "mysql+pymysql://root@localhost/monopoly", pool_pre_ping=True
    )
    SessionLocal = sessionmaker(bind=engine)
    gamesManager = getsManager()
    print("Database initialized")
    board = get_board()
    print(f"Board initialized with {len(board.tiles)} tiles")
    app.state.board = board
    app.state.manager = gamesManager
    app.state.db_session = SessionLocal
    yield
    print("Shutting down...")


app = fastapi.FastAPI(lifespan=lifespan)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(routes_auth.router)
app.include_router(matchmaking.router)
app.include_router(routes_game.router)
app.include_router(routes_debug.router)


@app.get("/")
async def root():
    return {"message": "Welcome to the Monopoly API"}
