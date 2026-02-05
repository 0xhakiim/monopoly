from typing import List, Optional
from app.models.Game import Game
from uuid import UUID, uuid4


class gamesManager:
    games = {}

    def create_game(self, players) -> Optional[Game]:
        id = uuid4()
        game = Game(id, players)
        self.games[id] = game
        return game

    def get_game(self, id):
        return self.games[UUID(id)] if UUID(id) in self.games else "not found"

    def remove_game(self, id):
        if id in self.games:
            del self.games[UUID(id)]

    def list_games(self) -> List[Game]:
        return list(self.games.values())


__games_manager: gamesManager | None = None


def getsManager() -> gamesManager:
    global __games_manager
    if __games_manager is None:
        __games_manager = gamesManager()
    return __games_manager
