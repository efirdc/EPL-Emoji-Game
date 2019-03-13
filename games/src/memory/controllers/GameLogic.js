import HexBoard from './HexBoard.js';
import emojiData from './EmojiData.js';

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
    MATCHED_EXITING: 41,
    COMBO: 50,
    COMBO_EXITING: 51,
    EXITING:60,
};

class Card {
    constructor (emoji, cardKey) {
        this.emoji = emoji;
        this.cardKey = cardKey;
        this.touched = false;

        this.phase = CardPhase.SPAWNING;
        this.timeAtSetPhase = Date.now();

        this.x = 0;
        this.y = 0;
        this.blobID = 0;

        this.comboCounter = 0;
    }

    setPhase(phase) {
        this.phase = phase;
        this.timeAtSetPhase = Date.now();
    }
}

export const GamePhase = {
    PLAY: 0,
    LEVEL_LOAD: 1,
    LEVEL_LOSE: 2,
    LEVEL_WIN: 3,
};

export default class GameLogic {
    constructor(initialStars) {

        this.hexBoard = new HexBoard();
        this.level = new Level();

        this.numStars = initialStars;
        this.cards = [];
        this.newCards = [];
        this.concurrentFlips = 0;
        this.comboCards = [];

        this.phase = GamePhase.LEVEL_LOAD;
        this.timeAtSetPhase = Date.now();

        this.timeLeftAtLevelWin = 0;

        // Timing stuff
        this.timeToMatch = 500;
        this.timeToExit = 1000;
        this.timeToCombo = 1500;
        this.timeToDelete = 1000;
        this.timeToSpawnCard = 80;

        this.setLevel(initialStars);

        this.compareEmojis();
    }

    setPhase(phase) {
        this.phase = phase;
        this.timeAtSetPhase = Date.now();
    }

    get comboCounter() {
        return this.comboCards.length;
    }

