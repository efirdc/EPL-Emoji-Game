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
        this.numStars = 0;
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
    AFRAID: 31,
    COMBO_BROKEN: 32,
    COMBO_BREAKER_AFRAID: 33,
    COMBO_BREAKER_SHOCKED: 34,
    COMBO_BREAKER_BURNED: 35,
    MATCHED: 40,
    MATCHED_SPECIAL_THIS: 41,
    MATCHED_SPECIAL_OTHER: 42,
    SHOCKED: 50,
    BURNED: 60,
};

class Card {
    static timeToBurn = 5000;

    constructor(emoji, cardKey) {

        this.emoji = emoji;
        this.cardKey = cardKey;
        this._touched = false;
        this.comboCounter = 1;
        this._exiting = false;
        this.timeAtStartExit = 0;
        this.timeAtLastScaryCard = 0;
        this.timeAtTouch = 0;
        this.timeAtUntouch = 0;

        this._onFire = false;
        this.timeAtOnFire = 0;

        this.x = 0;
        this.y = 0;
        this.blobID = 0;

        this.setPhase(CardPhase.SPAWNING);
    }

    set touched(newValue) {
        if (newValue && !this.touched) {
            this.timeAtTouch = Date.now();
        }
        else if (!newValue && this.touched) {
            this.timeAtUntouch = Date.now();
        }
        this._touched = newValue;
    }

    get touched() {
        return this._touched;
    }

    set onFire(newValue) {

        if (!this._onFire && newValue) {
            this.numIgnitions = 0;
            this.timeAtOnFire = Date.now();
            document.dispatchEvent(new CustomEvent(
                "cardignite",
                {detail: {card: this}}
            ));
        }
        this._onFire = newValue;
    }

    get onFire() {
        return this._onFire;
    }

    get burnPercent() {
        if (!this.onFire) {
            return 0;
        }
        let timeSinceBurn = Date.now() - this.timeAtOnFire;
        return timeSinceBurn / Card.timeToBurn;
    }

    setPhase(phase) {

        // Store the new phase, the previous phase, and a timestamp
        this.prevPhase = this.phase;
        this.phase = phase;
        this.timeAtSetPhase = Date.now();

        if (!this.isBurnable) {
            this.onFire = false;
        }

        // Trigger events and side effects
        switch (phase) {
            case CardPhase.FACE_UP:
                if (this.emoji === '⚡') {
                    this.hasShocked = false;
                }
                if (this.onFire && Math.random() > this.burnPercent) {
                    this.onFire = false;
                }
                document.dispatchEvent(new CustomEvent("faceUp"));
                break;
            case CardPhase.AFRAID:
            case CardPhase.COMBO_BREAKER_AFRAID:
                document.dispatchEvent(new CustomEvent(
                    "afraid",
                    {detail: {card: this}}
                ));
                break;
            case CardPhase.SHOCKED:
            case CardPhase.COMBO_BREAKER_SHOCKED:
                document.dispatchEvent(new CustomEvent(
                    "shockburned",
                    {detail: {card: this}}
                ));
                break;
            case CardPhase.BURNED:
            case CardPhase.COMBO_BREAKER_BURNED:
                document.dispatchEvent(new CustomEvent(
                    "fireburned",
                    {detail: {card: this}}
                ));
        }
    }

    // Gets the time in ms since the phase was set
    get timeSinceTransition () {
        return Date.now() - this.timeAtSetPhase;
    }

    // Saves the timeAtStartExit when exiting is changed from true to false
    // cards that are set to exiting will be deleted from the game after some time
    set exiting(newValue) {
        if (newValue === true && !this._exiting) {
            this.timeAtStartExit = Date.now();
        }
        this._exiting = newValue;
    }
    get exiting() {
        return this._exiting;
    }

    get faceUp () {
        switch (this.phase) {
            case CardPhase.FACE_UP:
            case CardPhase.MATCHED:
            case CardPhase.MATCHED_SPECIAL_THIS:
            case CardPhase.MATCHED_SPECIAL_OTHER:
            case CardPhase.COMBO_BROKEN:
            case CardPhase.COMBO_BREAKER_AFRAID:
            case CardPhase.COMBO_BREAKER_SHOCKED:
            case CardPhase.COMBO_BREAKER_BURNED:
                return true;
            default:
                return false;
        }
    }

    get flipRejected () {
        switch (this.phase) {
            case CardPhase.FLIP_REJECTED:
            case CardPhase.AFRAID:
                return true;
            default:
                return false;
        }
    }

    get isShocked () {
        switch (this.phase) {
            case CardPhase.SHOCKED:
            case CardPhase.COMBO_BREAKER_SHOCKED:
                return true;
            default:
                return false;
        }
    }

