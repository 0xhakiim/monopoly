from uuid import uuid4

import fastapi
from enum import Enum

class LobbyState(Enum):
    WAITING = 1
    READY = 2
    STARTING = 3
    IN_GAME = 4
    FINISHED = 5
class Lobby:
    def __init__(self,player_ids: list[int], target_size: int = 2):
        self.lobby_id = str(uuid4())
        self.players = [player_id for player_id in player_ids]  # List of player IDs
        self.max_players = 4
        self.state = LobbyState.WAITING
        self.game_id = None  # Will be set when the game starts
        self.target_size = target_size  # Default target size, can be set when creating the lobby
    def add_player(self, player):
        if len(self.players) < self.max_players:
            self.players.append(player)
            if len(self.players) == self.max_players:
                self.state = LobbyState.READY
        else:
            raise Exception("Lobby is full")
    def remove_player(self, player):
        self.players.remove(player)
        if len(self.players) < self.max_players:
            self.state = LobbyState.WAITING
    def start_game(self):
        if self.state == LobbyState.READY:
            self.state = LobbyState.STARTING
            # Logic to initialize the game and set game_id
            # self.game_id = ...
            self.state = LobbyState.IN_GAME
        else:
            raise Exception("Lobby is not ready to start the game")