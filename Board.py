import json
class Tile():
    def __init__(self, name,type,price=None,rent=None,color=None):
        self.name = name
        self.owner = None
        self.type = type
        self.price = price
        self.rent = rent
        self.color = color

class Board():
    def __init__(self, tiles: list=None):
        if tiles ==None:
            with open('assets/board.json', 'r') as f:
                data = json.load(f)
            for tile in data:
                self.tiles = [Tile(**tile) for tile in data]
        else:
            self.tiles = tiles
    def get_tile(self, position):
        return self.tiles[position % len(self.tiles)]
    def display(self):
        for i, tile in enumerate(self.tiles):
            owner = tile.owner.name if tile.owner else "None"
            print(f"Tile {i}: {tile.name}, Type: {tile.type}, Price: {tile.price}, Rent: {tile.rent}, Owner: {owner}")
