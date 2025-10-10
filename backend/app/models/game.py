import random
from typing import List

class game:
    def __init__(self, name,players:List[int]):
        self.players = players
        self.name = name
        self.id = random.randint(1000, 9999)
        self.state = {"turn": 0, "board": {}, "players": players}
        self.turn = 0
    def get_id(self):
        return self.id
    def start(self):
        return f"Game {self.name} has started"
    def end(self):
        return f"Game {self.name} has ended"
    def roll_dice(self):
        return random.randint(1, 6) + random.randint(1, 6)
    def get_players(self):
        return self.players
    def next_turn(self):
        self.state = (self.turn + 1) % len(self.players)
        return self.players[self.turn]
    def play_turn(self):
        current_player = self.players[self.turn]
        roll = self.roll_dice()
        return f"Player {current_player} rolled a {roll}"
    