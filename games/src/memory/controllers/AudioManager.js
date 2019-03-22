import Sounds from '../controllers/Sounds.js';

export default class AudioManager {
    constructor() {
        document.addEventListener("match", this.handleEvents);
        document.addEventListener("faceUp", this.handleEvents);
        document.addEventListener("levelwin", this.handleEvents);
        document.addEventListener("levellose", this.handleEvents);
        document.addEventListener("levelstart", this.handleEvents);
        document.addEventListener("levelload", this.handleEvents);
        this.handleEvents = this.handleEvents.bind(this);
    }

    handleEvents(event) {
        switch (event.type) {
            case "match":
                let comboCounter = event.detail.matchPair.first.comboCounter;
                let i = Math.min(Math.floor((comboCounter - 1) / 3), Sounds.matchSounds.length - 1);
                Sounds.matchSounds[i].play();
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
        }
    }
}