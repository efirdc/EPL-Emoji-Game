const GameState = require("./GameState.js");

// Constructor for simple Level class.
// Holds the properties and difficulty settings for each level of the memory
// In the future we may want to add a reference to a cardDistributionFunction to this class
// So that levels that are very large can distribute cards in a way that no two cards are too far apart
function Level (rows, columns, flips){
    if ((rows * columns) % 2 !== 0){
        console.log("Warning: Created a level with an odd number of cards.")
    }
    this.rows = rows;
    this.columns = columns;
    this.flips = flips;
}

// Constructor for the main Game class
// Consider this class the "Controller" in the Model-View-Controller (MVC) programming pattern
function Game (rows, columns, flips) {
    this.levels = [new Level(rows, columns, flips)];
    this.gameState = new GameState(rows, columns, flips);
    this.setLevel(0);
}

// Public methods for the Game class
Object.assign(Game.prototype, {

    // Add new levels to the memory game at runtime
    addLevel: function (rows, columns, flips) {
        this.levels.push(new Level(rows, columns, flips));
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
        this.gameState = new GameState(level.rows, level.columns, level.flips);
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
    pressCard: function (row, column) {

        // Error check
        if (this.gameState.rows <= row || this.gameState.columns <= column){
            console.log("Error: row or column out of range in pressCard()")
        }

        var card = this.gameState.board[row][column];
        if (!card.faceUp){
            card.faceUp = true;
            this.gameState.flipsLeft -= 1;
        }

        // Match test
        var board = this.gameState.board;
        for (var compareRow = 0; compareRow < this.gameState.rows; compareRow++) {
            for (var compareCol = 0; compareCol < this.gameState.columns; compareCol++) {
                var compareCard = board[compareRow][compareCol];
                if (compareCard !== card && card.cardID === compareCard.cardID && compareCard.faceUp) {
                    compareCard.matched = card.matched = true;
                }
            }
        }
    },

    // This function should be called when someone stops pressing a card
    releaseCard: function(row, column) {

        // Get the released card
        var board = this.gameState.board;
        var releasedCard = board[row][column];

        // Error checks
        if (this.gameState.rows <= row || this.gameState.columns <= column){
            console.log("Error: row or column out of range in releaseCard()");
            return false;
        }
        if (!releasedCard.faceUp) {
            console.log("Error: releaseCard(" + row + ", " + column + ") on card that is not flipped.");
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
        var board = this.gameState.board;
        for (var row = 0; row < this.gameState.rows; row++) {
            for (var col = 0; col < this.gameState.columns; col++) {
                if (!board[row][col].faceUp) {
                    return false;
                }
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
    for (var i = 0; i < numCardIDs; i++){
        cardIDs.push(i);
        cardIDs.push(i);
    }
    shuffle(cardIDs);

    // Distribute the shuffled cardIDs over the game board
    for (var row = 0; row < gameState.rows; row++){
        for (var col = 0; col < gameState.columns; col++){
            gameState.board[row][col].cardID = cardIDs.pop();
        }
    }
}

module.exports = Game;