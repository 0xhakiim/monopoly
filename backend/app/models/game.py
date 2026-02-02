import asyncio
import random
from turtle import position
from typing import List, Dict, Any
from pydantic import TypeAdapter
from sqlalchemy import true
from app.models.Player import Player
from app.models.board import get_board, Square

STATIC_BOARD_TILES: Dict[int, Square] = get_board().tiles


class Turn:
    def __init__(self, player_id: int):
        self.player_id: int = player_id
        self.doubles = 0
        self.active = True


CHANCE_CARDS: List[Dict[str, Any]] = [
    {"type": "MOVE", "target": 0},  # Advance to GO
    {"type": "MOVE", "target": 24},  # Illinois Ave
    {"type": "MOVE", "target": 11},  # St. Charles Place
    {"type": "NEAREST", "target": "Railroad"},
    {"type": "NEAREST", "target": "Utility"},
    {"type": "BACK", "steps": 3},
    {"type": "MONEY", "amount": 50},
    {"type": "MONEY", "amount": -15},
    {"type": "GO_TO_JAIL"},
    {"type": "REPAIRS", "house": 25, "hotel": 100},
    {"type": "JAIL_FREE"},
]

COMMUNITY_CHEST_CARDS: List[Dict[str, Any]] = [
    {"type": "MOVE", "target": 0},
    {"type": "MONEY", "amount": 200},
    {"type": "MONEY", "amount": 100},
    {"type": "MONEY", "amount": -50},
    {"type": "MONEY", "amount": -100},
    {"type": "GO_TO_JAIL"},
    {"type": "JAIL_FREE"},
    {"type": "FROM_PLAYERS", "amount": 50},
]


