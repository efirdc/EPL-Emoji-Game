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
    MATCHED_SPECIAL_THIS: 41,
    MATCHED_SPECIAL_OTHER: 42,
    EXITING:60,
};

class Card {
    constructor (emoji, cardKey) {

        this.emoji = emoji;
        this.cardKey = cardKey;
        this.touched = false;

        this.specialMatch = false;
        this.comboCounter = 1;

        this.x = 0;
        this.y = 0;
        this.blobID = 0;

        this.setPhase(CardPhase.SPAWNING);
    }

    setPhase(phase) {
        this.prevPhase = this.phase;
        this.phase = phase;
        this.timeAtSetPhase = Date.now();

        switch(phase) {
            case CardPhase.SPAWNING:
                this.faceUp = false;
                this.flipRejected = false;
                this.matched = false;
                this.specialMatch = false;
                this.exiting = false;
                break;
            case CardPhase.FACE_DOWN:
                this.faceUp = false;
                this.flipRejected = false;
                break;
            case CardPhase.FLIP_REJECTED:
                this.faceUp = false;
                this.flipRejected = true;
                break;
            case CardPhase.FACE_UP:
                this.faceUp = true;
                this.flipRejected = false;
                document.dispatchEvent(new CustomEvent("faceUp"));
                break;
            case CardPhase.MATCHED:
                this.matched = true;
                this.specialMatch = false;
                break;
            case CardPhase.MATCHED_SPECIAL_THIS:
            case CardPhase.MATCHED_SPECIAL_OTHER:
                this.matched = true;
                this.specialMatch = true;
                break;
            case CardPhase.EXITING:
                this.exiting = true;
                break;
        }
    }

    comboBonusWith(otherCard) {
        let thisCombos = false;
        let otherCombos = false;
        if (emojiData.comboBonusWith[this.emoji]) {
            thisCombos = emojiData.comboBonusWith[this.emoji].includes(otherCard.emoji);
        }
        else if (emojiData.comboBonusWith[otherCard.emoji]) {
            otherCombos = emojiData.comboBonusWith[otherCard.emoji].includes(this.emoji);
        }
        return thisCombos || otherCombos;
    }
}

export const GamePhase = {
    GAME_INIT: 0,
    PLAY: 1,
    LEVEL_LOAD: 2,
    LEVEL_LOSE: 3,
    LEVEL_WIN: 4,
};

export default class GameLogic {
    constructor() {

        this.hexBoard = new HexBoard();
        this.level = new Level();

        this.numStars = 0;
        this.cards = [];
        this.newCards = [];
        this.concurrentFlips = 0;
        this.comboCards = [];
        this.comboCounter = 0;
        this.comboScore = 0;

        this.phase = GamePhase.GAME_INIT;
        this.timeAtSetPhase = Date.now();

        this.timeLeftAtLevelWin = 0;

        // Timing stuff
        this.timeToMatch = 250;
        this.timeToCombo = 2250;
        this.timeBetweenCombos = 750;
        this.timeToDelete = 1000;
        this.timeToSpawnCard = 100;
        this.timeToTransitionToLoad = 4000;

        this.setLevel(this.numStars);

        this.flipCheat = false;
        this.winCheat = false;
        this.loseCheat = false;
        this.controlCheats = this.controlCheats.bind(this);
        document.addEventListener("keypress", this.controlCheats);
    }

    controlCheats(keyEvent) {

        // 1 key
        if (keyEvent.charCode === 49) {
            this.flipCheat = !this.flipCheat;
        }
        else if (keyEvent.charCode === 50) {
            this.winCheat = true;
        }
        else if (keyEvent.charCode === 51) {
            this.loseCheat = true;
        }
    }

    setPhase(phase, dontSentEvent) {
        this.phase = phase;
        this.timeAtSetPhase = Date.now();

        if (dontSentEvent) {
            return;
        }

        switch (phase) {
            case GamePhase.PLAY:
                document.dispatchEvent(new CustomEvent("levelplay"));
                break;
            case GamePhase.LEVEL_LOAD:
                document.dispatchEvent(new CustomEvent("levelload"));
                break;
            case GamePhase.LEVEL_LOSE:
                document.dispatchEvent(new CustomEvent("levellose"));
                break;
            case GamePhase.LEVEL_WIN:
                document.dispatchEvent(new CustomEvent("levelwin"));
                break;
        }
    }

