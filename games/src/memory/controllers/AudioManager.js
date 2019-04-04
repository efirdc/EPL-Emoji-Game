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
        document.addEventListener("combobreaker", this.handleEvents);
        document.addEventListener("shockburned", this.handleEvents);
        document.addEventListener("fireburned", this.handleEvents);
        document.addEventListener("cardignite", this.handleEvents);
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
                    Sounds.magicSound.play();
                }
                else if (card.emoji === '⏱') {
                    // play timer sound here
                    Sounds.timerSound.play();
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
            case "combobreaker":
                Sounds.comboBreakerSound.play();
                break;
            case "shockburned":
                Sounds.shockSound.play();
                break;
            case "fireburned":
                break;
            case "cardignite":
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
            case '🧟‍': // zombie (braaaaaains)
                Sounds.comboBonusSounds.zombie.play();
                break;
            case '🧛‍': // vampire (dracula noise?)
                Sounds.comboBonusSounds.vampireLaugh.play();
                break;
            case '🤑': // money (cha-ching)
                Sounds.comboBonusSounds.chaching.play();
                break;
            case '👶': // baby (laughing)
                Sounds.comboBonusSounds.babyGiggle.play();
                break;
            case '🤵': // wedding (cartoony wedding march clip)

                break;
            case '👩‍🍳': // chef (sizzling, chopping veggies, pots and pans, have an array and alternate)
                Sounds.comboBonusSounds.foodSizzling.play();
                break;
            case '👮': // police (not sure)
                Sounds.comboBonusSounds.policeSiren.play();
                break;
            case '🛸': // alien (generic spooky alien noise)
                Sounds.comboBonusSounds.ufo.play();
                break;
            case '👨‍🚒': // fireman (firetruck horn)
                Sounds.comboBonusSounds.fireTruck.play();
                break;
            case '👩‍⚕️': // doctor (defibrillator noise?, heart monitor beep noise?, sneeze?)
                Sounds.comboBonusSounds.defibrillator.play();
                break;
            case '👨‍🚀': // astronaut (spaceship launch noise)
                Sounds.comboBonusSounds.rocketLaunch.play();
                break;
            case '🎷': // saxophone (duh)
                Sounds.comboBonusSounds.saxophone.play();
                break;
            case '🎸': // guitar (duh)
                Sounds.comboBonusSounds.electricGuitar.play();
                break;
            case '🎺': // trumpet (duh)
                Sounds.comboBonusSounds.trumpet.play();
                break;
            case '🎻': // violin (duh)

                break;
            case '🥁': // snare (duh)
                Sounds.comboBonusSounds.drum.play();
                break;
        }
    }

    afraidSound(emoji) {
        switch (emoji) {
            case '😺': // cat (scared cat sound)
                Sounds.afraidOfSounds.catMeow.play();
                break;
            case '🐶': // dog (dog whimper noise)
                Sounds.afraidOfSounds.dogYelp.play();
                break;
            case '🐷': // pig (pig squeal)
                Sounds.afraidOfSounds.pigSqueal.play();
                break;
            case '🥶': // frozen guy (cold person shivering? this one is kind of dumb so will replace maybe)
                Sounds.afraidOfSounds.teethChattering.play();
                break;
            case '⛄': // snowman is afraid of fire (no clue)
                break;
            case '🐵': // monkey (scared monkey noise i guess)
                Sounds.afraidOfSounds.monkeyScreech.play();
                break;
            case '😱': // shocked emoji (willhelm scream!)
                Sounds.afraidOfSounds.scream.play();
                break;
            case '🤓': // nerd (nerd sounds)
                Sounds.afraidOfSounds.nerd.play();
                break;
            case '🤢': // sick guy (cartoony puke noise)
                Sounds.afraidOfSounds.vomit.play();
                break;
        }
    }
}