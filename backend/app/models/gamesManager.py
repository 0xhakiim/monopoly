import redis
import json
from uuid import UUID, uuid4
from app.models.Game import Game
from typing import List, Optional


class gamesManager:
    def __init__(self):
        self.games = {}
        # decode_responses=True makes life easier with strings
        self.r = redis.Redis(host="172.22.28.208", port=6379, decode_responses=True)

    def create_game(self, player_ids: List[int]):
        """Used by Matchmaking."""
        game_id = uuid4()
        game = Game.from_matchmaking(game_id, player_ids)
        self.games[game_id] = game
        return game

    def get_game(self, uuid_str: str) -> Game:
        uid = UUID(uuid_str)
        print(self.games)
        print(uid)
        # 1. Check local memory first
        if uid in self.games:
            print("Found in memory...")
            return self.games[uid]

        # 2. If not in memory, try to "rehydrate" from Redis
        print("Trying to restore from Redis...")
        stored_state = self.r.get(f"game_state:{uuid_str}")
        if stored_state:
            data = json.loads(stored_state)
            # Create a new Game object and restore its state
            # Note: You'll need to pass the saved players/state to your __init__
            game = Game.from_redis(uid, data)
            self.games[uid] = game
            return game

        return None

    def save_game_to_redis(self, game: Game):
        """Serializes the game logic state to Redis."""
        data = {
            "state": game.state,
            "players_list": list(game.get_players().values()),
            "turn_order": game.turn_order,
            "turn": json.dumps(game.turn, default=str),
        }
        self.r.set(f"game_state:{game.id}", json.dumps(data, default=str))


_instance = None


def getsManager() -> gamesManager:
    global _instance
    if _instance is None:
        _instance = gamesManager()
    return _instance
