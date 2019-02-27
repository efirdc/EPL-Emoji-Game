import React from 'react';

import Card from './Card';
import TouchPoint from './TouchPoint.js'
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
        this.gameLogic.addLevel(emojiData.sequence.length * 2, 12, 125);
        this.gameLogic.setLevel(0);
        this.hexBoard.distributeBlobs(this.gameLogic.numCards);

        this.touchPoints = {};
        this.fakeTouchPoints = {};
        this.nextFakeTouchIdentifier = 1000;
        this.touchPointSize = 30;
        this.draggingTouchPoint = -1;

        this.phase = Game.Phase.LEVEL_LOAD;
        this.timer = 0;
        this.cardDisplayPercent = 0;

        // This binding is necessary to make `this` work in the callback
        this.handleTouch = this.handleTouch.bind(this);
        this.handleMouse = this.handleMouse.bind(this);
        this.tick = this.tick.bind(this);
    }

    tick(deltaTime) {

        this.timer += deltaTime;

        if (this.phase === Game.Phase.LEVEL_LOAD) {
            const phaseLength = 1.5;
            this.cardDisplayPercent = Math.min(this.timer / phaseLength, 1.0);
            if (this.timer > phaseLength) {
                this.phase = Game.Phase.PLAY;
                this.gameLogic.startLevel();
                this.timer = 0;
            }
        }

        else if (this.phase === Game.Phase.PLAY) {
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

    // Callback function for mouse events. Creates fake touch points.
    handleMouse(event) {

        if (event.type === "mousedown") {

            // add or remove touch points on shift + click
            if (event.shiftKey) {
                if (event.target.className === "FakeTouchPoint") {
                    delete this.fakeTouchPoints[event.target.id];
                } else {
                    this.fakeTouchPoints[this.nextFakeTouchIdentifier] = {x: event.clientX, y: event.clientY};
                    this.nextFakeTouchIdentifier += 1;
                }
            }

            // Start drag behavior if a touch point is clicked.
            else if (event.target.className === "FakeTouchPoint") {
                this.draggingTouchPoint = event.target.id;
            }
        }

        // Touch point drag behavior.
        else if (event.type === "mousemove" && this.draggingTouchPoint !== -1) {
            this.fakeTouchPoints[this.draggingTouchPoint] = {x: event.clientX, y: event.clientY};
        }

        else if (event.type === "mouseup") {
            this.draggingTouchPoint = -1;
        }

        this.handleInput();
    }

    // Callback function for all touch events. Gets the real touch points.
    handleTouch(event) {

        // reconstruct the touchPoints object
        this.touchPoints = {};
        for (let touch of event.touches) {
            this.touchPoints[touch.identifier] = {x: touch.clientX, y: touch.clientY};
        }

        // This might stop touch points from also sending click events (needs testing)
        event.preventDefault();
        event.stopPropagation();

        this.handleInput();
    }

    // This is called after every handleTouch() and handleMouse()
    handleInput() {

        // Only respond to input in the PLAY phase
        if (this.phase !== Game.Phase.PLAY) {
            return;
        }

        // Combine the real and fake(mouse) touch points into one object
        let allTouchPoints = [...Object.values(this.touchPoints), ...Object.values(this.fakeTouchPoints)];

        // Figure out which cards are touched.
        let touchedCards = [];
        let cardElements = document.getElementsByClassName("cardInputHandler");
        for (let touchPoint of allTouchPoints) {
            let elementsAtTouchPoint = document.elementsFromPoint(touchPoint.x, touchPoint.y);
            for (let cardElement of cardElements) {
                if (elementsAtTouchPoint.includes(cardElement)) {
                    touchedCards.push(parseInt(cardElement.id));
                }
            }
        }

        // Update the touched cards.
        this.gameLogic.setTouches(touchedCards);

        // Handle game win/loss conditions
        if (this.gameLogic.isGameWon()) {
            this.phase = Game.Phase.LEVEL_WIN;
            setTimeout(() => new Audio(winSoundFile).play(), 250);
            setTimeout(() => this.loadNextLevel(true), 2000.0);
        }

        // Force the component to re-render
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
                onTouchStart={this.handleTouch}
                onTouchEnd={this.handleTouch}
                onTouchMove={this.handleTouch}
                onTouchCancel={this.handleTouch}
                onMouseDown={this.handleMouse}
                onMouseMove={this.handleMouse}
                onMouseUp={this.handleMouse}
            >
                <AspectRatioRect aspectRatio={16/9}/>
                <div style={boardStyle}>
                    <div>
                        {partialCards.map((card) => (
                            <Card
                                {...card}
                                {...blobs[card.cardKey]}
                                key={card.cardKey.toString()}
                                size={hexBoard.hexSize * 2 - 1}
                                loop={this.loop}
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
                    <div>
                        {Object.keys(this.fakeTouchPoints).map((touchID) => (
                            <TouchPoint
                                {...this.fakeTouchPoints[touchID]}
                                fake={true}
                                id={touchID}
                                key={touchID.toString()}
                                size={this.touchPointSize}
                            />
                        ))}
                    </div>
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