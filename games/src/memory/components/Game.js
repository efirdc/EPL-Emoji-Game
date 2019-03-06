import React from 'react';

import Card from './Card';
import TouchPoint from './TouchPoint.js'
import FakeTouchPoints from "./FakeTouchPoints"
import Timer from "./Timer.js"
import CardFlipCounter from "./CardFlipCounter.js"
import BackgroundGL from "./BackgroundGL.js";
import AspectRatioRect from "./AspectRatioRect.js"
import GameLogic from '../controllers/GameLogic.js';
import HexBoard from '../controllers/HexBoard.js';
import GameLoop from '../controllers/GameLoop.js';
import emojiData from './EmojiData.js';

import winSoundFile from '../sounds/win.wav';
import loseSoundFile from '../sounds/lose.wav'
import matchSoundFile from "../sounds/match3.wav";
import backgroundMusicFile from "../sounds/BackgroundMusic.mp3"

export default class Game extends React.Component {

    static Phase = {
        PLAY: 0,
        LEVEL_LOAD: 1,
        LEVEL_LOSE: 2,
        LEVEL_WIN: 3,
    };

    constructor(props) {
        super(props);

        this.loop = new GameLoop();

        this.hexBoard = new HexBoard();
        this.gameLogic = new GameLogic();
        this.gameLogic.addLevel(140, 6, 125);
        this.gameLogic.setLevel(0);
        this.hexBoard.distributeBlobs(this.gameLogic.numCards);

        this.touchedCards = [];
        this.touchPoints = {}; // Touch points created by real touch events

        this.phase = Game.Phase.LEVEL_LOAD;
        this.timer = 0;
        this.cardDisplayPercent = 0;

        // This binding is necessary to make `this` work in the callback
        this.tick = this.tick.bind(this);
        this.onCardTouchStart = this.onCardTouchStart.bind(this);
        this.onCardTouchEnd = this.onCardTouchEnd.bind(this);

    }

    tick(deltaTime) {

        this.timer += deltaTime;

        if (this.phase === Game.Phase.LEVEL_LOAD) {

            //background music added
            new Audio(backgroundMusicFile).play();

            const phaseLength = this.gameLogic.numCards * 0.08;
            this.cardDisplayPercent = Math.min(this.timer / phaseLength, 1.0);
            if (this.timer > phaseLength) {
                this.phase = Game.Phase.PLAY;
                this.gameLogic.startLevel();
                this.timer = 0;
            }
        }

        else if (this.phase === Game.Phase.PLAY) {
            let matchHappened = this.gameLogic.tryMatchingCards();
            if (matchHappened) {
                new Audio(matchSoundFile).play();
            }
            if (this.gameLogic.isGameLost()) {
                this.phase = Game.Phase.LEVEL_LOSE;
                new Audio(loseSoundFile).play();
                setTimeout(() => this.loadNextLevel(true), 2000.0);
            }
        }

        this.forceUpdate();
    }

    // Game loop stuff
    componentDidMount() {
        this.loop.start();
        this.loopID = this.loop.subscribe(this.tick);
    }
    componentWillUnmount() {
        this.loop.stop();
        this.loop.unsubscribe(this.loopID);
    }

    onCardTouchStart(cardKey) {
        this.touchedCards.push(cardKey);
        if (this.phase === Game.Phase.PLAY) {
            this.gameLogic.setTouches(this.touchedCards);
            this.handleShouldGameEnd()
        }
    }

    onCardTouchEnd(cardKey) {
        this.touchedCards = this.touchedCards.filter((key) => key !== cardKey);
        if (this.phase === Game.Phase.PLAY) {
            this.gameLogic.setTouches(this.touchedCards);
            this.handleShouldGameEnd()
        }
    }

