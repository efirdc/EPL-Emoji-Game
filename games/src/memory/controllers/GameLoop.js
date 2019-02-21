// From https://github.com/FormidableLabs/react-game-kit/blob/master/src/utils/game-loop.js

export default class GameLoop {
    constructor() {
        this.subscribers = [];
        this.loopID = null;
        this.loop = this.loop.bind(this);
        this.lastTime = 0;
    }

    loop() {
        var time = Date.now();
        var deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.subscribers.forEach((callback) => {
            callback(deltaTime / 1000);
        });

        this.loopID = window.requestAnimationFrame(this.loop);
    }

    start() {
        this.lastTime = Date.now();
        if (!this.loopID) {
            this.loop();
        }
    }

    stop() {
        if (!this.loopID) {
            window.cancelAnimationFrame(this.loopID);
            this.loopID = null;
        }
    }

    subscribe(callback) {
        return this.subscribers.push(callback);
    }

    unsubscribe(id) {
        this.subscribers.splice((id - 1), 1);
    }
}