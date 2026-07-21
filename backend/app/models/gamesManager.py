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
        if uid in self.games:
            return self.games[uid]

        stored_state = self.r.get(f"game_state:{uuid_str}")
        if stored_state:
            data = json.loads(stored_state)
            game = Game.from_redis(uid, data)
            game.set_persist_callback(self.save_game_to_redis)
            self.games[uid] = game
            return game

        return None

        

    def save_game_to_redis(self, game: Game):
        """Serializes the game logic state to Redis."""
        data = {
        "state": game.state,
        "players_list": list(game.get_players().values()),
        "turn_order": game.turn_order,
        "turn": game.turn.to_dict(),
        }
        self.r.set(f"game_state:{game.id}", json.dumps(data, default=str))


_instance = None


def getsManager() -> gamesManager:
    global _instance
    if _instance is None:
        _instance = gamesManager()
    return _instance
