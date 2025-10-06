import Player
from random import randint
import Board
class Dice:
    def __init__(self, sides=6):
        self.sides = sides

    def roll(self):
        return randint(1, self.sides)

def main():
    dice = Dice()
    player1 = Player.Player("Alice", "Car")
    player2 = Player.Player("Bob", "Hat")
    board = Board.Board()
    players = [player1, player2]
    bankrupts=0
    while True:
        for player in players:
            print(f"{player.name}'s turn:")
            roll = dice.roll()
            player.move(roll)
            tile = board.get_tile(player.position)
            if tile.type == "property":
                if player.buy_property(tile):
                    print(f"{player.name} bought {tile.name} for {tile.price}. Remaining money: {player.money}")
                else:
                    print(f"{player.name} could not afford {tile.name}.")
            print(f"{player.name} rolled a {roll} and moved to position {player.position} ({board.get_tile(player.position).name})")
            if player.money <= 0:
                print(f"{player.name} is bankrupt!")
                players.remove(player)
            if len(players) == 1:
                print(f"{players[0].name} wins the game!")
                return
if __name__ == "__main__":
    main()