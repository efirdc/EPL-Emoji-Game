import React from 'react';
import ScoreParticle from "./ScoreParticle.js";
import Card from "./Game";

class ScoreParticleData {

    static nextId = 0;

    constructor(spawnX, spawnY, targetX, targetY, special) {
        this.id = ScoreParticleData.nextId;
        ScoreParticleData.nextId += 1;
        this.spawnX = spawnX;
        this.spawnY = spawnY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.absorb = false;
        this.special = special;
        this.timeAtSpawn = Date.now();
    }
}

export default class ScoreParticleManager extends React.PureComponent {

    constructor(props) {
        super(props);

        this.scoreParticleData = [];

        this.timeBeforeAbsorb = 1500;
        this.cardMinSpread = 2;
        this.cardMaxSpread = 5;
        this.timerMinSpread = 6;
        this.timerMaxSpread = 10;
        this.timerSpreadElipseFactor = 1.6;
        this.cardSpawnInterval = 150;
        this.timerSpawnInterval = 80;

        // Binding "this" is necessary for callback functions (otherwise "this" is undefined in the callback).
        this.tick = this.tick.bind(this);
        this.handleMatch = this.handleMatch.bind(this);
        this.handleTimerDrain = this.handleTimerDrain.bind(this);
        this.deleteParticle = this.deleteParticle.bind(this);
    }

    // Called by React when the component enters the scene
    componentDidMount() {
        // Subscribe the the loop so that tick() gets called every frame.
        this.loopID = this.props.loop.subscribe(this.tick);
        document.addEventListener("match", this.handleMatch);
        document.addEventListener("matchspecialother", this.handleMatch);
        document.addEventListener("timerdrain", this.handleTimerDrain);
    }

    // Unsubscribe when component leaves the scene.
    componentWillUnmount() {
        this.props.loop.unsubscribe(this.loopID);
    }

    handleMatch(event) {
        let matchPair = event.detail.matchPair;
        let comboScore = event.detail.comboScore;
        let numParticles = comboScore / 0.25;
        this.addParticles(matchPair.first, numParticles * 0.5);
        setTimeout( () => this.addParticles(matchPair.second, numParticles * 0.5), this.cardSpawnInterval * 0.5);
    }

    addParticles(card, numParticles) {
        for (let i = 0; i < numParticles; i++) {
            let spawnDelay = i * this.cardSpawnInterval;
            setTimeout(() => (this.addParticleCard(card)), spawnDelay);
        }
    }

    handleTimerDrain(event) {
        let drainTime = event.detail.drainTime;

        let numParticles = (parseFloat(drainTime) * 1000) / this.timerSpawnInterval;
        console.log(drainTime, numParticles);
        for (let i = 0; i < numParticles; i++) {
            setTimeout(
        () => (this.addParticleTimer(this.props.timer1Pos)),
        i * this.timerSpawnInterval
            );
            setTimeout(
        () => (this.addParticleTimer(this.props.timer2Pos)),
        i * this.timerSpawnInterval + this.timerSpawnInterval * 0.5
            );
        }
    }

    addParticleCard(card) {
        let randomAngle = 2 * Math.PI * Math.random();
        let spreadRadius = (this.cardMaxSpread - this.cardMinSpread) * Math.random() + this.cardMinSpread;
        let spreadX = spreadRadius * Math.cos(randomAngle);
        let spreadY = spreadRadius * Math.sin(randomAngle);
        let newScoreParticle = new ScoreParticleData(
            card.x, card.y,
            card.x + spreadX, card.y + spreadY,
            card.specialMatch
        );
        this.scoreParticleData.push(newScoreParticle);
    }

    addParticleTimer(timerPos) {
        let randomAngle = 2 * Math.PI * Math.random();
        let spreadRadius = (this.timerMaxSpread - this.timerMinSpread) * Math.random() + this.timerMinSpread;
        let spreadX = spreadRadius * Math.cos(randomAngle) * this.timerSpreadElipseFactor;
        let spreadY = spreadRadius * Math.sin(randomAngle);
        let newScoreParticle = new ScoreParticleData(
            timerPos.x, timerPos.y,
            timerPos.x + spreadX, timerPos.y + spreadY,
        );
        this.scoreParticleData.push(newScoreParticle);
    }

    deleteParticle(id) {
        let prevLength = this.scoreParticleData.length;
        this.scoreParticleData = this.scoreParticleData.filter((data) => (data.id !== id));
        let actuallyDeletedAParticle = prevLength !== this.scoreParticleData.length;
        if (actuallyDeletedAParticle) {
            document.dispatchEvent(new CustomEvent("particleabsorb"));
        }
    }

    // called every frame
    tick(deltaTime) {
        for (let scoreParticleData of this.scoreParticleData) {
            let timeSinceSpawn = Date.now() - scoreParticleData.timeAtSpawn;
            if (timeSinceSpawn > this.timeBeforeAbsorb) {
                scoreParticleData.targetX = 0;
                scoreParticleData.targetY = 0;
                scoreParticleData.absorb = true;
            }
        }
        this.forceUpdate();
    }

    render() {
        return (
            <div>
                {this.scoreParticleData.map((scoreParticleData) => (
                    <ScoreParticle
                        {...scoreParticleData}
                        key={scoreParticleData.id.toString()}
                        deleteParticle={this.deleteParticle}
                    />
                ))}
            </div>
        )
    }
}