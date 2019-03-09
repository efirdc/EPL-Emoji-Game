import HexBoard from './HexBoard.js';

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
    constructor () {
        this.numCards = 0;
        this.maxConcurrentFlips = 0;
        this.timeToComplete = 0;
        this.numBlobs = 0;
    }
}

export const CardPhase = {
    SPAWNING: 0,
    FACE_DOWN: 1,
    FACE_UP: 2,
    FLIP_REJECTED: 30,
    MATCHED: 40,
    EXITING: 50,
};

class Card {
    constructor (matchID, cardKey) {
        this.matchID = matchID;
        this.cardKey = cardKey;
        this.touched = false;

        this._phase = CardPhase.SPAWNING;
        this.timeAtSetPhase = Date.now();

        this.x = 0;
        this.y = 0;
        this.blobID = 0;
    }

    set phase(phase) {
        this._phase = phase;
        this.timeAtSetPhase = Date.now();
    }

    get phase() {
        return this._phase;
    }
}

export default class GameLogic {
    constructor() {

        this.hexBoard = new HexBoard();
        this.level = new Level();

        this.numStars = 0;
        this.cards = [];
        this.concurrentFlips = 0;
        this.levelStarted = false;
        this.timeAtLevelStart = Date.now();
        this.timeAtLevelWin = null;

        // Time in ms that a card must be face up before it can be matched.
        this.timeToMatch = 500;
        this.timeToExit = 1000;
        this.timeToCombo = 750;

        this.canMatch = this.canMatch.bind(this);
        this.shouldExit = this.shouldExit.bind(this);
    }

    // Gets the time left in a level. This is used to determine the loss condition.
    get timeLeft () {

        // If the level has not yet started, then return the total time to complete the level
        if (!this.levelStarted) {
            return this.level.timeToComplete;
        }

        // Decrease the time left until the game ends.
        let timeElapsed;
        if (!this.isGameWon()) {
            timeElapsed = (Date.now() - this.timeAtLevelStart) / 1000;
        } else {
            timeElapsed = (this.timeAtLevelWin - this.timeAtLevelStart) / 1000;
        }
        return this.level.timeToComplete - timeElapsed;
    }

    getLevel(numStars) {
        let level = new Level();
        const starBrackets = [

            // First bracket only has one blob, so start with a small amount of cards and increase slowly
            {numStars: 0, numBlobs: 1, numCardsStart: 20, numCardsEnd: 40,
                maxConcurrentFlips: 6, timeToCompleteLevel: 100},

            // Adding a blob for the first time, so reduce the number of cards by a bit at the start
            {numStars: 20, numBlobs: 2, numCardsStart: 36, numCardsEnd: 60,
                maxConcurrentFlips: 8, timeToCompleteLevel: 100},

            // Reduce by a bit again for the third blob, but not as much.
            {numStars: 40, numBlobs: 3, numCardsStart: 54, numCardsEnd: 90,
                maxConcurrentFlips: 10, timeToCompleteLevel: 100},

            // Should get hard to manage here for 2 players.
            // Only reduce cards by a little bit
            {numStars: 60, numBlobs: 4, numCardsStart: 86, numCardsEnd: 120,
                maxConcurrentFlips: 12, timeToCompleteLevel: 100},

            // If they get this far they should be pretty good, so no more going easy
            // Keep increasing cards, and dont increase concurrent flips this time
            {numStars: 80, numBlobs: 5, numCardsStart: 122, numCardsEnd: 150,
                maxConcurrentFlips: 12, timeToCompleteLevel: 100},

            // Once we pass this point, go into "endurance mode"
            {numStars: 100, enduranceMode: true},
        ];

        let starBracket, nextStarBracket;
        for (let currStarBracket of starBrackets) {
            if (currStarBracket.numStars > numStars) {
                nextStarBracket = currStarBracket;
                break;
            }
            starBracket = currStarBracket;
        }

        if (starBracket.enduranceMode) {
            // not yet defined
            return level;
        }

        level.numBlobs = starBracket.numBlobs;
        level.numCards = this.interpolateNumCards(
            numStars,
            starBracket.numStars,
            nextStarBracket.numStars,
            starBracket.numCardsStart,
            starBracket.numCardsEnd
        );
        level.timeToComplete = starBracket.timeToCompleteLevel;
        level.maxConcurrentFlips = starBracket.maxConcurrentFlips;
        return level;
    }

