import time
from uuid import uuid4
from typing import List, Set


class MatchGroup:
    def __init__(self, player_ids: List[int], target_size: int = 4):
        self.id = str(uuid4())
        self.player_ids = player_ids  # Can be 1 player or a group of friends
        self.target_size = target_size
        self.created_at = time.time()

    @property
    def size(self):
        return len(self.player_ids)
