import Sounds from '../controllers/Sounds.js';
import emojiData from './EmojiData.js';

export default class AudioManager {
    constructor() {
        this.handleEvents = this.handleEvents.bind(this);

        Sounds.absorbSound.volume(0.3);

        document.addEventListener("match", this.handleEvents);
        document.addEventListener("matchspecialother", this.handleEvents);
        document.addEventListener("faceUp", this.handleEvents);
        document.addEventListener("levelwin", this.handleEvents);
        document.addEventListener("levellose", this.handleEvents);
        document.addEventListener("levelstart", this.handleEvents);
        document.addEventListener("levelload", this.handleEvents);
        document.addEventListener("particleabsorb", this.handleEvents);
        document.addEventListener("addstar", this.handleEvents);
        document.addEventListener("afraid", this.handleEvents);
    }

    handleEvents(event) {
        switch (event.type) {
            case "match":
                let card = event.detail.matchPair.first;
                let comboCounter = card.comboCounter;
                let i = Math.min(Math.floor((comboCounter - 1) / 3), Sounds.matchSounds.length - 1);
                Sounds.matchSounds[i].play();
                if (card.emoji === '🧙‍') {
                    // play wizard sound here
                }
                break;
            case "faceUp":
                let j = Math.floor(Math.random() * (Sounds.flipSounds.length));
                Sounds.flipSounds[j].play();
                break;
            case "levelwin":
                setTimeout(() => (Sounds.winSound.play()), 500);
                break;
            case "levellose":
                Sounds.loseSound.play();
                break;
            case "levelstart":
                break;
            case "levelload":
                Sounds.loadSound.play();
                break;
            case "particleabsorb":
                Sounds.absorbSound.play();
                break;
            case "addstar":
                Sounds.starSounds[event.detail.nthStarThisLevel - 1].play();
                break;
            case "afraid":
                this.afraidSound(event.detail.card.emoji);
                break;
        }

        if (event.type === 'match' || event.type === 'matchspecialother') {
            let card = event.detail.matchPair.first;
            if (card.specialMatch && emojiData.triggersComboSound.includes(card.emoji)) {
                this.specialComboSound(card.emoji);
            }
        }
    }

    specialComboSound(emoji) {
        switch (emoji) {
            case '🧟': // zombie (braaaaaains)
                break;
            case '🧛': // vampire (dracula noise?)
                break;
            case '🤑': // money (cha-ching)
                Sounds.comboBonusSounds.chaching.play();
                break;
            case '👶': // baby (laughing)
                break;
            case '🤵': // wedding (cartoony wedding march clip)
                break;
            case '👩‍🍳': // chef (sizzling, chopping veggies, pots and pans, have an array and alternate)
                break;
            case '👮': // police (not sure)
                break;
            case '🛸': // alien (generic spooky alien noise)
                break;
            case '👨‍🚒': // fireman (firetruck horn)
                break;
            case '👩‍⚕️': // doctor (defibrillator noise?, heart monitor beep noise?, sneeze?)
                break;
            case '👨‍🚀': // astronaut (spaceship launch noise)
                Sounds.comboBonusSounds.rocketLaunch.play();
                break;
            case '🎷': // saxophone (duh)
                break;
            case '🎸': // guitar (duh)
                break;
            case '🎺': // trumpet (duh)
                break;
            case '🎻': // violin (duh)
                break;
            case '🥁': // snare (duh)
                break;
        }
    }

    afraidSound(emoji) {
        switch (emoji) {
            case '😺': // cat (scared cat sound)
                Sounds.afraidOfSounds.catMeow.play();
                break;
            case '🐶': // dog (dog whimper noise)
                break;
            case '🐷': // pig (pig squeal)
                break;
            case '🥶': // frozen guy (cold person shivering? this one is kind of dumb so will replace maybe)
                break;
            case '⛄': // snowman is afraid of fire (no clue)
                break;
            case '🐵': // monkey (scared monkey noise i guess)
                Sounds.afraidOfSounds.monkeyScreech.play();
                break;
            case '😱': // shocked emoji (willhelm scream!)
                break;
            case '🤓': // nerd (nerd sounds)
                break;
            case '🤢': // sick guy (cartoony puke noise)
                break;
        }
    }
}