    // Say we want numCards to go from 40 -> 80 as numStars goes from 50 -> 70. This function does exactly that.
    // This returns a value numCards from numCardsStart -> numCardsEnd
    // depending on how far along numStars is from starBracketStart -> starBracketEnd
    // It also always rounds numCards to the nearest 2, and its maximum value is the size of the hexBoard
    interpolateNumCards(numStars, starBracketStart, starBracketEnd, numCardsStart, numCardsEnd) {

        // Do "inverse linear interpolation" to figure out t value
        // t is a value on [0, 1] domain that measures how far along numStars is in this star difficulty bracket
        let t = (numStars - starBracketStart) / (starBracketEnd - starBracketStart);

        // Do linear interpolation with t to get the number of cards
        let numCards = (1.0 - t) * numCardsStart + t * numCardsEnd;

        // Round down to the nearest int
        numCards = Math.floor(numCards);

        // If the number of cards is odd, make it even
        // This basically works by turning off the first bit (using bitwise operations)
        numCards = numCards & (~1);

        // Limit the number of cards by the size of the hexboard
        numCards = Math.min(numCards, this.hexBoard.boardCells.length);

        return numCards;
    }

    // Sets the current level for the memory game
    setLevel(numStars) {

        this.numStars = numStars;

        // Get the level settings
        this.level = this.getLevel(numStars);

        // Initialize level state data
        this.concurrentFlips = 0;
        this.levelStarted = false;
        this.timeAtLevelStart = undefined;

        // Reset the cards array and populate with new cards
        this.cards = [];
        for (let cardKey = 0; cardKey < this.level.numCards; cardKey++) {
            this.cards[cardKey] = new Card(0, cardKey);
        }

        // Create a shuffled array of all matchIDs
        let matchIDs = [];
        let numMatchIDs = this.level.numCards / 2;
        for (let i = 0; i < numMatchIDs; i++){
            matchIDs.push(i);
            matchIDs.push(i);
        }
        shuffle(matchIDs);

        // Distribute the shuffled matchIDs over the game cards
        for (let card of this.cards){
            card.matchID = matchIDs.pop();
        }

        // Initialize the hexboard blob, and import the blobCells data into the cards.
        this.hexBoard.initializeBlob(this.level.numCards, this.level.numBlobs);
        for (let i in this.cards) {
            let blobCell = this.hexBoard.blobCells[i];
            let card = this.cards[i];
            card.x = blobCell.x;
            card.y = blobCell.y;
            card.blobID = blobCell.blobID;
        }
    }

    startLevel() {
        this.timeAtLevelStart = Date.now();
        this.levelStarted = true;
        this.timeAtLevelWin = undefined;
        for (let card of this.cards) {
            card.phase = CardPhase.FACE_DOWN;
        }
    }

    touchStart(cardKey) {
        let card = this.cards.find((card) => (card.cardKey === cardKey));
        if(!card) {
            console.log("WARNING: touchStart on cardKey" + cardKey + " that does not exist!");
            return;
        }
        if (card.touched) {
            console.log("WARNING: touchStart on cardKey" + cardKey + " that is already touuched!");
        }
        card.touched = true;
    }
    touchEnd(cardKey) {
        let card = this.cards.find((card) => (card.cardKey === cardKey));
        if(!card) {
            console.log("WARNING: touchEnd on cardKey" + cardKey + " that does not exist!");
            return;
        }
        if (!card.touched) {
            console.log("WARNING: touchEnd on cardKey" + cardKey + " that is not touuched!");
        }
        card.touched = false;
    }