    // Gets the time left in a level. This is used to determine the loss condition.
    get timeLeft () {

        if (this.numStars === 0) {
            return Infinity;
        }

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
                maxConcurrentFlips: 6, timeToCompleteLevel: 60},

            // Adding a blob for the first time, so reduce the number of cards by a bit at the start
            {numStars: 20, numBlobs: 2, numCardsStart: 36, numCardsEnd: 60,
                maxConcurrentFlips: 8, timeToCompleteLevel: 90},

            // Reduce by a bit again for the third blob, but not as much.
            {numStars: 40, numBlobs: 3, numCardsStart: 54, numCardsEnd: 90,
                maxConcurrentFlips: 10, timeToCompleteLevel: 120},

            // Should get hard to manage here for 2 players.
            // Only reduce cards by a little bit
            {numStars: 60, numBlobs: 4, numCardsStart: 86, numCardsEnd: 120,
                maxConcurrentFlips: 12, timeToCompleteLevel: 150},

            // If they get this far they should be pretty good, so no more going easy
            // Keep increasing cards, and dont increase concurrent flips this time
            {numStars: 80, numBlobs: 5, numCardsStart: 122, numCardsEnd: 150,
                maxConcurrentFlips: 12, timeToCompleteLevel: 150},

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
        this.comboCounter = 0;
        this.comboScore = 0;

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

        // Dirty if statement for handling cheats
        if (this.phase === GamePhase.PLAY || this.phase === GamePhase.LEVEL_WIN || this.phase === GamePhase.LEVEL_LOAD) {
            if (this.winCheat) {
                this.winCheat = false;
                this.setLevel(this.numStars + 5);
                this.setPhase(GamePhase.LEVEL_LOAD, true);
            }
            else if (this.loseCheat) {
                this.loseCheat = false;
                this.setPhase(GamePhase.LEVEL_LOSE, true);
            }
        }

        // Game is only in the INIT phase at first launch.
        // This is really just an awful way of triggering the loadStart event.
        if (this.phase === GamePhase.GAME_INIT) {
            this.setPhase(GamePhase.LEVEL_LOAD);
        }

        // Level loading phase
        if (this.phase === GamePhase.LEVEL_LOAD) {

            // Disable the flipCheat
            this.flipCheat = false;

            // The time since load start determines how many cards should be spawned in
            let timeSinceLoadStart = Date.now() - this.timeAtSetPhase;
            let numActiveCards = Math.floor(timeSinceLoadStart / this.timeToSpawnCard);

            // Move cards from newCards to cards to spawn the cards in
            while (this.cards.length < numActiveCards && this.newCards.length) {
                this.cards.push(this.newCards.shift());
            }

            // When all cards are spawned in, move to play phase.
            if (this.cards.length === this.level.numCards) {
                this.setPhase(GamePhase.PLAY);

                // Initialize cards to FACE_DOWN state.
                for (let card of this.cards) {
                    card.setPhase(CardPhase.FACE_DOWN);
                }
            }
        }

        // Main PLAY phase. Updates the cards and checks if the game is won/lost.
        else if (this.phase === GamePhase.PLAY) {
            this.updateCards();
            if (this.isGameWon()) {
                this.timeLeftAtLevelWin = this.timeLeft;
                this.setPhase(GamePhase.LEVEL_WIN);
            }
            else if (this.isGameLost()) {
                this.setPhase(GamePhase.LEVEL_LOSE);
            }
        }

