import random
from typing import List
from app.models.board import get_board


class Game:
    def __init__(self, id, players: List[int]):
        self.id = id
        self.players = players
        self.state = {"turn": 0, "board": {}, "players": players}
        self.turn = 0
        self.connections = {}
        print(f"Game created with ID: {self.id} and players: {self.players}")

    def get_id(self):
        return self.id

    def end(self):
        return f"Game {self.id} has ended"

    def roll_dice(self):
        new_pos = (random.randint(1, 6) + random.randint(1, 6)) % 40
        self.handle_position(self.players[self.turn], new_pos)
        return new_pos

    def get_players(self):
        return self.players

    def next_turn(self):
        self.state = (self.turn + 1) % len(self.players)
        return self.players[self.turn]

    def play_turn(self):
        current_player = self.players[self.turn]
        roll = self.roll_dice()
        return f"Player {current_player} rolled a {roll}"

    def get_state(self):
        return self.state

    def handle_position(self, player_id, posistion):

        return f"Player {player_id} performed action: {posistion}"

    async def broadcast(self, message: dict):
        for ws in self.connections.values():
            await ws.send_json(message)

    async def send_to(self, player_id: str, message: dict):
        if ws := self.connections.get(player_id):
            await ws.send_json(message)