    // Gets the time left in a level. This is used to determine the loss condition.
    get timeLeft () {

        switch (this.phase) {

            case GamePhase.LEVEL_LOAD:
                return this.level.timeToComplete;

            case GamePhase.PLAY:
                let timeElapsed = (Date.now() - this.timeAtSetPhase) / 1000;
                return this.level.timeToComplete - timeElapsed;

            case GamePhase.LEVEL_LOSE:
                return 0;

            case GamePhase.LEVEL_WIN:
                return this.timeLeftAtLevelWin;
        }
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
    // It returns a value numCards from numCardsStart -> numCardsEnd
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

        // Reset the cards array and populate with new cards
        this.cards = [];
        this.newCards = [];
        for (let cardKey = 0; cardKey < this.level.numCards; cardKey++) {
            this.newCards[cardKey] = new Card(0, cardKey);
        }

        // Create a shuffled array of all emojis
        let emojisNeeded = this.level.numCards / 2;
        let useEmojis = [];
        for (let i = 0; i < emojisNeeded; i++){
            useEmojis.push(emojiData.sequence[i]);
            useEmojis.push(emojiData.sequence[i]);
        }
        shuffle(useEmojis);

        // Distribute the shuffled emojis over the game cards
        for (let card of this.newCards){
            card.emoji = useEmojis.pop();
        }

        // Initialize the hexboard blob, and import the blobCells data into the cards.
        this.hexBoard.initializeBlob(this.level.numCards, this.level.numBlobs);
        for (let i in this.newCards) {
            let blobCell = this.hexBoard.blobCells[i];
            let card = this.newCards[i];
            card.x = blobCell.x;
            card.y = blobCell.y;
            card.blobID = blobCell.blobID;
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

    updateGame() {

        let gameEvents = {
            gameWon: false,
            gameLost: false,
            playStart: false,
            loadStart: false,
        };
        let cardEvents;

        if (this.phase === GamePhase.LEVEL_LOAD) {
            let timeSinceLoadStart = Date.now() - this.timeAtSetPhase;
            let numActiveCards = Math.floor(timeSinceLoadStart / this.timeToSpawnCard);

            // Move cards from newCards to cards
            while (this.cards.length < numActiveCards && this.newCards.length) {
                this.cards.push(this.newCards.shift());
            }

            // When all cards are moved over, move to play phase.
            if (this.cards.length === this.level.numCards) {
                this.setPhase(GamePhase.PLAY);
                gameEvents.playStart = true;
                for (let card of this.cards) {
                    card.setPhase(CardPhase.FACE_DOWN);
                }
            }
        }
        else if (this.phase === GamePhase.PLAY) {
            cardEvents = this.updateCards();
            if (this.isGameWon()) {
                this.timeLeftAtLevelWin = this.timeLeft;
                this.setPhase(GamePhase.LEVEL_WIN);
                gameEvents.gameWon = true;
            }
            else if (this.isGameLost()) {
                this.setPhase(GamePhase.LEVEL_LOSE);
                gameEvents.gameLost = true;
            }
        }
        else if (this.phase === GamePhase.LEVEL_LOSE) {
            cardEvents = this.updateCards();
            let timeSinceLose = Date.now() - this.timeAtSetPhase;
            let numCardsShouldExit = Math.floor(timeSinceLose / this.timeToSpawnCard);

            for (let i = 0; i < Math.min(numCardsShouldExit, this.cards.length); i++) {
                let card = this.cards[i];
                if (card.phase === CardPhase.EXITING) {
                    continue;
                }
                card.setPhase(CardPhase.EXITING);
            }

            if (!this.cards.length) {
                this.setLevel(0);
                this.setPhase(GamePhase.LEVEL_LOAD);
            }
        }
        else if (this.phase === GamePhase.LEVEL_WIN) {
            let cardEvents = this.updateCards();
            let timeSinceWin = Date.now() - this.timeAtSetPhase;
            if (timeSinceWin > 2000) {
                this.setLevel(this.numStars + 5);
                this.setPhase(GamePhase.LEVEL_LOAD);
            }
        }

        return {...gameEvents, ...cardEvents};
    }

    isGameWon() {

        // Return false if an unmatched card is found
        for (let card of this.cards) {
            if (card.phase !== CardPhase.MATCHED &&
                card.phase !== CardPhase.MATCHED_EXITING &&
                card.phase !== CardPhase.COMBO &&
                card.phase !== CardPhase.COMBO_EXITING) {
                return false;
            }
        }
        return true;
    }

    isGameLost() {
        if (this.isGameWon()) {
            return false;
        }
        return this.timeLeft <= 0;
    }

    updateCards() {

        // this object is returned by this function, and stores which events have happened this update
        let eventHappened = {
            faceUp: false,
            match: false,
        };

        // Clear the combo array if time runs out to make the next match
        if (this.comboCards.length !== 0) {

            // Get the time since the last match
            let lastMatchPair = this.comboCards[this.comboCards.length - 1];
            let timeSinceLastMatch = Date.now() - lastMatchPair.first.timeAtSetPhase;

            // When time runs out,
            if (timeSinceLastMatch > this.timeToCombo) {

                // If there was only one pair (no combo) the cards should start MATCHED_EXITING
                if (this.comboCards.length === 1) {
                    lastMatchPair.first.setPhase(CardPhase.MATCHED_EXITING);
                    lastMatchPair.second.setPhase(CardPhase.MATCHED_EXITING);
                }

                // otherwise, there was a combo, so they should start COMBO_EXITING
                else {
                    for (let comboPair of this.comboCards) {
                        comboPair.first.setPhase(CardPhase.COMBO_EXITING);
                        comboPair.second.setPhase(CardPhase.COMBO_EXITING);
                    }
                }

                // Clear the comboCards
                this.comboCards = [];
            }
        }

        // Process all cards that are matchable
        let matchableCards = this.cards.filter((card) => this.canMatch(card));
        while (matchableCards.length) {

            // Get one card
            let cardA = matchableCards.pop();

            // Compare it to all other cards
            for (let i = 0; i < matchableCards.length; i++) {
                let cardB = matchableCards[i];

                // Handle matches
                if (cardA.emoji === cardB.emoji) {
                    this.concurrentFlips -= 2;
                    eventHappened.match = true;
                    matchableCards = matchableCards.splice(i, 1);
                    let matchPair = {first: cardA, second:cardB};
                    if (this.comboCards.length === 0) {
                        cardA.setPhase(CardPhase.MATCHED);
                        cardB.setPhase(CardPhase.MATCHED);
                        cardA.comboCounter = this.comboCards.length + 1;
                        cardB.comboCounter = this.comboCards.length + 1;
                    }
                    else {
                        cardA.setPhase(CardPhase.COMBO);
                        cardB.setPhase(CardPhase.COMBO);
                        cardA.comboCounter = this.comboCards.length + 1;
                        cardB.comboCounter = this.comboCards.length + 1;
                        if (this.comboCards.length === 1) {
                            let firstMatchPair = this.comboCards[0];
                            firstMatchPair.first.setPhase(CardPhase.COMBO);
                            firstMatchPair.second.setPhase(CardPhase.COMBO);
                        }
                    }
                    this.comboCards.push(matchPair);
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
                card.setPhase(CardPhase.FACE_DOWN);
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
                    card.setPhase(CardPhase.FACE_UP);
                    this.concurrentFlips += 1;
                    eventHappened.faceUp = true;
                }
            }

            // If it is no longer touched, just make it a normal FACE_DOWN card
            else {
                card.setPhase(CardPhase.FACE_DOWN);
            }
        }

        // Process cards that are FACE_DOWN
        let faceDownCards = this.cards.filter((card) => card.phase === CardPhase.FACE_DOWN);
        for (let card of faceDownCards) {

            // If the card is touched,
            if (card.touched) {

                // Flip the card up if there is available flips
                if (this.concurrentFlips < this.level.maxConcurrentFlips) {
                    card.setPhase(CardPhase.FACE_UP);
                    eventHappened.faceUp = true;
                    this.concurrentFlips += 1;
                }

                // Reject the flip if all concurrent flips are in use.
                else {
                    card.setPhase(CardPhase.FLIP_REJECTED);
                }
            }
        }

        // Handle all cards that should exit.
        //let shouldExitCards = this.cards.filter((card) => this.shouldExit(card));
        //for (let card of shouldExitCards) {
        //    card.setPhase(CardPhase.MATCHED_EXITING);
        //}

        // Handle all cards that should be deleted.
        this.cards = this.cards.filter((card) => !this.shouldDelete(card));

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

    shouldDelete(card) {
        if (card.phase !== CardPhase.EXITING && card.phase !== CardPhase.MATCHED_EXITING) {
            return false;
        }
        return Date.now() - card.timeAtSetPhase > this.timeToDelete;
    }

    getUniqueEmojis() {
        let emojis = new Set();

        // get the specials
        for (let emoji of emojiData.specials) {
            emojis.add(emoji);
        }

        // afraid of
        for (let scaredEmoji in emojiData.afraidOf) {
            emojis.add(scaredEmoji);
            for (let scaryEmoji of emojiData.afraidOf[scaredEmoji]) {
                emojis.add(scaryEmoji)
            }
        }

        for (let comboEmoji in emojiData.comboBonusWith) {
            emojis.add(comboEmoji);
            for (let comboBonusEmoji of emojiData.comboBonusWith[comboEmoji]) {
                emojis.add(comboBonusEmoji);
            }
        }

        for (let emoji of emojiData.filler) {
            emojis.add(emoji);
        }

        return Array.from(emojis);
    }

    compareEmojis() {
        let uniqueEmojis = this.getUniqueEmojis();
        let sequence = emojiData.sequence;
        let missing = []
        for (let emoji of uniqueEmojis) {
            if (!sequence.includes(emoji)) {
                missing.push(emoji);
            }
        }
        console.log(missing);
    }

}