class Game:
    def __init__(self, id, player_ids: List[int]):
        self.id = id
        self.turn_order: List[int] = [i for i in range(len(player_ids))]
        self.turn: Turn = Turn(self.turn_order[0])
        # 2. Player Map: Dict of ID -> Player object for fast state lookup
        self.players_map: Dict[int, Player] = {
            p_id: Player(id=i, user_id=p_id) for i, p_id in enumerate(player_ids)
        }
        self.players = {i: p_id for i, p_id in enumerate(player_ids)}
        # Game-wide state
        self.state: Dict[str, Any] = {
            "turn_index": 0,  # Index into self.turn_order
            "mutable_properties": self._initialize_mutable_properties(),  # Tracks ownership, houses, mortgage
            "phase": "WAIT_FOR_ROLL",  # e.g., WAIT_FOR_ROLL, DECIDE_TO_BUY, PAY_RENT
            "auction": None,  # Details of ongoing auction if any
        }
        self.chance_deck = CHANCE_CARDS.copy()
        self.community_deck = COMMUNITY_CHEST_CARDS.copy()
        random.shuffle(self.chance_deck)
        random.shuffle(self.community_deck)

        self.connections: Dict[int, Any] = {}
        print(f"Game created with ID: {self.id} and players: {self.players_map}")

    async def start_auction(self, id: int, playerId: int):

        self.state["auction"] = {
            "square_id": id,
            "highest_bid": 0,
            "highest_bidder": None,
            "active_players": list(self.players_map.keys()),
            "auctionProperty": STATIC_BOARD_TILES[id].model_dump(),
            "turn_index": self.players_map[playerId].id,
        }
        self.state["phase"] = "AUCTION"
        await self.broadcast({"type": "AUCTION_STARTED", "state": self.state})

    async def place_bid(self, player_id: int, amount: int):
        auction = self.state["auction"]
        if not auction or player_id not in auction["active_players"]:
            return

        if amount <= auction["highest_bid"]:
            return

        if self.players_map[player_id].money < amount:
            return

        auction["highest_bid"] = amount
        auction["highest_bidder"] = player_id
        auction["turn_index"] = (auction["turn_index"] + 1) % len(
            auction["active_players"]
        )

        await self.broadcast({"type": "AUCTION_UPDATE", "state": self.state})

    def end_turn(self):
        print("########Ending turn for player:", self.turn.player_id)
        self.state["turn_index"] = (self.state["turn_index"] + 1) % len(self.turn_order)
        self.turn = Turn(self.turn_order[self.state["turn_index"]])
        player = self.players_map[self.players[self.turn.player_id]]
        if player.in_jail:
            self.state["phase"] = "JAIL_DECISION"
        else:
            self.state["phase"] = "WAIT_FOR_ROLL"

    async def fold_auction(self, player_id: int):
        auction = self.state["auction"]
        auction["active_players"].remove(player_id)

        if len(auction["active_players"]) == 1:
            await self._finalize_auction()

    def get_players(self):
        adapter_dict = TypeAdapter(Dict[int, Player])
        return adapter_dict.dump_python(self.players_map)

    async def _finalize_auction(self):
        auction = self.state["auction"]
        winner = auction["highest_bidder"]
        price = auction["highest_bid"]
        square_id = auction["square_id"]

        player = self.players_map[winner]
        player.money -= price
        player.properties.append(square_id)

        self.state["mutable_properties"][square_id]["owner_id"] = winner
        self.state["auction"] = None
        self.state["phase"] = "WAIT_FOR_NEXT_TURN"
        await self.broadcast(
            {
                "type": "AUCTION_FINISHED",
                "state": {**self.state, "players": list(self.get_players().items())},
                "extra": {
                    "winner": self.players_map[winner].id if winner else None,
                    "price": price,
                    "square_id": square_id,
                },
            }
        )

    def _initialize_mutable_properties(self) -> Dict[int, Any]:
        """Initializes mutable state for properties, railroads, and utilities."""
        mutable_state: Dict[int, Dict[str, Any]] = {}
        for id, square in STATIC_BOARD_TILES.items():
            if square.type in ["Property", "Railroad", "Utility"]:
                # Initialize mutable properties for all purchasable squares
                mutable_state[id] = {
                    "owner_id": None,
                    "houses": 0,
                    "is_mortgaged": False,
                }
        return mutable_state

    async def roll_dice(self, player_id: int) -> tuple[int, int]:
        dice = (random.randint(1, 6), random.randint(1, 6))
        dice = (2, 2)  # For testing purposes, remove this line in production
        await self.handle_position(player_id, dice)

        return dice

    def next_turn(self):
        self.state["turn_index"] = (self.state["turn_index"] + 1) % len(self.turn_order)
        self.state["phase"] = "WAIT_FOR_ROLL"

    async def handle_position(self, player_id: int, dice: tuple[int, int]):
        """
        Handles the effect of a player landing on a specific square.
        """
        # Get STATIC square details from the module constant

        player = self.players_map[player_id]

        if dice[0] == dice[1]:
            print(f"Player {player_id} rolled doubles!")
            self.turn.active = True
            self.turn.doubles += 1
            if self.turn.doubles >= 3:
                print(f"Player {player_id} rolled doubles 3 times and is sent to Jail!")
                self.turn.active = False
                self.turn.doubles = 0
                await self._handle_go_to_jail(player)
                return
        else:
            self.turn.active = False
            self.turn.doubles = 0
        # Calculate new position (simplified modulo 40)
        current_pos = player.position
        new_pos = (current_pos + dice[0] + dice[1]) % 40
        if new_pos < current_pos:
            # Passed Go
            player.money += 200
            print(f"Player {player_id} passed Go and collected $200!")
        square: Square = STATIC_BOARD_TILES[new_pos]
        print(square)
        print(f"Player {player_id} landed on: {square.name}")
        player.position = new_pos
        if square.type in ["Property", "Railroad", "Utility"]:
            self.state["phase"] = "DECIDE_TO_BUY"
            # Pass the dice roll as it is needed for utility rent calculation
            await self._handle_land_on_purchasable(player, square, dice)

        elif square.type == "Tax":
            self.state["phase"] = "PAY_TAX"
            await self._handle_tax_square(player, square)
        elif square.type == "GoToJail":
            self.state["phase"] = "GO_TO_JAIL"
            await self._handle_go_to_jail(player)

        elif square.type == "CommunityChest":
            self.state["phase"] = "DRAW_CARD"
            await self._draw_community_chest(player)
        elif square.type == "Chance":
            await self._draw_chance(player, dice)

        else:  # Go, Jail (Visiting), Free Parking
            self.state["phase"] = "TURN_ACTIONS"

        if self.state["phase"] == "TURN_ACTIONS":
            self.state["phase"] = "WAIT_FOR_NEXT_TURN"

    # --- Helper methods for clean separation of logic ---
    async def _handle_land_on_purchasable(
        self, player: Player, square: Square, dice: tuple[int, int]
    ):
        """Handles landing on Property, Railroad, or Utility."""

        # Get MUTABLE property state from the game state tracker
        mutable_state = self.state["mutable_properties"][square.id]
        owner_id = mutable_state["owner_id"]

        # 1. Square is UNOWNED
        if owner_id is None:
            self.state["phase"] = "DECIDE_TO_BUY"
            return

        # 2. Square is OWNED by the current player (no action needed)
        if owner_id == player.id:
            self.state["phase"] = "WAIT_FOR_NEXT_TURN"
            return

        # 3. Square is OWNED by another player (PAY RENT)
        owner = self.players_map.get(owner_id)
        if not owner:
            print(f"Error: Owner with ID {owner_id} not found.")
            self.state["phase"] = "WAIT_FOR_NEXT_TURN"
            return

        if not mutable_state["is_mortgaged"]:
            # Pass dice roll for utility calculation
            rent = self._calculate_rent(owner, square, mutable_state, dice)

            if rent > 0:
                if player.money < rent:
                    print(
                        f"Player {player.id} cannot afford rent of ${rent} to Player {owner.id}"
                    )
                    # In a full implementation, trigger bankruptcy or asset liquidation here
                    # For now, we'll just set player's money to 0
                    player.money = 0
                    return
                # Transfer money
                player.money -= rent
                owner.money += rent
                await self.broadcast(
                    {
                        "type": "RENT_PAID",
                        "from": player.id,
                        "to": owner.id,
                        "amount": rent,
                        "square_id": square.id,
                    }
                )
                print(f"Player {player.id} paid ${rent} rent to Player {owner.id}")

        self.state["phase"] = "WAIT_FOR_NEXT_TURN"

    async def _handle_tax_square(self, player: Player, square: Square):
        """Handles landing on Income Tax or Luxury Tax."""
        if square.tax_amount:
            player.money -= square.tax_amount
            print(f"Player {player.id} paid ${square.tax_amount} tax.")
            await self.broadcast(
                {
                    "type": "TAX_PAID",
                    "player_id": player.id,
                    "amount": square.tax_amount,
                }
            )
        self.state["phase"] = "TURN_ACTIONS"

    async def _handle_go_to_jail(self, player: Player):
        """Moves player to jail and sets their state."""
        player.position = 10  # Jail square ID is 10
        player.in_jail = True
        player.jail_turns = 0
        self.turn.active = False
        await self.broadcast(
            {"type": "message", "message": f"Player {player.id} has been sent to Jail."}
        )
        print(f"Player {player.id} has been sent to Jail.")
        self.state["phase"] = "WAIT_FOR_NEXT_TURN"

    async def _execute_card(
        self, card: dict[str, Any], player: Player, dice: tuple[int, int]
    ):
        t = card["type"]

        if t == "MOVE":
            await self._move_player(player, card["target"])

        elif t == "GO_TO_JAIL":
            await self.broadcast(
                {
                    "type": "message",
                    "message": f"Player {player.id} drew a Go to Jail card.",
                }
            )
            await self._handle_go_to_jail(player)

        elif t == "MONEY":
            await self.broadcast(
                {
                    "type": "message",
                    "message": f"Player {player.id} drew a card: {card}",
                }
            )
            player.money += card["amount"]

        elif t == "FROM_PLAYERS":
            await self.broadcast(
                {
                    "type": "message",
                    "message": f"Player {player.id} gained ${card['amount']} from each player.",
                }
            )
            for p in self.players_map.values():
                if p.id != player.id:
                    p.money -= card["amount"]
                    player.money += card["amount"]

        elif t == "BACK":
            await self.broadcast(
                {
                    "type": "message",
                    "message": f"Player {player.id} moves back {card['steps']} spaces.",
                }
            )
            await self._move_player(player, (player.position - card["steps"]) % 40)

        elif t == "NEAREST":
            await self.broadcast(
                {
                    "type": "message",
                    "message": f"Player {player.id} moves to nearest {card['target']}.",
                }
            )
            await self._move_to_nearest(player, card["target"], dice)

        elif t == "REPAIRS":
            await self.broadcast(
                {
                    "type": "message",
                    "message": f"Player {player.id} pays for property repairs.",
                }
            )
            cost = 0
            for pid in player.properties:
                houses = self.state["mutable_properties"][pid]["houses"]
                if houses == 5:
                    cost += card["hotel"]
                else:
                    cost += houses * card["house"]
            player.money -= cost

        elif t == "JAIL_FREE":
            player.get_out_of_jail_free += 1

        self.state["phase"] = "WAIT_FOR_NEXT_TURN"

    async def _move_player(self, player: Player, target: int):
        if target < player.position:
            player.money += 200  # passed GO
        player.position = target
        square = STATIC_BOARD_TILES[target]

        if square.type == "GoToJail":
            await self._handle_go_to_jail(player)

    async def _move_to_nearest(self, player: Player, square_type: str, dice):
        pos = player.position
        for i in range(1, 41):
            idx = (pos + i) % 40
            if STATIC_BOARD_TILES[idx].type == square_type:
                if idx < pos:
                    player.money += 200
                player.position = idx
                await self._handle_land_on_purchasable(
                    player, STATIC_BOARD_TILES[idx], dice
                )
                return

    async def mortgage_property(self, player_id: int, square_id: int):
        player = self.players_map.get(player_id)
        if not player:
            print(f"Error: Player with ID {player_id} not found.")
            return

        square: Square | None = STATIC_BOARD_TILES.get(square_id)
        if not square or square.type not in ["Property", "Railroad", "Utility"]:
            print(f"Error: Square {square_id} is not a mortgagable property.")
            return

        mutable_state = self.state["mutable_properties"].get(square_id)
        if not mutable_state or mutable_state["owner_id"] != player_id:
            print(f"Error: Property {square_id} is not owned by Player {player_id}.")
            return

        if mutable_state["is_mortgaged"]:
            print(f"Error: Property {square_id} is already mortgaged.")
            return

        mortgage_value = square.details.price // 2 if square.details else 0
        player.money += mortgage_value
        mutable_state["is_mortgaged"] = True
        await self.broadcast(
            {
                "type": "PROPERTY_MORTGAGED",
                "player_id": player_id,
                "square_id": square_id,
                "amount": mortgage_value,
            }
        )
        print(f"Player {player_id} mortgaged {square.name} for ${mortgage_value}.")

    async def unmortgage_property(self, player_id: int, square_id: int):
        player = self.players_map.get(player_id)
        if not player:
            print(f"Error: Player with ID {player_id} not found.")
            return

        square: Square | None = STATIC_BOARD_TILES.get(square_id)
        if not square or square.type not in ["Property", "Railroad", "Utility"]:
            print(f"Error: Square {square_id} is not a mortgagable property.")
            return

        mutable_state = self.state["mutable_properties"].get(square_id)
        if not mutable_state or mutable_state["owner_id"] != player_id:
            print(f"Error: Property {square_id} is not owned by Player {player_id}.")
            return

        if not mutable_state["is_mortgaged"]:
            print(f"Error: Property {square_id} is not mortgaged.")
            return

        unmortgage_cost = (
            int((square.details.price // 2) * 1.1) if square.details else 0
        )
        if player.money < unmortgage_cost:
            print(f"Error: Player {player_id} cannot afford to unmortgage {square_id}.")
            return

        player.money -= unmortgage_cost
        mutable_state["is_mortgaged"] = False
        await self.broadcast(
            {
                "type": "PROPERTY_UNMORTGAGED",
                "player_id": player_id,
                "square_id": square_id,
                "amount": unmortgage_cost,
            }
        )
        print(f"Player {player_id} unmortgaged {square.name} for ${unmortgage_cost}.")

    async def build_house(self, player_id: int, square_id: int):
        player = self.players_map.get(player_id)
        if not player:
            print(f"Error: Player with ID {player_id} not found.")
            return

        square: Square | None = STATIC_BOARD_TILES.get(square_id)
        if not square or square.type != "Property":
            print(f"Error: Square {square_id} is not a buildable property.")
            return

        mutable_state = self.state["mutable_properties"].get(square_id)
        if not mutable_state or mutable_state["owner_id"] != player_id:
            print(f"Error: Property {square_id} is not owned by Player {player_id}.")
            return

        details = square.details
        if not details:
            print(f"Error: Property {square_id} has no details.")
            return

        # Check for monopoly
        if not self._check_monopoly(player_id, details.group_id):
            print(f"Error: Player {player_id} does not have a monopoly on this group.")
            return

        # Check house building rules (even building)
        group_properties = [
            sid
            for sid, s in STATIC_BOARD_TILES.items()
            if s.details and s.details.group_id == details.group_id
        ]
        min_houses = min(
            self.state["mutable_properties"][sid]["houses"] for sid in group_properties
        )
        if mutable_state["houses"] > min_houses:
            print(
                f"Error: Must build houses evenly. Current houses on {square_id}: {mutable_state['houses']}, minimum in group: {min_houses}"
            )
            return

        # Check if max houses reached
        if mutable_state["houses"] >= 5:
            print(f"Error: Maximum houses/hotel already built on property {square_id}.")
            return

        house_cost = details.house_cost
        if player.money < house_cost:
            print(f"Error: Player {player_id} cannot afford to build a house.")
            return

        # Build the house
        player.money -= house_cost
        mutable_state["houses"] += 1
        await self.broadcast(
            {
                "type": "HOUSE_BUILT",
                "player_id": player_id,
                "square_id": square_id,
                "houses": mutable_state["houses"],
                "amount": house_cost,
            }
        )
        print(f"Player {player_id} built a house on {square.name} for ${house_cost}.")

    async def handle_insufficient_funds(
        self,
        debtor_id: int,
        creditor_id: int | None,
        amount_due: int,
    ):
        player = self.players_map[debtor_id]

        if player.money >= amount_due:
            return False

        if self._player_has_houses(debtor_id):
            self.state["phase"] = "FORCED_SELL_HOUSES"
            self.state["debt"] = {
                "debtor": debtor_id,
                "creditor": creditor_id,
                "amount": amount_due,
            }
            return True

        if self._player_has_unmortgaged_property(debtor_id):
            self.state["phase"] = "FORCED_MORTGAGE"
            self.state["debt"] = {
                "debtor": debtor_id,
                "creditor": creditor_id,
                "amount": amount_due,
            }
            return True

        await self._declare_bankruptcy(debtor_id, creditor_id)
        return True

    async def forced_mortgage(self, player_id: int, square_id: int):
        square = STATIC_BOARD_TILES[square_id]
        state = self.state["mutable_properties"][square_id]

        if state["is_mortgaged"]:
            return

        value = square.details.price // 2
        state["is_mortgaged"] = True
        self.players_map[player_id].money += value

        await self.broadcast(
            {
                "type": "PROPERTY_MORTGAGED",
                "player_id": player_id,
                "square_id": square_id,
                "amount": value,
            }
        )

    def _owned_by(self, owner_id: int, square_type: str) -> int:
        return sum(
            1
            for sid, s in self.state["mutable_properties"].items()
            if s["owner_id"] == owner_id and STATIC_BOARD_TILES[sid].type == square_type
        )

    def _calculate_rent(
        self,
        owner: Player,
        square: Square,
        mutable_state: Dict[str, Any],
        dice: tuple[int, int],
    ) -> int:
        """Calculates the rent for a property based on its state and type."""
        details = square.details
        if not details:
            return 0

        # Rent for standard properties
        if square.type == "Property":
            houses = mutable_state["houses"]

            if houses == 0:
                is_monopoly = self._check_monopoly(owner.user_id, details.group_id)
                base_rent = details.rent[0]
                return base_rent * 2 if is_monopoly else base_rent
            else:
                return details.rent[houses]

        # Rent for railroads
        elif square.type == "Railroad":
            count = self._owned_by(owner.id, "Railroad")
            return details.rent[count - 1]

        # Rent for utilities
        elif square.type == "Utility":
            count = self._owned_by(owner.id, "Utility")
            roll = dice[0] + dice[1]
            return roll * (10 if count == 2 else 4)

        return 0

    def _check_game_over(self):
        active = [
            p for p in self.players_map.values() if not getattr(p, "bankrupt", False)
        ]
        if len(active) == 1:
            self.state["phase"] = "GAME_OVER"
            winner = active[0].id
            asyncio.create_task(
                self.broadcast(
                    {
                        "type": "GAME_OVER",
                        "winner": winner,
                    }
                )
            )

    async def _draw_chance(self, player: Player, dice: tuple[int, int]):
        card: Dict[str, Any] = self.chance_deck.pop(0)
        self.chance_deck.append(card)
        await self._execute_card(card, player, dice)

    async def _draw_community_chest(self, player: Player):
        card: Dict[str, Any] = self.community_deck.pop(0)
        self.community_deck.append(card)
        await self._execute_card(card, player, (0, 0))

    async def forced_sell_house(self, player_id: int, group_id: str):
        props = [
            sid
            for sid, s in STATIC_BOARD_TILES.items()
            if s.details
            and s.details.group_id == group_id
            and self.state["mutable_properties"][sid]["owner_id"] == player_id
        ]

        if not props:
            return

        max_houses = max(
            self.state["mutable_properties"][sid]["houses"] for sid in props
        )

        candidates = [
            sid
            for sid in props
            if self.state["mutable_properties"][sid]["houses"] == max_houses
        ]

        sid = candidates[0]
        details = STATIC_BOARD_TILES[sid].details
        refund = details.house_cost // 2

        self.state["mutable_properties"][sid]["houses"] -= 1
        self.players_map[player_id].money += refund

        await self.broadcast(
            {
                "type": "HOUSE_SOLD",
                "player_id": player_id,
                "square_id": sid,
                "refund": refund,
            }
        )

    async def _declare_bankruptcy(self, debtor_id: int, creditor_id: int | None):
        debtor = self.players_map[debtor_id]

        for sid in debtor.properties:
            prop = self.state["mutable_properties"][sid]
            if creditor_id is not None:
                prop["owner_id"] = creditor_id
            else:
                prop["owner_id"] = None
                prop["houses"] = 0
                prop["is_mortgaged"] = False

        debtor.properties.clear()
        debtor.money = 0
        debtor.is_bankrupt = True

        await self.broadcast(
            {
                "type": "PLAYER_BANKRUPT",
                "player_id": debtor_id,
                "creditor": creditor_id,
            }
        )

        self._check_game_over()

    def _player_has_houses(self, player_id: int) -> bool:
        return any(
            s["houses"] > 0
            for s in self.state["mutable_properties"].values()
            if s["owner_id"] == player_id
        )

    def _player_has_unmortgaged_property(self, player_id: int) -> bool:
        return any(
            s["owner_id"] == player_id and not s["is_mortgaged"]
            for s in self.state["mutable_properties"].values()
        )

    def _check_monopoly(self, player_id: int, group_id: str) -> bool:
        # 1. Determine total properties in this group
        group_size = sum(
            1
            for square in STATIC_BOARD_TILES.values()
            if square.details and square.details.group_id == group_id
        )

        # 2. Count properties in this group owned by the player (using Player.properties)
        player = self.players_map[player_id]
        player_owned_in_group = sum(
            1
            for prop_id in player.properties
            if STATIC_BOARD_TILES[prop_id].details
            and STATIC_BOARD_TILES[prop_id].details.group_id == group_id
        )

        return player_owned_in_group == group_size

    async def buy_property(self, player_id: int, square_id: int):

        player = self.players_map.get(player_id)
        if not player:
            print(f"Error: Player with ID {player_id} not found.")
            return

        square: Square | None = STATIC_BOARD_TILES.get(square_id)
        if not square or square.type not in ["Property", "Railroad", "Utility"]:
            print(f"Error: Square {square_id} is not a purchasable property.")
            return

        # Check if the square is actually for sale (unowned)
        mutable_state = self.state["mutable_properties"].get(square_id)
        if not mutable_state or mutable_state["owner_id"] is not None:
            print(f"Error: Property {square_id} is already owned.")
            return

        price = square.details.price if square.details else 0

        # 1. Check if the player can afford it
        if player.money < price:
            print(
                f"Player {player_id} cannot afford property {square_id} (Cost: {price}, Money: {player.money})"
            )
            # In a real game, this should trigger a "DECIDE_TO_MORTGAGE" phase or similar
            # For now, we'll just skip the purchase.
            if len(player.properties) == 0:
                self.state["phase"] = "DECIDE_TO_MORTGAGE"

            await self.broadcast(
                {
                    "type": "game_update",
                    "state": self.state,
                    "message": f"Player {player_id} cannot afford property {square_id}.",
                }
            )
            return

        # 2. Execute the purchase
        player.money -= price
        player.properties.append(square_id)
        mutable_state["owner_id"] = player_id
        await self.broadcast(
            {
                "type": "PROPERTY_BOUGHT",
                "buyer": player_id,
                "price": price,
                "square_id": square_id,
            }
        )
        print(f"Player {player_id} bought {square.name} for ${price}.")

        # 3. Advance game state phase
        self.state["phase"] = "WAIT_FOR_NEXT_TURN"

    async def jail_decision(self, player_id: int, action: str):
        player = self.players_map[player_id]

        if action == "PAY":
            player.money -= 50
            player.in_jail = False

        elif action == "CARD":
            if player.get_out_of_jail_free <= 0:
                print(f"Error: Player {player_id} has no Get Out of Jail Free cards.")
                return
            player.get_out_of_jail_free -= 1
            player.in_jail = False

        elif action == "ROLL":
            dice = (random.randint(1, 6), random.randint(1, 6))
            print(f"Player {player_id} rolled dice: {dice}")
            if dice[0] == dice[1]:
                player.in_jail = False
                player.jail_turns = 0
            else:
                player.jail_turns += 1
                if player.jail_turns >= 3:
                    player.money -= 50
                    player.in_jail = False
                    player.jail_turns = 0
        self.state["phase"] = "WAIT_FOR_NEXT_TURN"
        await self.broadcast(
            {
                "type": "WAIT_FOR_NEXT_TURN",
                "state": self.state,
            }
        )

    # Connection methods
    async def broadcast(self, message: dict):
        for ws in self.connections.values():
            await ws.send_json(message)

    async def send_to(self, player_id: int, message: dict):
        if ws := self.connections.get(player_id):
            await ws.send_json(message)
