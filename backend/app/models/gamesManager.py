from app.models.Game import Game
from uuid import uuid4
class gamesManager():
    games = {}
    
    def create_game(self, players):
        id = uuid4()
        game = Game(id, players)
        self.games[id] = game
        return game
    
    def get_game(self, id):
        return self.games.get(id, None)

__games_manager : gamesManager | None = None
def getsManager() -> gamesManager:
    global __games_manager
    if __games_manager is None:
        __games_manager = gamesManager()
    return __games_manager