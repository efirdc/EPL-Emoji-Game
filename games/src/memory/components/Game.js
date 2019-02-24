import React from 'react';

import Card from './Card';
import TouchPoint from './TouchPoint.js'
import Timer from "./Timer.js"
import BackgroundGL from "./BackgroundGL.js";
import AspectRatioRect from "./AspectRatioRect.js"
import GameLogic from '../controllers/GameLogic.js';
import HexBoard from '../controllers/HexBoard.js';
import GameLoop from '../controllers/GameLoop.js';


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
        this.gameLogic.addLevel(100, 12, 120);
        this.gameLogic.setLevel(0);
        this.hexBoard.distributeBlobs(this.gameLogic.numCards);

        this.touchPoints = [];
        this.fakeTouchPoints = [];
        this.touchPointSize = 30;
        this.mouseDown = false;

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
                this.timer = 0;
            }
        }

        else if (this.phase === Game.Phase.PLAY) {
            if (this.gameLogic.isGameLost()) {
                this.phase = Game.Phase.LEVEL_LOSE;
                setTimeout(() => new Audio(loseSoundFile).play(), 250);
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
        this.unsubscribe(this.loopID);
    }

    // Callback function for mouse events. Creates fake touch points.
    handleMouse(event) {

        // shift + click to add/remove touch points
        if (event.type === "mousedown") {
            this.mouseDown = true;
            if (event.shiftKey) {
                if (event.target.className === "FakeTouchPoint") {
                    this.fakeTouchPoints.splice(event.target.id, 1);
                } else {
                    this.fakeTouchPoints.push({x: event.clientX, y: event.clientY});
                }
            }
        }

        // touchpoint drag behavior
        else if (event.type === "mousemove" && this.mouseDown && event.target.className === "FakeTouchPoint") {
            this.fakeTouchPoints[event.target.id] = {x: event.clientX, y: event.clientY};
        }

        else if (event.type === "mouseup") {
            this.mouseDown = false;
        }

        this.handleInput();
    }

    // Callback function for all touch events. Gets the real touchpoints.
    handleTouch(event) {

        // Update the array of touch points
        this.touchPoints = [];
        for (let touch of event.touches) {
            this.touchPoints.push({x: touch.clientX, y: touch.clientY});
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

        // Combine the real and fake(mouse) touch points into one array
        let allTouchPoints = this.touchPoints.concat(this.fakeTouchPoints);

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
                        {this.touchPoints.map((touchPoint, index) => (
                            <TouchPoint
                                {...touchPoint}
                                key={index.toString()}
                                size={this.touchPointSize}
                            />
                        ))}
                    </div>
                    <div>
                        {this.fakeTouchPoints.map((touchPoint, index) => (
                            <TouchPoint
                                {...touchPoint}
                                fake={true}
                                id={index}
                                key={index.toString()}
                                size={this.touchPointSize}
                            />
                        ))}
                    </div>
                    <div style={debugRectStyle(hexBoard.innerBox.x, hexBoard.innerBox.y)}/>
                    <div style={debugRectStyle(hexBoard.outerBox.x, hexBoard.outerBox.y)}/>
                    <Timer x={-20} y={0} rotation={90} time={this.gameLogic.timeLeft} loop={this.loop}/>
                    <Timer x={20} y={0} rotation={-90} time={this.gameLogic.timeLeft} loop={this.loop}/>
                </div>
            </div>
        )
    }
}