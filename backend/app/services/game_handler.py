from app.models.Game import Game
from app.models.gamesManager import gamesManager


class gameHandler:
    def __init__(self):
        self.game_manager = gamesManager()

    def create_game(self, players):
        return self.game_manager.create_game(players)

    def get_game(self, game_id):
        return self.game_manager.get_game(game_id)