    get isBurned() {
        switch (this.phase) {
            case CardPhase.BURNED:
            case CardPhase.COMBO_BREAKER_BURNED:
                return true;
            default:
                return false;
        }
    }

    get matched () {
        switch (this.phase) {
            case CardPhase.MATCHED:
            case CardPhase.MATCHED_SPECIAL_THIS:
            case CardPhase.MATCHED_SPECIAL_OTHER:
                return true;
            default:
                return false;
        }
    }

    get specialMatch () {
        switch (this.phase) {
            case CardPhase.MATCHED_SPECIAL_THIS:
            case CardPhase.MATCHED_SPECIAL_OTHER:
                return true;
            default:
                return false;
        }
    }

    get showComboIndicator () {
        switch (this.phase) {
            case CardPhase.MATCHED:
            case CardPhase.MATCHED_SPECIAL_THIS:
                return true;
            default:
                return false;
        }
    }

    get comboBreaker () {
        switch (this.phase) {
            case CardPhase.COMBO_BROKEN:
            case CardPhase.COMBO_BREAKER_AFRAID:
            case CardPhase.COMBO_BREAKER_SHOCKED:
            case CardPhase.COMBO_BREAKER_BURNED:
                return true;
            default:
                return false;
        }
    }

    get brokeCombo () {
        switch (this.phase) {
            case CardPhase.COMBO_BREAKER_AFRAID:
            case CardPhase.COMBO_BREAKER_SHOCKED:
            case CardPhase.COMBO_BREAKER_BURNED:
                return true;
            default:
                return false;
        }
    }

    get comboBroken () {
        switch (this.phase) {
            case CardPhase.COMBO_BROKEN:
                return true;
            default:
                return false;
        }
    }

    get isAfraid () {
        switch (this.phase) {
            case CardPhase.AFRAID:
            case CardPhase.COMBO_BREAKER_AFRAID:
                return true;
            default:
                return false;
        }
    }

    get isShockable () {
        switch (this.phase) {
            case CardPhase.FACE_DOWN:
            case CardPhase.FACE_UP:
            case CardPhase.FLIP_REJECTED:
            case CardPhase.AFRAID:
            case CardPhase.MATCHED:
            case CardPhase.MATCHED_SPECIAL_THIS:
            case CardPhase.MATCHED_SPECIAL_OTHER:
                return !this.exiting && this.emoji !== '⚡';
            default:
                return false;
        }
    }

    get isBurnable () {
        switch (this.phase) {
            case CardPhase.FACE_DOWN:
            case CardPhase.FACE_UP:
            case CardPhase.FLIP_REJECTED:
            case CardPhase.AFRAID:
            case CardPhase.MATCHED:
            case CardPhase.MATCHED_SPECIAL_THIS:
            case CardPhase.MATCHED_SPECIAL_OTHER:
                return !this.exiting && this.emoji !== '🔥';
            default:
                return false;
        }
    }

    // Returns true if this card has a special effect
    get specialCard () {
        return this.emoji === '⏱' || this.emoji === '🧙‍';
    }

    get statusIndicator () {

        if (this.onFire) {
            return '🔥';
        }

        switch (this.phase) {
            case CardPhase.SHOCKED:
            case CardPhase.COMBO_BREAKER_SHOCKED:
                return '⚡';
            case CardPhase.COMBO_BREAKER_BURNED:
                return '🔥';
            default:
                return '';
        }
    }

    // Returns true if this card has a combo bonus with the otherCard
    comboBonusWith(otherCard) {
        let thisCombos = false;
        let otherCombos = false;
        if (emojiData.comboBonusWith[this.emoji]) {
            thisCombos = emojiData.comboBonusWith[this.emoji].includes(otherCard.emoji);
        } else if (emojiData.comboBonusWith[otherCard.emoji]) {
            otherCombos = emojiData.comboBonusWith[otherCard.emoji].includes(this.emoji);
        }
        return thisCombos || otherCombos;
    }

    // Returns true if this card is afraid of any of the cards in the otherCards array
    isAfraidOf(otherCards) {
        for (let otherCard of otherCards) {
            if (emojiData.afraidOf[this.emoji]) {
                if (emojiData.afraidOf[this.emoji].includes(otherCard.emoji)) {
                    this.timeAtLastScaryCard = Date.now();
                    return true;
                }
            }
        }
        return false;
    }
}