    updateCards() {

        // this object is returned by this function, and stores which events have happened this update
        let eventHappened = {
            faceUp: false,
            match: false,
        };

        // Process all cards that are matchable
        let matchableCards = this.cards.filter(this.canMatch);
        while (matchableCards.length) {

            // Get one card
            let cardA = matchableCards.pop();

            // Compare it to all other cards
            for (let i = 0; i < matchableCards.length; i++) {
                let cardB = matchableCards[i];

                // Handle matches
                if (cardA.matchID === cardB.matchID) {
                    cardA.phase = cardB.phase = CardPhase.MATCHED;
                    this.concurrentFlips -= 2;
                    eventHappened.match = true;
                    matchableCards = matchableCards.splice(i, 1);
                    break;
                }
            }
        }

        // Handle releasing FACE_UP cards
        let faceUpCards = this.cards.filter((card) => card.phase === CardPhase.FACE_UP);
        for (let card of faceUpCards) {

            // If the card isn't touched, release it.
            if (!card.touched) {
                this.concurrentFlips -= 1;
                card.phase = CardPhase.FACE_DOWN;
            }
        }

        // Shuffle the FLIP_REJECTED cards so there is no bias in the order that they flip.
        let flipRejectedCards = this.cards.filter((card) => card.phase === CardPhase.FLIP_REJECTED);
        shuffle(flipRejectedCards);

        // Process all the FLIP_REJECTED cards
        for (let card of flipRejectedCards) {

            // If the card is touched,
            if (card.touched) {

                // Flip it if concurrentFlips are not in use.
                if (this.concurrentFlips < this.level.maxConcurrentFlips) {
                    card.phase = CardPhase.FACE_UP;
                    this.concurrentFlips += 1;
                    eventHappened.faceUp = true;
                }
            }

            // If it is no longer touched, just make it a normal FACE_DOWN card
            else {
                card.phase = CardPhase.FACE_DOWN;
            }
        }

        // Process cards that are FACE_DOWN
        let faceDownCards = this.cards.filter((card) => card.phase === CardPhase.FACE_DOWN);
        for (let card of faceDownCards) {

            // If the card is touched,
            if (card.touched) {

                // Flip the card up if there is available flips
                if (this.concurrentFlips < this.level.maxConcurrentFlips) {
                    card.phase = CardPhase.FACE_UP;
                    eventHappened.faceUp = true;
                    this.concurrentFlips += 1;
                }

                // Reject the flip if all concurrent flips are in use.
                else {
                    card.phase = CardPhase.FLIP_REJECTED;
                }
            }
        }

        // Handle all cards that should exit.
        let shouldExitCards = this.cards.filter(this.shouldExit);
        for (let card of shouldExitCards) {
            card.phase = CardPhase.EXITING;
        }

        return eventHappened;
    }

    // In order for a card to be matched it has to be face up for a certain amount of time
    canMatch(card) {
        if (card.phase !== CardPhase.FACE_UP) {
            return false;
        }
        return Date.now() - card.timeAtSetPhase > this.timeToMatch;
    }

    shouldExit(card) {
        if (card.phase !== CardPhase.MATCHED) {
            return false;
        }
        return Date.now() - card.timeAtSetPhase > this.timeToExit;
    }

    isGameWon() {

        // Return false if an unmatched card is found
        for (let card of this.cards) {
            if (card.phase !== CardPhase.MATCHED && card.phase !== CardPhase.EXITING) {
                return false;
            }
        }

        // If all cards are face up then record the win time and return true
        if (!this.timeAtLevelWin) {
            this.timeAtLevelWin = Date.now()
        }
        return true;
    }

    isGameLost() {
        if (this.isGameWon()) {
            return false;
        }
        return this.timeLeft <= 0;
    }
}
