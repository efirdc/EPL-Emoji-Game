const GameState = require("./GameState.js");

// Constructor for simple Level class.
// Holds the properties and difficulty settings for each level of the memory
// In the future we may want to add a reference to a cardDistributionFunction to this class
// So that levels that are very large can distribute cards in a way that no two cards are too far apart
function Level (size, flips){
    if (size % 2 !== 0){
        console.log("Warning: Created a level with an odd number of cards.")
    }
    this.size = size;
    this.flips = flips;
}

// Constructor for the main Game class
// Consider this class the "Controller" in the Model-View-Controller (MVC) programming pattern
function Game (size, flips) {
    this.levels = [new Level(size, flips)];
    this.gameState = new GameState(size, flips);
    this.setLevel(0);
}

// Public methods for the Game class
Object.assign(Game.prototype, {

    // Add new levels to the memory game at runtime
    addLevel: function (size, flips) {
        this.levels.push(new Level(size, flips));
    },

    // Sets the current level for the memory game
    // By default the game only has level 0 until new ones are added with addLevel()
    // This function creates a new gameState and the old one is garbage collected
    setLevel: function (levelID) {

        // Get the level data
        var level = this.levels[levelID];

        // Error check
        if (level === undefined) {
            console.log("Error: Undefined levelID for setLevel()");
        }

        // Create a new gameState, set level and distribute cards
        this.gameState = new GameState(level.size, level.flips);
        this.gameState.currentLevel = levelID;
        distributeCardsRandomly(this.gameState);
    },

    // Advance to the next level
    nextLevel: function () {
        var newLevelID = this.gameState.currentLevel + 1;
        if (newLevelID >= this.levels.length) {
            newLevelID = 0;
        }
        this.setLevel(newLevelID);
    },

    // This function should be called when someone starts pressing a card
    pressCard: function (key) {

        // Error check
        if (this.gameState.size <= key){
            console.log("Error: cardKey out of range in pressCard()")
        }

        var card = this.gameState.cards[key];

        // Return if the card is already faceUp
        if (card.faceUp) {
            return;
        }

        // Set the card as faceUp and reduce flips by 1
        card.faceUp = true;
        this.gameState.flipsLeft -= 1;

        // If the card with a matching ID is also faceUp, set the matched flag
        var cards = this.gameState.cards;
        for (var i = 0; i < this.gameState.size; i++) {
            var compareCard = cards[i];
            if (compareCard !== card && card.cardID === compareCard.cardID && compareCard.faceUp) {
                compareCard.matched = card.matched = true;
            }
        }
    },

    // This function should be called when someone stops pressing a card
    releaseCard: function (key) {

        // Get the released card
        var cards = this.gameState.cards;
        var releasedCard = cards[key];

        // Error checks
        if (this.gameState.size <= key) {
            console.log("Error: cardKey out of range in releaseCard()");
            return false;
        }
        if (!releasedCard.faceUp) {
            console.log("Error: releaseCard(" + key + ") on card that is not flipped.");
            return false;
        }

        // Dont release matched cards
        if (releasedCard.matched){
            return false;
        }
        releasedCard.faceUp = false;
        return true;
    },

    isGameWon: function() {

        // Return false not faceUp card is found
        var cards = this.gameState.cards;
        for (var i = 0; i < this.gameState.size; i++) {
            if (!cards[i].faceUp) {
                return false;
            }
        }

        // Return true if all cards are faceUp
        return true;
    },

    isGameLost: function() {
        return this.gameState.flipsLeft <= 0;
    }
});

// Private functions for this module are below

// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

function distributeCardsRandomly(gameState) {

    // Create a shuffled array of all cardIDs
    var cardIDs = [];
    var numCardIDs = gameState.size / 2;
    for (let i = 0; i < numCardIDs; i++){
        cardIDs.push(i);
        cardIDs.push(i);
    }
    shuffle(cardIDs);

    // Distribute the shuffled cardIDs over the game cards
    for (let i = 0; i < gameState.size; i++){
        gameState.cards[i].cardID = cardIDs.pop();
    }
}

module.exports = Game;