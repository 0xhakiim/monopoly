import json
from uuid import UUID, uuid4
from app.models.Game import Game
from redis.asyncio import Redis

redis: Redis | None = None


async def get_redis() -> Redis:
    global redis
    if redis is None:
        redis = Redis(host="172.22.28.208", port=6379, decode_responses=True)
    return redis


class RedisGameStore:
    async def create_game(self, players) -> UUID:
        redis = await get_redis()
        game_id = uuid4()
        game = Game(game_id, players)

        async with redis.pipeline() as pipe:
            pipe.set(f"game:{game_id}:state", json.dumps(game.state))
            pipe.set(f"game:{game_id}:players", json.dumps(game.get_players()))
            pipe.set(f"game:{game_id}:turn", json.dumps(game.turn.__dict__))
            pipe.set(f"game:{game_id}:chance", json.dumps(game.chance_deck))
            pipe.set(f"game:{game_id}:community", json.dumps(game.community_deck))
            pipe.set(
                f"game:{game_id}:turn_order",
                json.dumps([player.id for player in game.get_players().values()]),
            )
            await pipe.execute()

        return game_id

    async def load_game(self, game_id: UUID) -> Game | None:
        redis = await get_redis()

        if not await redis.exists(f"game:{game_id}:state"):
            return None

        state, players, turn, chance, community, turn_order = await redis.mget(
            f"game:{game_id}:state",
            f"game:{game_id}:players",
            f"game:{game_id}:turn",
            f"game:{game_id}:chance",
            f"game:{game_id}:community",
            f"game:{game_id}:turn_order",
        )

        game = Game(game_id, [])
        game.state = json.loads(state)
        game.turn.__dict__ = json.loads(turn)
        game.chance_deck = json.loads(chance)
        game.community_deck = json.loads(community)

        for pid, pdata in json.loads(players).items():
            game.players_map[int(pid)].__dict__.update(pdata)
        game.turn_order = json.loads(turn_order)

        return game

    async def save_game(self, game: Game):
        redis = await get_redis()
        gid = game.id

        async with redis.pipeline() as pipe:
            pipe.set(f"game:{gid}:state", json.dumps(game.state))
            pipe.set(f"game:{gid}:players", json.dumps(game.get_players()))
            pipe.set(f"game:{gid}:turn", json.dumps(game.turn.__dict__))
            pipe.set(f"game:{gid}:chance", json.dumps(game.chance_deck))
            pipe.set(f"game:{gid}:community", json.dumps(game.community_deck))
            await pipe.execute()

    async def delete_game(self, game_id: UUID):
        redis = await get_redis()
        await redis.delete(
            f"game:{game_id}:state",
            f"game:{game_id}:players",
            f"game:{game_id}:turn",
            f"game:{game_id}:chance",
            f"game:{game_id}:community",
        )
