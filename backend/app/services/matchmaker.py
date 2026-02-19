import asyncio
from typing import List, Dict
from app.models.matchmaking import MatchGroup
from app.models.gamesManager import getsManager


class Matchmaker:
    def __init__(self):
        self.queue: List[MatchGroup] = []
        self.connections = {}

    def add_group(self, group: MatchGroup):
        self.queue.append(group)

    def remove_player(self, user_id: int):
        # Remove group if a player disconnects
        self.queue = [g for g in self.queue if user_id not in g.player_ids]
        self.connections.pop(user_id, None)

    async def check_and_start_matches(self):
        """
        Algorithm: Groups MatchGroups together until target_size is hit.
        """
        if not self.queue:
            return

        # Simple greedy match for the same target_size
        for target in [2, 3, 4]:
            eligible = [g for g in self.queue if g.target_size == target]

            current_batch = []
            count = 0

            for group in eligible:
                if count + group.size <= target:
                    current_batch.append(group)
                    count += group.size

                if count == target:
                    await self._trigger_game_start(current_batch)
                    # Clean up queue
                    for g in current_batch:
                        self.queue.remove(g)
                    break

    async def _trigger_game_start(self, groups: List[MatchGroup]):
        all_player_ids: list[int] = []

        for g in groups:

            all_player_ids.extend(g.player_ids)

        # DELEGATION: Let the GameManager handle the Monopoly logic
        manager = getsManager()
        game = manager.create_game(all_player_ids)
        # manager.save_game_to_redis(game)
        print(list(game.get_players().items()))
        # Notify everyone
        for p_id in all_player_ids:
            if p_id in self.connections:
                await self.connections[p_id].send_json(
                    {
                        "action": "match_found",
                        "game_id": str(game.id),
                        "players": list(game.get_players().items()),
                    }
                )


# Global Instance
matchmaker_service = Matchmaker()