    handleShouldGameEnd() {
        // Handle game win/loss conditions
        if (this.gameLogic.isGameWon()) {
            this.phase = Game.Phase.LEVEL_WIN;
            setTimeout(() => new Audio(winSoundFile).play(), 250);
            setTimeout(() => this.loadNextLevel(true), 2000.0);
        }
        this.forceUpdate();
    }

    loadNextLevel (prevLevelWon) {
        if (prevLevelWon) {
            this.gameLogic.nextLevel();
        } else {
            this.gameLogic.setLevel(0);
        }

        this.hexBoard.distributeBlobs(this.gameLogic.numCards);
        this.phase = Game.Phase.LEVEL_LOAD;
        this.timer = 0;
        this.cardDisplayPercent = 0;
        this.forceUpdate();
    }

    render() {

        // Body contains the entire viewport
        const bodyStyle = {
            width: "100vw",
            height: "100vh",
            pointerEvents: "all",
            //background: "-webkit-linear-gradient(290deg, #00C9FF 0%, #92FE9D 100%)",
            boxShadow: "inset 0 0 20px #000000",
        };
        const backgroundStyle = {
            zIndex: "-1",
            position: "absolute",
        };

        // Board origin is at the center of the viewport
        // Elements in the board should have position: 'absolute' and use 'vh' units.
        const boardStyle = {
            height: "0",
            width: "0",
            position: "absolute",
            top: "50vh",
            left: "50vw",
            userSelect: "none",
            //pointerEvents: 'none'
        };

        const debugRectStyle = (rectWidth, rectHeight) => ({
            zIndex: 3,
            width: rectWidth * 2 + "vh",
            height: rectHeight * 2 + "vh",
            left: -rectWidth + "vh",
            top: -rectHeight + "vh",
            position: "absolute",
            borderStyle: "solid",
            borderColor: "black",
            pointerEvents: "none",
        });

        let gameLogic = this.gameLogic;
        let hexBoard =  this.hexBoard;
        let hexPoints = hexBoard.pointsFlat;
        let blobs = hexBoard.blobData;

        let partialCards = gameLogic.cards.slice(0, Math.floor(blobs.length * this.cardDisplayPercent));

        return (
            <div
                style={bodyStyle}
                ref={this.bodyRef}
            >
                <AspectRatioRect aspectRatio={16/9}/>
                <div style={boardStyle}>
                    <div>
                        {partialCards.map((card) => (
                            <Card
                                {...card}
                                {...blobs[card.cardKey]}
                                key={card.cardKey.toString()}
                                size={hexBoard.hexSize * 2}
                                loop={this.loop}
                                onCardTouchStart={this.onCardTouchStart}
                                onCardTouchEnd={this.onCardTouchEnd}
                            />
                        ))}
                    </div>
                    <div>
                        {Object.keys(this.touchPoints).map((touchID) => (
                            <TouchPoint
                                {...this.touchPoints[touchID]}
                                key={touchID.toString()}
                                size={this.touchPointSize}
                            />
                        ))}
                    </div>
                    <FakeTouchPoints loop={this.loop}/>
                    <div style={debugRectStyle(hexBoard.innerBox.x, hexBoard.innerBox.y)}/>
                    <div style={debugRectStyle(hexBoard.outerBox.x, hexBoard.outerBox.y)}/>
                    <Timer x={-30} y={-10} rotation={0} time={this.gameLogic.timeLeft} loop={this.loop}/>
                    <Timer x={30} y={10} rotation={-180} time={this.gameLogic.timeLeft} loop={this.loop}/>
                    <CardFlipCounter
                        x={-30} y={0} rotation={0}
                        numFlips={this.gameLogic.concurrentFlips}
                        maxFlips={this.gameLogic.maxConcurrentFlips}
                    />
                    <CardFlipCounter
                        x={30} y={0} rotation={180}
                        numFlips={this.gameLogic.concurrentFlips}
                        maxFlips={this.gameLogic.maxConcurrentFlips}
                    />
                </div>
            </div>
        )
    }
}