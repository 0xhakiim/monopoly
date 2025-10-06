class Player:
    def __init__(self, name, piece):
        self.name = name
        self.piece = piece
        self.position = 0
        self.money = 1500
        self.properties = []
        self.in_jail = False
        self.jail_turns = 0
        self.get_out_of_jail_free_cards = 0
    def move(self, steps):
        self.position = (self.position + steps) % 40
        
    def pay(self, amount):
        self.money -= amount
    def receive(self, amount):
        self.money += amount
    def buy_property(self, property):
        if property.owner:
            self.money -= property.rent
            property.owner.receive(property.rent)
            return True
        if self.money >= property.price:
            self.pay(property.price)
            self.properties.append(property)
            property.owner = self
            return True
        self.money =0
        return False
    