export const GamePhase = {
    GAME_INIT: 0,
    PLAY_START: 1,
    PLAY: 2,
    LEVEL_LOAD: 3,
    LEVEL_LOSE: 4,
    LEVEL_LOSE_END: 5,
    LEVEL_WIN_START: 6,
    LEVEL_WIN_DRAIN_TIMER: 7,
    LEVEL_WIN_DRAIN_END: 8,
    LEVEL_WIN_ADD_STARS: 9,
    LEVEL_WIN_END:10,
};

export default class GameLogic {
    constructor() {

        this.hexBoard = new HexBoard();
        this.level = new Level();

        // Chance for emojis to be forced to spawn in the same blob
        this.sameBlobChance = 0.5;

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

        this.nthStarThisLevel = 0;
        this.timeAtAddStar = Date.now();

        this.wizardMatched = false;
        this.timeAtWizardMatched = 0;

        this.timerMatched = false;
        this.timeAtTimerMatched = 0;

        this._interactionThisLevel = false;
        this.timeAtLastInteraction = 0;

        // Timing stuff
        this.timeToMatch = 250;
        this.timeToBeAfraid = 200;
        this.timeToStayAfraid = 1000;
        this.timeToCombo = 2250;
        this.timeBetweenCombos = 750;
        this.timeToLingerAfterComboBroken = 1500;
        this.timeToLingerAfterComboBreaker = 6000;
        this.timeToDelete = 1000;
        this.timeToSpawnCard = 50;
        this.timeToTransitionToDrainTimer = 1500;
        this.timeToTransitionToAddStars = 2500;
        this.timeToTransitionToLoad = 1000;
        this.timeToWaitAfterLevelLose = 2000;
        this.timerDrainMultiplier = 20;
        this.timeToAddStar = 1000;
        this.timeToIdleReset = 300 * 1000;
        this.timeToForceStartTimer = 5000;
        this.timeToStayShockBurned = 8000;
        this.timeToShock = 200;
        this.timeToStayFireBurned = 8000;
        this.timeToStayFaceUpAfterRelease = 150;

        // Fire stuff
        this.fireEmojiIgnitionRate = 250;
        this.fireEmojiIgnitionChance = 0.1;
        this.onFireCardIgnitionRate = 250;
        this.onFireCardIgnitionChance = 0.1;
        this.fireLevel = 0.0;

        this.initLevel();

        this.flipCheat = false;
        this.winCheat = false;
        this.loseCheat = false;
        this.flipEverythingCheat = false;
        this.useTwemoji = false;
        this.controlCheats = this.controlCheats.bind(this);
        this.addStar = this.addStar.bind(this);
        document.addEventListener("keypress", this.controlCheats);
    }

    set interactionThisLevel(value) {
        this._interactionThisLevel = value;
        if (value) {
            this.timeAtLastInteraction = Date.now();
        }
    }

    get interactionThisLevel() {
        return this._interactionThisLevel;
    }

    controlCheats(keyEvent) {
        // 1 key
        if (keyEvent.charCode === 49) {
            this.flipCheat = !this.flipCheat;
        }
        // 2 key
        else if (keyEvent.charCode === 50) {
            this.flipEverythingCheat = !this.flipEverythingCheat;
        }

        // 5 key
        else if (keyEvent.charCode === 53) {
            this.winCheat = true;
        }
        // 6 key
        else if (keyEvent.charCode === 54) {
            this.loseCheat = true;
        }

        // 8 key
        else if (keyEvent.charCode === 56) {
            this.timeAtSetPhase += 5000;
        }
        // 9 key
        else if (keyEvent.charCode === 57) {
            this.timeAtSetPhase -= 5000;
        }

        // t key
        else if (keyEvent.charCode === 116) {
            this.useTwemoji = !this.useTwemoji;
        }
    }

    setPhase(phase, dontSendEvent) {
        this.phase = phase;
        this.timeAtSetPhase = Date.now();

        let event;
        switch (phase) {
            case GamePhase.PLAY_START:
                event = new CustomEvent("levelplaystart");
                break;
            case GamePhase.PLAY:
                event = new CustomEvent("levelplay");
                break;
            case GamePhase.LEVEL_LOAD:
                this.initLevel();
                event = new CustomEvent("levelload");
                break;
            case GamePhase.LEVEL_LOSE:
                event = new CustomEvent("levellose");
                break;
            case GamePhase.LEVEL_WIN_START:
                event = new CustomEvent("levelwin");
                break;
            case GamePhase.LEVEL_WIN_DRAIN_TIMER:
                let drainTime = this.timeLeftAtLevelWin / this.timerDrainMultiplier;
                event = new CustomEvent("timerdrain", {
                    detail: {
                        drainTime: drainTime
                    }
                });
                break;
            case GamePhase.LEVEL_WIN_ADD_STARS:
                let numStarsToAdd = this.getNumStarsFromPerformance();
                for (let i = 0; i < numStarsToAdd; i++) {
                    setTimeout(() => (this.addStar(i + 1)), (i + 1) * this.timeToAddStar);
                }
                break;
        }

        if (event && !dontSendEvent) {
            document.dispatchEvent(event);
        }
    }

