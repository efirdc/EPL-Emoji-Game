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

class Level {
    constructor (size, flips, maxConcurrentFlips) {
        if (size % 2 !== 0) {
            console.log("Warning: Created a level with an odd number of cards.")
        }
        this.size = size;
        this.flips = flips;
        this.maxConcurrentFlips = maxConcurrentFlips;
    }
}

class Card {
    constructor (matchID, cardKey) {
        this.matchID = matchID;
        this.cardKey = cardKey;
        this.faceUp = false;
        this.matched = false;
    }
}

// Constructor for the main Game class
// Consider this class the "Controller" in the Model-View-Controller (MVC) programming pattern
export default class GameLogic {
    constructor() {
        this.cards = [];
        this.levels = [];
        this.currentLevel = -1;
        this.size = 0;
        this.initialFlips = 0;
        this.flipsLeft = 0;
        this.maxConcurrentFlips = 0;
    }

    // Add new levels to the memory game at runtime
    addLevel(size, flips, maxConcurrentFlips) {
        this.levels.push(new Level(size, flips, maxConcurrentFlips))
    }

    // Advance to the next level
    nextLevel() {
        let newLevelID = this.currentLevel + 1;
        if (newLevelID >= this.levels.length) {
            newLevelID = 0;
        }
        this.setLevel(newLevelID);
    }

    // Sets the current level for the memory game
    setLevel(levelID) {

        // Get the level data
        let level = this.levels[levelID];

        // Error check
        if (level === undefined) {
            console.log("Error: Undefined levelID for setLevel()");
        }

        // Load the level settings
        this.currentLevel = levelID;
        this.size = level.size;
        this.maxConcurrentFlips = level.maxConcurrentFlips;
        this.initialFlips = level.flips;
        this.flipsLeft = level.flips;

        // Reset the cards array and distribute them randomly.
        this.cards = [];
        for (let cardKey = 0; cardKey < this.size; cardKey++) {
            this.cards[cardKey] = new Card(0, cardKey);
        }
        this.distributeCardsRandomly();
    }


    distributeCardsRandomly() {

        // Create a shuffled array of all matchIDs
        let matchIDs = [];
        let numMatchIDs = this.size / 2;
        for (let i = 0; i < numMatchIDs; i++){
            matchIDs.push(i);
            matchIDs.push(i);
        }
        shuffle(matchIDs);

        // Distribute the shuffled matchIDs over the game cards
        for (let card of this.cards){
            card.matchID = matchIDs.pop();
        }
    }

    pressCard(cardKey) {

        // get card and error check
        if (this.size <= cardKey){
            console.log("Error: cardKey out of range in pressCard()");
            return;
        }
        let card = this.cards[cardKey];
        if (card.faceUp) {
            console.log("Error: pressCard(" + cardKey + ") on card that is not flipped.");
            return;
        }

        // Set the card as faceUp and reduce flips by 1
        card.faceUp = true;
        this.flipsLeft -= 1;

        // If the card with a matching ID is also faceUp, set the matched flag on both cards
        for (let compareCard of this.cards) {
            if (compareCard !== card && card.matchID === compareCard.matchID && compareCard.faceUp) {
                compareCard.matched = card.matched = true;
            }
        }
    }

    releaseCard(cardKey) {

        // get card and error check
        if (this.size <= cardKey) {
            console.log("Error: cardKey out of range in releaseCard()");
        }
        let card = this.cards[cardKey];
        if (!card.faceUp) {
            console.log("Error: releaseCard(" + cardKey + ") on card that is not flipped.");
        }
        if (card.matched) {
            console.log("Error: releaseCard(" + cardKey + ") on card that is matched.");
        }

        card.faceUp = false;
    }

    isGameWon() {

        // Return false when a not faceUp card is found
        for (let card of this.cards) {
            if (!card.faceUp) {
                return false;
            }
        }

        // Return true if all cards are faceUp
        return true;
    }

    isGameLost() {
        return this.flipsLeft <= 0;
    }
}
