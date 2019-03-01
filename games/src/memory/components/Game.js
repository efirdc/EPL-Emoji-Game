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

        this.touchedCards = [];

        this.touchPoints = {}; // Touch points created by real touch events
        this.fakeTouchPoints = {}; // Touch points simulated by the mouse
        this.nextFakeTouchIdentifier = 1000; // Next identifier to be used for a fake touch point (needs to be > 80)
        this.touchPointSize = 30; // size of a touch point
        this.draggingTouchPoint = -1; // identifier of the fake touch point that is being dragged

        this.phase = Game.Phase.LEVEL_LOAD;
        this.timer = 0;
        this.cardDisplayPercent = 0;

        // This binding is necessary to make `this` work in the callback
        //this.handleTouch = this.handleTouch.bind(this);
        this.handleMouse = this.handleMouse.bind(this);
        this.tick = this.tick.bind(this);
        this.onCardTouchStart = this.onCardTouchStart.bind(this);
        this.onCardTouchEnd = this.onCardTouchEnd.bind(this);

        this.bodyRef = React.createRef();
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
        //this.handleInput();
        this.updateFakeTouchTargets();
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
        this.gameLogic.setTouches(this.touchedCards);
        this.handleShouldGameEnd()
    }

    onCardTouchEnd(cardKey) {
        this.touchedCards = this.touchedCards.filter((key) => key !== cardKey);
        this.gameLogic.setTouches(this.touchedCards);
        this.handleShouldGameEnd()
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

    getCardElement(x, y) {
        let elementsAtPoint = document.elementsFromPoint(x, y);
        for (let elem of elementsAtPoint) {
            if (elem.className === "cardInputHandler") {
                return elem;
            }
        }
        return false;
    }

    dispatchCaptureEvent(cardElem) {
        let fakeEvent = new window.PointerEvent("gotpointercapture", {
            bubbles: true,
            cancelable: true,
            composed: true,
        });
        cardElem.dispatchEvent(fakeEvent);
    }

    dispatchReleaseEvent(cardElem) {
        let fakeEvent = new window.PointerEvent("lostpointercapture", {
            bubbles: true,
            cancelable: true,
            composed: true,
        });
        cardElem.dispatchEvent(fakeEvent);
    }

    updateFakeTouchTargets() {
        for (let id in this.fakeTouchPoints) {

            if(!this.fakeTouchPoints.hasOwnProperty(id)) {
                continue;
            }

            let prevCardElem = this.fakeTouchPoints[id].cardElem;
            let newCardElem = this.getCardElement(this.fakeTouchPoints[id].x, this.fakeTouchPoints[id].y);
            this.fakeTouchPoints[id].cardElem = newCardElem;

            // Switch from one card to another
            if (prevCardElem && newCardElem && prevCardElem !== newCardElem) {
                this.dispatchCaptureEvent(newCardElem);
                this.dispatchReleaseEvent(prevCardElem);
            }

            // from no card to a card
            else if (!prevCardElem && newCardElem) {
                this.dispatchCaptureEvent(newCardElem);
            }

            // from card to no card
            else if (prevCardElem && !newCardElem) {
                this.dispatchReleaseEvent(prevCardElem);
            }
        }
    }

    // Callback function for mouse events. Creates fake touch points.
    handleMouse(event) {

        if (event.type === "mousedown") {

            // add or remove touch points on shift + click
            if (event.shiftKey) {

                // Delete a fake touch point if it is shift clicked
                // First dispatch a release event if it was targeting a card element
                if (event.target.className === "FakeTouchPoint") {
                    let cardElem = this.fakeTouchPoints[event.target.id].cardElem;
                    if (cardElem) {
                        this.dispatchReleaseEvent(cardElem);
                    }
                    delete this.fakeTouchPoints[event.target.id];
                }

                // Create a fake touch point
                // dispatch a capture event if it is targeting a card elemet
                else {
                    let cardElem = this.getCardElement(event.clientX, event.clientY);
                    this.fakeTouchPoints[this.nextFakeTouchIdentifier] = {
                        x: event.clientX,
                        y: event.clientY,
                        cardElem: cardElem,
                    };
                    if (cardElem) {
                        this.dispatchCaptureEvent(cardElem);
                    }
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
            this.fakeTouchPoints[this.draggingTouchPoint].x = event.clientX;
            this.fakeTouchPoints[this.draggingTouchPoint].y = event.clientY;
        }

        else if (event.type === "mouseup") {
            this.draggingTouchPoint = -1;
        }
    }

    /*// Callback function for all touch events. Gets the real touch points.
    handleTouch(event) {

        // reconstruct the touchPoints object
        this.touchPoints = {};
        for (let touch of event.touches) {
            this.touchPoints[touch.identifier] = {x: touch.clientX, y: touch.clientY};
        }

        // This might stop touch points from also sending click events (needs testing)
        //event.preventDefault();
        //event.stopPropagation();
    }

    // This is called after every handleTouch() and handleMouse()
    handleInput() {

        // Only respond to input in the PLAY phase
        if (this.phase !== Game.Phase.PLAY) {
            return;
        }

        // Combine the real and fake(mouse) touch points into one object
        let allTouchPoints = [...Object.values(this.touchPoints), ...Object.values(this.touchPoints)];

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
    }*/

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
                                size={hexBoard.hexSize * 2 - 1}
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