    // Gets the time left in a level. This is used to determine the loss condition.
    get timeLeft () {

        if (this.level.numStars === 0) {
            return Infinity;
        }

        switch (this.phase) {

            case GamePhase.LEVEL_LOAD:
            case GamePhase.PLAY_START:
                return this.level.timeToComplete;

            case GamePhase.PLAY:
                let timeElapsed = (Date.now() - this.timeAtSetPhase) / 1000;
                return this.level.timeToComplete - timeElapsed;

            case GamePhase.LEVEL_WIN_START:
                return this.timeLeftAtLevelWin;

            case GamePhase.LEVEL_WIN_DRAIN_TIMER:
                let timeSinceDrainStart = Date.now() - this.timeAtSetPhase;
                let drainAmount = (timeSinceDrainStart * this.timerDrainMultiplier) / 1000;
                return this.timeLeftAtLevelWin - drainAmount;

            default:
                return 0;
        }
    }

    addStar(nthStarThisLevel) {
        this.nthStarThisLevel = nthStarThisLevel;
        this.timeAtAddStar = Date.now();
        this.numStars += 1;
        document.dispatchEvent(new CustomEvent("addstar", {
            detail: {
                nthStarThisLevel: nthStarThisLevel
            }
        }));
    }

    getLevel(numStars) {
        let level = new Level();
        const starBrackets = [

            // First bracket only has one blob, so start with a small amount of cards and increase slowly
            {numStars: 0, numBlobs: 1, numCardsStart: 20, numCardsEnd: 40,
                maxConcurrentFlips: 6, timeToCompleteLevel: 90, timerAdds: 45},

            // Adding a blob for the first time, so reduce the number of cards by a bit at the start
            {numStars: 10, numBlobs: 2, numCardsStart: 36, numCardsEnd: 60,
                maxConcurrentFlips: 8, timeToCompleteLevel: 90, timerAdds: 45},

            // Reduce by a bit again for the third blob, but not as much.
            {numStars: 20, numBlobs: 3, numCardsStart: 54, numCardsEnd: 80,
                maxConcurrentFlips: 10, timeToCompleteLevel: 120, timerAdds: 60},

            // Should get hard to manage here for 2 players.
            // Only reduce cards by a little bit
            {numStars: 30, numBlobs: 4, numCardsStart: 80, numCardsEnd: 100,
                maxConcurrentFlips: 12, timeToCompleteLevel: 150, timerAdds: 75},

            // If they get this far they should be pretty good, so no more going easy
            // Keep increasing cards, and dont increase concurrent flips this time
            {numStars: 40, numBlobs: 5, numCardsStart: 102, numCardsEnd: 120,
                maxConcurrentFlips: 12, timeToCompleteLevel: 150, timerAdds: 75},

            // Once we pass this point, go into "endurance mode"
            {numStars: 50, itsTimeToGoHomeMode: true},
        ];

        let starBracket, nextStarBracket;
        for (let currStarBracket of starBrackets) {
            if (currStarBracket.numStars > numStars) {
                nextStarBracket = currStarBracket;
                break;
            }
            starBracket = currStarBracket;
        }

        level.numStars = numStars;
        if (starBracket.itsTimeToGoHomeMode) {
            level.numBlobs = 5;
            level.timeToComplete = 90 - (level.numStars - 50);
            level.numCards = 120;
            level.maxConcurrentFlips = 12;
            level.timerAdds = 60;
            level.itsTimeToGoHome = true;
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
        level.timerAdds = starBracket.timerAdds;
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
    initLevel() {

        // Get the level settings
        this.level = this.getLevel(this.numStars);

        // Initialize level state data
        this.concurrentFlips = 0;
        this.comboCounter = 0;
        this.comboScore = 0;
        this.nthStarThisLevel = 0;
        this.wizardMatched = false;
        this.timerMatched = false;
        this.interactionThisLevel = false;

        // Reset the cards array and populate with new cards
        this.cards = [];
        this.newCards = [];
        for (let cardKey = 0; cardKey < this.level.numCards; cardKey++) {
            this.newCards[cardKey] = new Card(0, cardKey);
        }

        // Initialize the hexboard blob, and import the blobCells data into the cards.
        this.hexBoard.initializeBlob(this.level.numCards, this.level.numBlobs);
        for (let i in this.newCards) {
            let blobCell = this.hexBoard.blobCells[i];
            let card = this.newCards[i];
            card.x = blobCell.x;
            card.y = blobCell.y;
            card.blobID = blobCell.blobID;
            card.row = blobCell.row;
            card.col = blobCell.col;
        }

        this.distributeEmojis();
    }

    distributeEmojis() {

        // Get the emojis that will be used
        let emojisNeeded = this.level.numCards / 2;
        let useEmojis = emojiData.sequence.slice(0, emojisNeeded);

        // None of the emojis have cards
        let noEmojiCards = this.newCards;

        // Adds 2 emojis of the same type on each loop
        for (let emoji of useEmojis) {

            // Get a random card with no emoji and give it the next emoji.
            let randomCard1 = noEmojiCards[Math.floor(Math.random() * noEmojiCards.length)];
            randomCard1.emoji = emoji;

            // Filter out this card from the noEmojiCards
            noEmojiCards = noEmojiCards.filter((card) => (card.emoji === 0));

            // If there are cards from the same blob that do not have emojis yet,
            // and the random chance to be in the same blob succeeds,
            // then distribute the matching emoji in the same blob
            let sameBlobCards = noEmojiCards.filter((card) => (card.blobID === randomCard1.blobID));
            if (Math.random() < this.sameBlobChance && sameBlobCards.length !== 0) {
                let randomCard2 = sameBlobCards[Math.floor(Math.random() * sameBlobCards.length)];
                randomCard2.emoji = emoji;
            }

            // Otherwise, distribute it elsewhere
            else {
                let randomCard2 =  noEmojiCards[Math.floor(Math.random() * noEmojiCards.length)];
                randomCard2.emoji = emoji;
            }

            // Filter out the second card
            noEmojiCards = noEmojiCards.filter((card) => (card.emoji === 0));
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

        // Handle cheats
        if (this.winCheat) {
            this.winCheat = false;
            this.numStars += 5;
            this.setPhase(GamePhase.LEVEL_LOAD, true);
        }
        else if (this.loseCheat) {
            this.loseCheat = false;
            this.setPhase(GamePhase.LEVEL_LOSE, true);
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
            this.flipEverythingCheat = false;

            // The time since load start determines how many cards should be spawned in
            let timeSinceLoadStart = Date.now() - this.timeAtSetPhase;
            let numActiveCards = Math.floor(timeSinceLoadStart / this.timeToSpawnCard);

            // Move cards from newCards to cards to spawn the cards in
            while (this.cards.length < numActiveCards && this.newCards.length) {
                this.cards.push(this.newCards.shift());
            }

            // When all cards are spawned in, move to play start phase.
            if (this.cards.length === this.level.numCards) {
                this.setPhase(GamePhase.PLAY_START);

                // Initialize cards to FACE_DOWN state.
                for (let card of this.cards) {
                    this.setCardPhase(card, CardPhase.FACE_DOWN);
                }
            }
        }

        else if (this.phase === GamePhase.PLAY_START) {
            this.updateCards();
            let timeSincePlayStart = Date.now() - this.timeAtSetPhase;
            if (this.interactionThisLevel || timeSincePlayStart > this.timeToForceStartTimer) {
                this.setPhase(GamePhase.PLAY);
            }
        }

        // Main PLAY phase. Updates the cards and checks if the game is won/lost.
        else if (this.phase === GamePhase.PLAY) {
            this.updateCards();
            if (this.isGameWon()) {
                this.timeLeftAtLevelWin = this.timeLeft;
                this.setPhase(GamePhase.LEVEL_WIN_START);
            }
            else if (this.isGameLost()) {
                this.setPhase(GamePhase.LEVEL_LOSE);
            }
            else if (this.numStars === 0 && this.interactionThisLevel) {
                let idleTime = Date.now() - this.timeAtLastInteraction;
                if (idleTime > this.timeToIdleReset) {
                    this.setPhase(GamePhase.LEVEL_LOAD, true);
                }
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
                this.cards[i].exiting = true;
            }

            // Once all cards have exited, move to LEVEL_LOAD phase.
            if (!this.cards.length) {
                this.numStars = 0;
                this.setPhase(GamePhase.LEVEL_LOSE_END);
            }
        }

        else if (this.phase === GamePhase.LEVEL_LOSE_END) {
            let timeSinceTransition = Date.now() - this.timeAtSetPhase;
            if (timeSinceTransition > this.timeToWaitAfterLevelLose) {
                this.setPhase(GamePhase.LEVEL_LOAD);
            }
        }

        else if (this.phase === GamePhase.LEVEL_WIN_START) {
            this.updateCards();
            let timeSinceWin = Date.now() - this.timeAtSetPhase;
            let timeToTransitionMultiplier = (this.numStars === 0) ? 1.5 : 1.0;
            if (timeSinceWin > this.timeToTransitionToDrainTimer * timeToTransitionMultiplier) {
                if (this.numStars !== 0) {
                    this.setPhase(GamePhase.LEVEL_WIN_DRAIN_TIMER)
                } else {
                    this.setPhase(GamePhase.LEVEL_WIN_ADD_STARS)
                }
            }
        }

        else if (this.phase === GamePhase.LEVEL_WIN_DRAIN_TIMER) {
            this.updateCards();
            if (this.timeLeft <= 0) {
                this.setPhase(GamePhase.LEVEL_WIN_DRAIN_END);
            }
        }

        else if (this.phase === GamePhase.LEVEL_WIN_DRAIN_END) {
            let timeSinceTransition = Date.now() - this.timeAtSetPhase;
            if (timeSinceTransition > this.timeToTransitionToAddStars) {
                this.setPhase(GamePhase.LEVEL_WIN_ADD_STARS);
            }
        }

        else if (this.phase === GamePhase.LEVEL_WIN_ADD_STARS) {
            this.updateCards();
            let timeSinceTransition = Date.now() - this.timeAtSetPhase;
            let timeToTransition = this.timeToAddStar * (this.getNumStarsFromPerformance());
            if (timeSinceTransition > timeToTransition) {
                this.setPhase(GamePhase.LEVEL_WIN_END);
            }
        }

        else if (this.phase === GamePhase.LEVEL_WIN_END) {
            this.updateCards();
            let timeSinceTransition = Date.now() - this.timeAtSetPhase;
            if (timeSinceTransition > this.timeToTransitionToLoad) {
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

    comboEnd() {
        // the cards should start exiting
        for (let comboPair of this.comboCards) {
            comboPair.first.exiting = true;
            comboPair.second.exiting = true;
        }

        // Clear the comboCards
        this.comboCards = [];
        this.comboCounter = 0;
    }

    // Wraps card.setPhase so that the GameLogic can apply side effects when cards change state
    setCardPhase(card, phase) {
        card.setPhase(phase);

        if (card.phase === CardPhase.FACE_UP) {
            this.concurrentFlips += 1;
            if (card.emoji === '🔥') {
                card.numIgnitions = 0;
            }
        }

        if (card.prevPhase === CardPhase.FACE_UP) {
            this.concurrentFlips -= 1;
        }
    }

    comboBreaker() {
        for (let comboPair of this.comboCards) {
            if (!comboPair.first.brokeCombo) {
                this.setCardPhase(comboPair.first, CardPhase.COMBO_BROKEN);
            }
            if(!comboPair.second.brokeCombo) {
                this.setCardPhase(comboPair.second, CardPhase.COMBO_BROKEN);
            }
        }

        // Clear the comboCards
        this.comboCards = [];
        this.comboCounter = 0;

        // fire a combo breaker event
        document.dispatchEvent(new CustomEvent("combobreaker"));
    }

    updateCards() {

        // Set the interacted flag/timestamp if a card is faceUp
        let interactedCard = this.cards.find((card) => card.faceUp);
        if (interactedCard) {
            this.interactionThisLevel = true;
        }

        // Clear the combo array if time runs out to make the next match
        if (this.comboCards.length !== 0) {

            // Get the time since the last match
            let lastMatchPair = this.comboCards[this.comboCards.length - 1];
            let timeSinceLastMatch = lastMatchPair.first.timeSinceTransition;

            // When time runs out, break the combo
            if (timeSinceLastMatch > this.timeToCombo) {
                this.comboEnd();
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
        shuffle(matchableCards);
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

                    // Remove cardB from matchableCards so it isnt tested anymore
                    matchableCards = matchableCards.splice(i, 1);

                    // Check if another matched pair has a combo bonus with this pair
                    let comboBonus = 0;
                    let specialComboPairs = [];
                    for (let comboPair of this.comboCards) {
                        if (cardA.comboBonusWith(comboPair.first)) {
                            comboBonus += 2;
                            this.setCardPhase(comboPair.first, CardPhase.MATCHED_SPECIAL_OTHER);
                            this.setCardPhase(comboPair.second, CardPhase.MATCHED_SPECIAL_OTHER);
                            specialComboPairs.push(comboPair);
                        }
                    }

                    // Set the card phase
                    if (comboBonus !== 0) {
                        this.setCardPhase(cardA, CardPhase.MATCHED_SPECIAL_THIS);
                        this.setCardPhase(cardB, CardPhase.MATCHED_SPECIAL_THIS);
                    } else {
                        this.setCardPhase(cardA, CardPhase.MATCHED);
                        this.setCardPhase(cardB, CardPhase.MATCHED);
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

                    // handle wizard match
                    if (cardA.emoji === '🧙‍') {
                        this.wizardMatched = true;
                        this.timeAtWizardMatched = Date.now();
                        this.level.maxConcurrentFlips += 1;
                    }

                    if (cardA.emoji === '⏱') {
                        this.timerMatched = true;
                        this.timeAtTimerMatched = Date.now();
                        this.level.timeToComplete += this.level.timerAdds;
                    }
                    break;
                }
            }
        }

        // Handle releasing FACE_UP cards
        let faceUpCards = this.cards.filter((card) => card.phase === CardPhase.FACE_UP);
        for (let card of faceUpCards) {

            // If the card isn't touched, release it.
            let timeSinceUntouch = Date.now() - card.timeAtUntouch;
            let shouldRelease = !card.touched && timeSinceUntouch > this.timeToStayFaceUpAfterRelease;
            if (shouldRelease && !this.flipEverythingCheat) {
                this.setCardPhase(card, CardPhase.FACE_DOWN);
            }
        }

        // Shuffle the FLIP_REJECTED cards so there is no bias in the order that they flip.
        let flipRejectedCards = this.cards.filter((card) => card.phase === CardPhase.FLIP_REJECTED);
        shuffle(flipRejectedCards);

        // Process all the FLIP_REJECTED cards
        for (let card of flipRejectedCards) {

            // If the card is touched,
            if (card.touched || this.flipEverythingCheat) {

                // Flip it if concurrentFlips are not in use.
                if ((this.concurrentFlips < this.level.maxConcurrentFlips) || this.flipCheat) {
                    this.setCardPhase(card, CardPhase.FACE_UP);
                }
            }

            // If it is no longer touched, just make it a normal FACE_DOWN card
            else {
                this.setCardPhase(card, CardPhase.FACE_DOWN);
            }
        }

        // Process cards that are FACE_DOWN
        let faceDownCards = this.cards.filter((card) => card.phase === CardPhase.FACE_DOWN);
        shuffle(faceDownCards);
        for (let card of faceDownCards) {

            // If the card is touched,
            if (card.touched || this.flipEverythingCheat) {

                // Flip the card up if there is available flips
                if ((this.concurrentFlips < this.level.maxConcurrentFlips) || this.flipCheat) {
                    this.setCardPhase(card, CardPhase.FACE_UP);
                }

                // Reject the flip if all concurrent flips are in use.
                else {
                    this.setCardPhase(card, CardPhase.FLIP_REJECTED);
                }
            }
        }

        let shouldBeAfraidCards = this.cards.filter((card) => (this.shouldBeAfraid(card)));
        let comboBroken = false;
        for (let card of shouldBeAfraidCards) {
            if (!card.isAfraid) {
                if (card.matched) {
                    this.setCardPhase(card, CardPhase.COMBO_BREAKER_AFRAID);
                    comboBroken = true;
                } else {
                    this.setCardPhase(card, CardPhase.AFRAID);
                }

            }
        }
        if (comboBroken) {
            this.comboBreaker();
        }

        // Make cards stop being afraid
        let afraidCards = this.cards.filter((card) => (card.phase === CardPhase.AFRAID));
        let cardsThatCanBeScary = this.cards.filter((card) => this.canBeScary(card));
        for (let card of afraidCards) {
            let timeSinceLastScaryCard = Date.now() - card.timeAtLastScaryCard;
            let stillScary = card.isAfraidOf(cardsThatCanBeScary);
            if (timeSinceLastScaryCard > this.timeToStayAfraid && !stillScary) {
                this.setCardPhase(card, CardPhase.FACE_DOWN);
            }
        }

        // Handle comboBroken cards
        let comboBrokenCards = this.cards.filter((card) => (card.comboBroken));
        for (let card of comboBrokenCards) {
            if (card.timeSinceTransition > this.timeToLingerAfterComboBroken) {
                card.exiting = true;
            }
        }

        // Handle the afraid card that triggered the combo breaker
        let comboBreakerCards = this.cards.filter((card) => (card.brokeCombo));
        for (let card of comboBreakerCards) {
            if (card.timeSinceTransition > this.timeToLingerAfterComboBreaker) {
                card.exiting = true;
            }
        }

        // Handle timeout on shock burned cards.
        let shockBurnedCards = this.cards.filter((card) => (card.phase === CardPhase.SHOCKED));
        for (let card of shockBurnedCards) {
            if (card.timeSinceTransition > this.timeToStayShockBurned) {
                this.setCardPhase(card, CardPhase.FACE_DOWN);
            }
        }

        // Handle shock emoji cards
        let shockedCards = this.cards.filter((card) => (card.phase === CardPhase.FACE_UP && card.emoji === '⚡'));
        for (let card of shockedCards) {
            if (card.timeSinceTransition > this.timeToShock && !card.hasShocked) {
                card.hasShocked = true;
                card.timeAtShock = Date.now();
                this.shockRandomCard();
            }
        }

        // Fire emoji cards spread fire when face up
        let fireEmojiCards = this.cards.filter((card) => (card.phase === CardPhase.FACE_UP && card.emoji === '🔥'));
        for (let card of fireEmojiCards) {
            this.igniteAdjacentCards(card, card.timeSinceTransition, this.fireEmojiIgnitionRate, this.fireEmojiIgnitionChance);
        }

        // On fire cards spread fire, and transition to BURNED after a while
        let onFireCards = this.cards.filter((card) => (card.onFire));
        for (let card of onFireCards) {
            let ignitionChance = this.onFireCardIgnitionChance * card.burnPercent;
            this.igniteAdjacentCards(card, card.timeAtOnFire, this.onFireCardIgnitionRate, ignitionChance);
            if (card.burnPercent > 1.0) {
                if (!card.matched) {
                    this.setCardPhase(card, CardPhase.BURNED);
                } else {
                    this.setCardPhase(card, CardPhase.COMBO_BREAKER_BURNED);
                    this.comboBreaker();
                }
            }
        }

        // Determine fire level
        this.fireLevel = 0.0;
        onFireCards = this.cards.filter((card) => (card.onFire));
        for (let card of onFireCards) {
            this.fireLevel += card.burnPercent;
        }

        // Handle timeout on BURNED cards.
        let burnedCards = this.cards.filter((card) => (card.phase === CardPhase.BURNED));
        for (let card of burnedCards) {
            if (card.timeSinceTransition > this.timeToStayFireBurned) {
                this.setCardPhase(card, CardPhase.FACE_DOWN);
            }
        }

        // Handle all cards that should be deleted.
        this.cards = this.cards.filter((card) => !this.shouldDelete(card));
    }

    igniteAdjacentCards(card, timeSinceCanIgnite, ignitionRate, ignitionChance) {
        let adjacentToFireCards = this.getAdjacentCards(card);
        while (card.numIgnitions * ignitionRate < card.timeSinceTransition) {
            adjacentToFireCards = adjacentToFireCards.filter((card) => card.isBurnable && !card.onFire);
            card.numIgnitions += 1;
            for (let adjacentCard of adjacentToFireCards) {
                if (Math.random() < ignitionChance && !adjacentCard.onFire) {
                    adjacentCard.onFire = true;
                }
            }
        }
    }

    shockRandomCard() {
        let canShockCards = this.cards.filter((card) => card.isShockable);
        if (canShockCards.length !== 0) {
            let randomCard = canShockCards[Math.floor(Math.random() * canShockCards.length)];
            if (!randomCard.matched) {
                this.setCardPhase(randomCard, CardPhase.SHOCKED);
            } else {
                let matchingCard = this.cards.find((card) => card !== randomCard && card.emoji === randomCard.emoji);
                this.setCardPhase(randomCard, CardPhase.COMBO_BREAKER_SHOCKED);
                this.setCardPhase(matchingCard, CardPhase.COMBO_BREAKER_SHOCKED);
                this.comboBreaker();
            }
        }
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

        return Date.now() - card.timeAtStartExit > this.timeToDelete;
    }

    shouldBeAfraid(card) {

        // faceDown or exiting cards should not become afraid
        if (!card.faceUp || card.exiting) {
            return false;
        }

        // If the card was just very recently flipped up it should not become afraid yet.
        if (card.phase === CardPhase.FACE_UP && card.timeSinceTransition < this.timeToBeAfraid) {
            return false;
        }

        let cardsThatCanBeScary = this.cards.filter((card) => this.canBeScary(card));
        return card.isAfraidOf(cardsThatCanBeScary);
    }

    canBeScary(card) {
        return card.faceUp && !card.exiting;
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

    getAdjacentCards(card) {
        let neighborCells = this.hexBoard.getNeighbors(card);
        let adjacentCards = [];
        for (let cell of neighborCells) {
            let adjacentCard = this.cards.find((card) => (card.row === cell.row && card.col === cell.col));
            if (adjacentCard) {
                adjacentCards.push(adjacentCard);
            }
        }
        return adjacentCards;
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
