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
        this.timeAtFaceUp = 0;
    }
}

export default class GameLogic {
    constructor() {
        this.cards = [];
        this.levels = [];
        this.currentLevel = -1;
        this.numCards = 0;
        this.flipsUsed = 0;
        this.maxConcurrentFlips = 0;
        this.concurrentFlips = 0;
        this.levelStarted = false;
        this.timeToCompleteLevel = 0;
        this.timeAtLevelStart = Date.now();
        this.timeAtLevelWin = null;

        // Time in ms that a card must be face up before it can be matched.
        this.timeToMatch = 500;

        this.canMatch = this.canMatch.bind(this);
    }

    // Gets the time left in a level. This is used to determine the loss condition.
    get timeLeft () {

        // If the level has not yet started, then return the total time to complete the level
        if (!this.levelStarted) {
            return this.timeToCompleteLevel;
        }

        // Decrease the time left until the game ends.
        let timeElapsed;
        if (!this.isGameWon()) {
            timeElapsed = (Date.now() - this.timeAtLevelStart) / 1000;
        } else {
            timeElapsed = (this.timeAtLevelWin - this.timeAtLevelStart) / 1000;
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
        this.levelStarted = false;
        this.timeToCompleteLevel = level.timeToCompleteLevel;
        this.timeAtLevelStart = undefined;
        this.timeAtLevelWin = undefined;

        // Reset the cards array and distribute them randomly.
        this.cards = [];
        for (let cardKey = 0; cardKey < this.numCards; cardKey++) {
            this.cards[cardKey] = new Card(0, cardKey);
        }
        this.distributeCardsRandomly();
    }

    startLevel() {
        this.timeAtLevelStart = Date.now();
        this.levelStarted = true;
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

        // Get all cards that are unmatched
        let unmatchedCards = this.cards.filter((card) => !card.matched);

        // Handle releasing of cards
        for (let card of unmatchedCards) {
            let touched = touchedCards.includes(card.cardKey);

            // Face up card is released
            if (card.faceUp && !touched) {
                this.concurrentFlips -= 1;
                card.faceUp = false;
            }

            // Card with rejected flip was released.
            else if (card.flipRejected && !touched) {
                card.flipRejected = false;
            }
        }

        // Handle pressing of cards
        for (let card of unmatchedCards) {

            // Figure out if the card is touched.
            let touched = touchedCards.includes(card.cardKey);

            // If a face down card is touched
            if (!card.faceUp && touched) {

                // Flip the card up if there is available flips
                if (this.concurrentFlips < this.maxConcurrentFlips) {
                    card.faceUp = true;
                    card.flipRejected = false;
                    card.timeAtFaceUp = Date.now();
                    this.concurrentFlips += 1;
                    this.flipsUsed += 1;
                }

                // Reject the flip if all concurrent flips are in use.
                else {
                    card.flipRejected = true;
                }
            }
        }

        // Record time if game was won
        if (this.isGameWon()) {
            this.timeAtLevelWin = Date.now();
        }
    }

    // In order for a card to be matched
    // it has to be face up, not yet matched, and it must be face up for a certain amount of time
    canMatch(card) {
        let timeSinceFaceUp = Date.now() - card.timeAtFaceUp;
        return !card.matched && card.faceUp && timeSinceFaceUp > this.timeToMatch;
    }

    // Should be called every frame
    // Handles the matching delay when cards are flipped up
    tryMatchingCards() {
        let matchableCards = this.cards.filter(this.canMatch);
        let matchHappened = false;
        for (let cardA of matchableCards) {
            for (let cardB of matchableCards) {
                if (cardA !== cardB && cardA.matchID === cardB.matchID && !cardA.matched) {
                    cardA.matched = cardB.matched = true;
                    this.concurrentFlips -= 2;
                    matchHappened = true;
                }
            }
        }
        return matchHappened;
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
