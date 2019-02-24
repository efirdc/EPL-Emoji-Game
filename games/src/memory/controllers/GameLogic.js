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
    constructor (numCards, maxConcurrentFlips, timeToComplete) {
        if (numCards % 2 !== 0) {
            console.log("Warning: Created a level with an odd number of cards.")
        }
        this.numCards = numCards;
        this.maxConcurrentFlips = maxConcurrentFlips;
        this.timeToCompleteLevel = timeToComplete;
    }
}

class Card {
    constructor (matchID, cardKey) {
        this.matchID = matchID;
        this.cardKey = cardKey;
        this.faceUp = false;
        this.matched = false;
        this.flipRejected = false;
    }
}

// Constructor for the main Game class
// Consider this class the "Controller" in the Model-View-Controller (MVC) programming pattern
export default class GameLogic {
    constructor() {
        this.cards = [];
        this.levels = [];
        this.currentLevel = -1;
        this.numCards = 0;
        this.flipsUsed = 0;
        this.maxConcurrentFlips = 0;
        this.concurrentFlips = 0;
        this.timeToCompleteLevel = 0;
        this.timeAtLevelStart = Date.now();
        this.timeAtLevelWin = null;
    }

    get timeLeft () {
        let timeElapsed;
        if (this.isGameWon()) {
            timeElapsed = (this.timeAtLevelWin - this.timeAtLevelStart) / 1000;
        } else {
            timeElapsed = (Date.now() - this.timeAtLevelStart) / 1000;
        }
        return this.timeToCompleteLevel - timeElapsed;
    }

    // Add new levels to the memory game at runtime
    addLevel(numCards, maxConcurrentFlips, timeToComplete) {
        this.levels.push(new Level(numCards, maxConcurrentFlips, timeToComplete))
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
        this.numCards = level.numCards;
        this.flipsUsed = 0;
        this.maxConcurrentFlips = level.maxConcurrentFlips;
        this.concurrentFlips = 0;
        this.timeToCompleteLevel = level.timeToCompleteLevel;
        this.timeAtLevelStart = Date.now();
        this.timeAtLevelWin = undefined;

        // Reset the cards array and distribute them randomly.
        this.cards = [];
        for (let cardKey = 0; cardKey < this.numCards; cardKey++) {
            this.cards[cardKey] = new Card(0, cardKey);
        }
        this.distributeCardsRandomly();
    }

    distributeCardsRandomly() {

        // Create a shuffled array of all matchIDs
        let matchIDs = [];
        let numMatchIDs = this.numCards / 2;
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

    setTouches(touchedCards) {

        for (let card of this.cards) {

            // Cant interact with matched cards.
            if (card.matched) {
                continue;
            }

            // Figure out if the card is touched.
            let touched = touchedCards.includes(card.cardKey);

            // Face down card is touched
            if (!card.faceUp && touched) {

                // Reject the flip if all concurrent flips are in use.
                if (this.concurrentFlips < this.maxConcurrentFlips) {
                    card.faceUp = true;
                    card.flipRejected = false;
                    this.concurrentFlips += 1;
                    this.flipsUsed += 1;
                    this.tryMatch(card);
                } else {
                    card.flipRejected = true;
                }
            }

            // Face up card is released
            else if (card.faceUp && !touched) {
                this.concurrentFlips -= 1;
                card.faceUp = false;
            }

            // Card with rejected flip was released.
            else if (card.flipRejected && !touched) {
                card.flipRejected = false;
            }
        }

        // Record time if game was won
        if (this.isGameWon()) {
            this.timeAtLevelWin = Date.now();
        }
    }

    tryMatch(card) {
        // If the card with a matching ID is also faceUp, set the matched flag on both cards
        for (let compareCard of this.cards) {
            if (compareCard !== card && card.matchID === compareCard.matchID && compareCard.faceUp) {
                compareCard.matched = card.matched = true;
                this.concurrentFlips -= 2;
            }
        }
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
        if (this.isGameWon()) {
            return false;
        }
        return this.timeLeft <= 0;
    }
}
