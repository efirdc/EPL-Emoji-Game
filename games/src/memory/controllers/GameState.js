
// Constructor for the Card class
function Card (cardID, faceUp, cardKey) {
    this.cardID = cardID;
    this.faceUp = faceUp;
    this.cardKey = cardKey;
    this.matched = false;
}

// Constructor for the GameState class
// Consider this class the data "Model" in the Model-View-Controller (MVC) programming pattern
// The only responsibility of this class is to hold all the data for the memory game
// The View should be able to display all game information just from reading this class
function GameState (size, flips) {

    this.size = size;
    this.initialFlips = flips;
    this.flipsLeft = flips;
    this.currentLevel = 0;
    this.cards = [];

    // populate the cards with face down cards that have ID 0
    for (var i = 0; i < this.size; i++) {
        this.cards[i] = new Card(0, false, i);
    }
}

module.exports = GameState;