        // Lose transition phase.
        else if (this.phase === GamePhase.LEVEL_LOSE) {

            // Doesnt hurt to let the user interact with cards (removing this might cause a bug actually)
            this.updateCards();

            // Time since the lose event determines how many cards should be exiting
            let timeSinceLose = Date.now() - this.timeAtSetPhase;
            let numCardsShouldExit = Math.floor(timeSinceLose / this.timeToSpawnCard);

            // This is kind of dumb because EXITING cards are removed from this.cards.
            // So the rate that cards exit the scene actually increases during the transition
            // but that is actually kind of a nice effect so lets keep it
            for (let i = 0; i < Math.min(numCardsShouldExit, this.cards.length); i++) {
                let card = this.cards[i];
                if (card.phase === CardPhase.EXITING) {
                    continue;
                }
                card.setPhase(CardPhase.EXITING);
            }

            // Once all cards have exited, move to LEVEL_LOAD phase.
            if (!this.cards.length) {
                this.setLevel(0);
                this.setPhase(GamePhase.LEVEL_LOAD);
            }
        }

        // Handle game win transition.
        else if (this.phase === GamePhase.LEVEL_WIN) {
            this.updateCards();
            let timeSinceWin = Date.now() - this.timeAtSetPhase;
            if (timeSinceWin > this.timeToTransitionToLoad) {
                this.setLevel(this.numStars + this.getNumStarsFromPerformance());
                this.setPhase(GamePhase.LEVEL_LOAD);
            }
        }
    }

    isGameWon() {

        // Return false if an unmatched card is found
        for (let card of this.cards) {
            if (!card.matched) {
                return false;
            }
        }
        return true;
    }

    isGameLost() {
        if (this.isGameWon()) {
            return false;
        }
        if (this.comboCounter !== 0) {
            return false;
        }
        return this.timeLeft <= 0;
    }

    updateCards() {

        // Clear the combo array if time runs out to make the next match
        if (this.comboCards.length !== 0) {

            // Get the time since the last match
            let lastMatchPair = this.comboCards[this.comboCards.length - 1];
            let timeSinceLastMatch = Date.now() - lastMatchPair.first.timeAtSetPhase;

            // When time runs out,
            if (timeSinceLastMatch > this.timeToCombo) {

                // the cards should start MATCHED_EXITING
                for (let comboPair of this.comboCards) {
                    comboPair.first.setPhase(CardPhase.EXITING);
                    comboPair.second.setPhase(CardPhase.EXITING);
                }

                // Clear the comboCards
                this.comboCards = [];
                this.comboCounter = 0;
            }
        }

        // Get the time since the last match
        let timeSinceLastMatch = Infinity;
        if (this.comboCards.length) {
            let lastMatch = this.comboCards[this.comboCards.length - 1];
            timeSinceLastMatch = Date.now() - lastMatch.first.timeAtSetPhase;
        }

        // Process all cards that are matchable
        let matchableCards = this.cards.filter((card) => this.canMatch(card));

        // If the time between combos is over
        while (matchableCards.length && timeSinceLastMatch > this.timeBetweenCombos) {

            // Get one card
            let cardA = matchableCards.pop();

            // Compare it to all other cards
            for (let i = 0; i < matchableCards.length; i++) {
                let cardB = matchableCards[i];

                // Handle matches
                if (cardA.emoji === cardB.emoji) {

                    // Update important things
                    this.comboCounter += 1;
                    this.concurrentFlips -= 2;

                    // Remove cardB from matchableCards so it isnt tested anymore
                    matchableCards = matchableCards.splice(i, 1);

                    // Check if another matched pair has a combo bonus with this pair
                    let comboBonus = 0;
                    let specialComboPairs = [];
                    for (let comboPair of this.comboCards) {
                        if (cardA.comboBonusWith(comboPair.first)) {
                            comboBonus += 2;
                            comboPair.first.setPhase(CardPhase.MATCHED_SPECIAL_OTHER);
                            comboPair.second.setPhase(CardPhase.MATCHED_SPECIAL_OTHER);
                            specialComboPairs.push(comboPair);
                        }
                    }

                    // Set the card phase
                    if (comboBonus !== 0) {
                        cardA.setPhase(CardPhase.MATCHED_SPECIAL_THIS);
                        cardB.setPhase(CardPhase.MATCHED_SPECIAL_THIS);
                    } else {
                        cardA.setPhase(CardPhase.MATCHED);
                        cardB.setPhase(CardPhase.MATCHED);
                    }

                    // Set the combo counter
                    this.comboCounter += comboBonus;
                    cardA.comboCounter = this.comboCounter;
                    cardB.comboCounter = this.comboCounter;

                    // Add the combo pair to the comboCards array
                    let matchPair = {first: cardA, second:cardB};
                    this.comboCards.push(matchPair);

                    // Fire events
                    this.fireMatchEvent(matchPair);
                    for (let comboPair of specialComboPairs) {
                        this.fireMatchSpecialOther(matchPair, comboPair);
                    }

                    // add to the combo score for this match
                    this.comboScore += this.getComboScore(this.comboCounter, cardA.specialMatch);
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
                if ((this.concurrentFlips < this.level.maxConcurrentFlips) || this.flipCheat) {
                    card.setPhase(CardPhase.FACE_UP);
                    this.concurrentFlips += 1;

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
                if ((this.concurrentFlips < this.level.maxConcurrentFlips) || this.flipCheat) {
                    card.setPhase(CardPhase.FACE_UP);
                    this.concurrentFlips += 1;
                }

                // Reject the flip if all concurrent flips are in use.
                else {
                    card.setPhase(CardPhase.FLIP_REJECTED);
                }
            }
        }

        // Handle all cards that should be deleted.
        this.cards = this.cards.filter((card) => !this.shouldDelete(card));
    }

    // In order for a card to be matched it has to be face up for a certain amount of time
    canMatch(card) {
        if (card.phase !== CardPhase.FACE_UP) {
            return false;
        }
        return Date.now() - card.timeAtSetPhase > this.timeToMatch;
    }

    shouldDelete(card) {
        if (!card.exiting) {
            return false;
        }
        return Date.now() - card.timeAtSetPhase > this.timeToDelete;
    }

    getComboScore(combo, specialCombo) {
        let scores = [1.0, 1.5, 1.5, 1.75, 1.75, 1.75, 2.0, 2.0, 2.0, 2.25];
        let scoresIndex = Math.min(combo - 1, scores.length - 1);
        let multiplier = 1.0;
        if (specialCombo) {
            multiplier = 2.0;
        }
        return scores[scoresIndex] * multiplier;
    }

    getNumStarsFromComboScore() {
        let numMatches = this.level.numCards / 2;
        if (this.comboScore < numMatches * 1.25) {
            return 1;
        }
        else if (this.comboScore < numMatches * 1.5) {
            return 2;
        }
        else if (this.comboScore < numMatches * 1.75) {
            return 3;
        }
        else if (this.comboScore < numMatches * 2.0) {
            return 4;
        }
        else {
            return 5;
        }
    }

    getNumStarsFromTimeRemaining() {
        let timeLeftPercent = this.timeLeftAtLevelWin / this.level.timeToComplete;
        if (timeLeftPercent < 0.2) {
            return 0;
        }
        else if (timeLeftPercent < 0.4) {
            return 1;
        }
        else {
            return 2;
        }
    }

    getNumStarsFromPerformance() {
        return Math.min(5, this.getNumStarsFromComboScore() + this.getNumStarsFromTimeRemaining());
    }

    fireMatchEvent(matchPair) {
        let matchEvent = new CustomEvent("match", {
            detail: {
                matchPair: matchPair,
                comboScore: this.getComboScore(matchPair.first.comboCounter, matchPair.first.specialMatch),
            }
        });
        document.dispatchEvent(matchEvent);
    }

    // Fired when a special combo happens, so the other "combo'd" match pair can emit particles too.
    fireMatchSpecialOther(matchPair, otherMatchPair) {
        let matchEvent = new CustomEvent("matchspecialother", {
            detail: {
                matchPair: otherMatchPair,
                comboScore: this.getComboScore(matchPair.first.comboCounter, matchPair.first.specialMatch),
            }
        });
        document.dispatchEvent(matchEvent);
    }

    // These two functions are just for debugging and figuring out which Emojis are used.
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
        let missing = [];
        for (let emoji of uniqueEmojis) {
            if (!sequence.includes(emoji)) {
                missing.push(emoji);
            }
        }
        console.log(missing);
    }
}
