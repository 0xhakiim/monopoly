import random
from turtle import position
from typing import List, Dict, Any
from pydantic import TypeAdapter
from sqlalchemy import true
from app.models.Player import Player
from app.models.board import get_board, Square

STATIC_BOARD_TILES: Dict[int, Square] = get_board().tiles


class Game:
    def __init__(self, id, player_ids: List[int]):
        self.id = id
        self.turn_order: List[int] = [i for i in range(len(player_ids))]

        # 2. Player Map: Dict of ID -> Player object for fast state lookup
        self.players_map: Dict[int, Player] = {
            p_id: Player(id=i) for i, p_id in enumerate(player_ids)
        }

        # Game-wide state
        self.state: Dict[str, Any] = {
            "turn_index": 0,  # Index into self.turn_order
            "mutable_properties": self._initialize_mutable_properties(),  # Tracks ownership, houses, mortgage
            "phase": "WAIT_FOR_ROLL",  # e.g., WAIT_FOR_ROLL, DECIDE_TO_BUY, PAY_RENT
        }

        self.connections: Dict[int, Any] = {}
        print(f"Game created with ID: {self.id} and players: {self.players_map}")

    def start_auction(self, id):
        self.state["phase"] = "WAIT_FOR_NEXT_TURN"

    def get_players(self):
        adapter_dict = TypeAdapter(Dict[int, Player])
        return adapter_dict.dump_python(self.players_map)

    def _initialize_mutable_properties(self) -> Dict[int, Any]:
        """Initializes mutable state for properties, railroads, and utilities."""
        mutable_state = {}
        for id, square in STATIC_BOARD_TILES.items():
            if square.type in ["Property", "Railroad", "Utility"]:
                # Initialize mutable properties for all purchasable squares
                mutable_state[id] = {
                    "owner_id": None,
                    "houses": 0,
                    "is_mortgaged": False,
                }
        return mutable_state

    def roll_dice(self, player_id) -> tuple[int, int]:
        dice = (random.randint(1, 6), random.randint(1, 6))

        # Get the current player ID using the turn index
        current_player = self.players_map[player_id]

        # Calculate new position (simplified modulo 40)
        current_pos = current_player.position
        new_pos = (current_pos + dice[0] + dice[1]) % 40

        current_player.position = new_pos
        self.handle_position(current_player, new_pos, dice)

        return dice

    def next_turn(self):
        self.state["turn_index"] = (self.state["turn_index"] + 1) % len(
            self.players_map
        )
        self.state["phase"] = "WAIT_FOR_ROLL"

    def play_turn(self):
        current_player = self.players_map[self.turn_index]
        roll = self.roll_dice()
        return f"Player {current_player} rolled a {roll}"

    def handle_position(self, player: Player, position: int, dice: tuple[int, int]):
        """
        Handles the effect of a player landing on a specific square.
        """
        # Get STATIC square details from the module constant
        square: Square = STATIC_BOARD_TILES[position]
        print(square)
        print(f"Player {player.id} landed on: {square.name}")

        if square.type in ["Property", "Railroad", "Utility"]:
            self.state["phase"] = "LAND_ON_PROPERTY"
            # Pass the dice roll as it is needed for utility rent calculation
            self._handle_land_on_purchasable(player, square, dice)

        elif square.type == "Tax":
            self.state["phase"] = "PAY_TAX"
            self._handle_tax_square(player, square)

        elif square.type == "GoToJail":
            self.state["phase"] = "GO_TO_JAIL"
            self._handle_go_to_jail(player)

        elif square.type in ["CommunityChest", "Chance"]:
            self.state["phase"] = "DRAW_CARD"
            # Logic to draw and execute card here
            self.state["phase"] = "TURN_ACTIONS"

        else:  # Go, Jail (Visiting), Free Parking
            self.state["phase"] = "TURN_ACTIONS"

        if self.state["phase"] == "TURN_ACTIONS":
            self.state["phase"] = "WAIT_FOR_NEXT_TURN"

    # --- Helper methods for clean separation of logic ---
    def _handle_land_on_purchasable(
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
            self.state["phase"] = "TURN_ACTIONS"
            return

        # 3. Square is OWNED by another player (PAY RENT)
        owner = self.players_map.get(owner_id)

        if not mutable_state["is_mortgaged"]:
            # Pass dice roll for utility calculation
            rent = self._calculate_rent(owner, square, mutable_state, dice)

            # Transfer money
            player.money -= rent
            owner.money += rent

            print(f"Player {player.id} paid ${rent} rent to Player {owner.id}")

        self.state["phase"] = "WAIT_FOR_NEXT_TURN"

    def _handle_tax_square(self, player: Player, square: Square):
        """Handles landing on Income Tax or Luxury Tax."""
        if square.tax_amount:
            player.money -= square.tax_amount
            print(f"Player {player.id} paid ${square.tax_amount} tax.")

        self.state["phase"] = "TURN_ACTIONS"

    def _handle_go_to_jail(self, player: Player):
        """Moves player to jail and sets their state."""
        player.position = 10  # Jail square ID is 10
        player.in_jail = True
        player.jail_turns = 0

        print(f"Player {player.id} has been sent to Jail.")
        self.state["phase"] = "TURN_ACTIONS"

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
                is_monopoly = self._check_monopoly(owner.id, details.group_id)
                base_rent = details.rent[0]
                return base_rent * 2 if is_monopoly else base_rent
            else:
                return details.rent[houses]

        # Rent for railroads
        elif square.type == "Railroad":
            railroads_owned = sum(
                1
                for prop_id in owner.properties
                if STATIC_BOARD_TILES[prop_id].type == "Railroad"
            )
            # The rent list is [25, 50, 100, 200] corresponding to 1, 2, 3, 4 railroads owned.
            return details.rent[railroads_owned - 1]

        # Rent for utilities
        elif square.type == "Utility":
            utilities_owned = sum(
                1
                for prop_id in owner.properties
                if STATIC_BOARD_TILES[prop_id].type == "Utility"
            )
            total_roll = dice[0] + dice[1]

            if utilities_owned == 1:
                return 4 * total_roll  # 4x the dice total
            elif utilities_owned == 2:
                return 10 * total_roll  # 10x the dice total

        return 0

    def _check_monopoly(self, player_id: int, group_id: str) -> bool:
        """Checks if a player owns all properties in a color group."""

        # 1. Count total properties in this group (using the STATIC constant)
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

    def buy_property(self, player_id: int, square_id: int):
        """
        Executes the property purchase for the given player and square.
        Assumes the current game phase is DECIDE_TO_BUY and the property is unowned.
        """
        player = self.players_map.get(player_id)
        if not player:
            print(f"Error: Player with ID {player_id} not found.")
            return

        square: Square = STATIC_BOARD_TILES.get(square_id)
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
            self.state["phase"] = "TURN_ACTIONS"
            return

        # 2. Execute the purchase
        player.money -= price
        player.properties.append(square_id)
        mutable_state["owner_id"] = player_id

        print(f"Player {player_id} bought {square.name} for ${price}.")

        # 3. Advance game state phase
        self.state["phase"] = "WAIT_FOR_NEXT_TURN"

    # Connection methods
    async def broadcast(self, message: dict):
        for ws in self.connections.values():
            await ws.send_json(message)

    async def send_to(self, player_id: int, message: dict):
        if ws := self.connections.get(player_id):
            await ws.send_json(message)
