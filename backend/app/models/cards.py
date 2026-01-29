class Card:
    def __init__(self, description, action):
        self.description = description
        self.action = action


class Deck:
    def __init__(self, cards: list):
        self.cards = cards

    def draw_card(self):
        if len(self.cards) == 0:
            return None
        return self.cards.pop(0)

    def add_card(self, card: Card):
        self.cards.append(card)
