import json
class Tile():
    def __init__(self, name,type):
        self.name = name
        self.type = type

class Property(Tile):
    def __init__(self,name,type, price, rent, color):
        super().__init__(name, type)
        self.price = price
        self.rent = rent
        self.owner = None
        self.color = color
    def set_owner(self, player):
        self.owner = player
class Utility(Property):
    def __init__(self,name,type, price):
        super().__init__(name,price,type,rent=0,color="white")
        self.type="Utility"
class Railroad(Property):
    def __init__(self,name,type, price, rent):
        super().__init__(name,price,type,rent,color="black")
        self.type="Railroad"
class CommunityChest(Tile):
    def __init__(self,name,type):
        super().__init__(name, type=type)
class Tax(Tile):
    def __init__(self,name,type, price):
        super().__init__(name, type=type)
        self.amount = price
class Board():
    tiles: list = []
    def __init__(self, tiles: list=None):
        if tiles ==None:
            with open('app/assets/board.json', 'r') as f:
                data = json.load(f)
            for tile in data:
                if tile["type"]=="property":
                    tile = Property(**tile)
                elif tile["type"]=="railroad":
                    tile = Railroad(**tile)
                elif tile["type"]=="community_chest":
                    tile = CommunityChest(**tile)
                elif tile["type"]=="tax":
                    tile = Tax(**tile)
                elif tile["type"]=="utility":
                    tile = Utility(**tile)
                else:
                    tile = Tile(**tile)
                self.tiles.append(tile)
        else:
            self.tiles = tiles
    def get_tile(self, position):
        return self.tiles[position % len(self.tiles)]
    def display(self):
        for i, tile in enumerate(self.tiles):
            owner = tile.owner.name if tile.owner else "None"
            print(f"Tile {i}: {tile.name}, Type: {tile["type"]}, Price: {tile.price}, Rent: {tile.rent}, Owner: {owner}")



_board_instance: Board | None = None

def get_board() -> Board:
    global _board_instance
    if _board_instance is None:
        _board_instance = Board()
    return _board_instance