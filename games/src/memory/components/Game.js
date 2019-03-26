import React from 'react';

import Card from './Card';
import FakeTouchPoints from "./FakeTouchPoints";
import Timer from "./Timer.js";
import CardFlipCounter from "./CardFlipCounter.js";
import StarCounter from "./StarCounter.js";
import InnerFrame from "./InnerFrame.js";
import BorderCells from "./BorderCells.js";
import ScoreParticleManager from "./ScoreParticleManager.js";
import BackgroundGL from "./BackgroundGL.js";
import AspectRatioRect from "./AspectRatioRect.js";
import GameLogic, {GamePhase} from '../controllers/GameLogic.js';
import GameLoop from '../controllers/GameLoop.js';
import AudioManager from "../controllers/AudioManager.js";
import "./Patterns.css";

export default class Game extends React.Component {

    constructor(props) {
        super(props);

        this.loop = new GameLoop();
        this.audioManager = new AudioManager();

        this.gameLogic = new GameLogic();

        this.bodyRef = React.createRef();

        // This binding is necessary to make `this` work in the callback
        this.tick = this.tick.bind(this);
        this.onCardTouchStart = this.onCardTouchStart.bind(this);
        this.onCardTouchEnd = this.onCardTouchEnd.bind(this);
    }

    tick(deltaTime) {
        this.gameLogic.updateGame();
        this.forceUpdate();
    }

    // Game loop stuff
    componentDidMount() {
        this.loop.start();
        this.loopID = this.loop.subscribe(this.tick);
        this.bodyRef.current.addEventListener("touchstart", this.preventDefaultTouch);
        this.bodyRef.current.addEventListener("touchmove", this.preventDefaultTouch);
        this.bodyRef.current.addEventListener("touchend", this.preventDefaultTouch);
        this.bodyRef.current.addEventListener("touchcancel", this.preventDefaultTouch);
    }
    componentWillUnmount() {
        this.loop.stop();
        this.loop.unsubscribe(this.loopID);
    }

    onCardTouchStart(cardKey) {
        this.gameLogic.touchStart(cardKey);
    }

    preventDefaultTouch(event) {
        event.preventDefault();
    }

    onCardTouchEnd(cardKey) {
        this.gameLogic.touchEnd(cardKey);
    }

    render() {

        // Body contains the entire viewport
        const bodyStyle = {
            width: "100vw",
            height: "100vh",
            pointerEvents: "all",
            //background: "radial-gradient(ellipse at center, rgba(255,230,102,1) 0%, rgba(189,107,0,1) 49%, rgba(43,33,0,1) 90%)",
            zIndex: "-1",
            //boxShadow: "inset 0 0 20px #000000",
        };
        const backgroundStyle = {
            zIndex: "-1",
            position: "fixed",
            top: "0vh",
            left: "0vw",
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
            pointerEvents: 'all',
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
        let cards = gameLogic.cards;
        let hexBoard =  gameLogic.hexBoard;
        let innerCells = hexBoard.adjacentInnerCells;
        let outerCells = hexBoard.outerCells;

        let timer1Pos = {x: -26, y: -6.5};
        let timer2Pos = {x: 26, y: 6.5};

        return (
            <div className={"radialGradient1"} style={bodyStyle} ref={this.bodyRef}>
                <div style={boardStyle}>
                    <div>
                        {cards.map((card) => (
                            <Card
                                {...card}
                                card={card}
                                key={card.cardKey.toString()}
                                size={hexBoard.hexSize * 2}
                                onCardTouchStart={this.onCardTouchStart}
                                onCardTouchEnd={this.onCardTouchEnd}
                            />
                        ))}
                    </div>
                    <InnerFrame hull={hexBoard.cornerCellCenters}/>
                    <BorderCells outerCells={outerCells} innerCells={innerCells} size={hexBoard.hexSize * 2}/>
                    <FakeTouchPoints
                        loop={this.loop}
                        clearTouchPoints={this.gameLogic.phase !== GamePhase.PLAY}
                        gameLogic={gameLogic}
                    />
                    <Timer x={timer1Pos.x} y={timer1Pos.y} rotation={0} time={this.gameLogic.timeLeft} loop={this.loop}/>
                    <Timer x={timer2Pos.x} y={timer2Pos.y} rotation={-180} time={this.gameLogic.timeLeft} loop={this.loop}/>
                    <CardFlipCounter
                        x={-26} y={5.5} rotation={0}
                        numFlips={this.gameLogic.concurrentFlips}
                        maxFlips={this.gameLogic.level.maxConcurrentFlips}
                        wizardMatched={this.gameLogic.wizardMatched}
                    />
                    <CardFlipCounter
                        x={26} y={-5.5} rotation={180}
                        numFlips={this.gameLogic.concurrentFlips}
                        maxFlips={this.gameLogic.level.maxConcurrentFlips}
                        wizardMatched={this.gameLogic.wizardMatched}
                    />
                    <StarCounter
                        x={0} y={0}
                        numStars={this.gameLogic.numStars}
                        nthStarThisLevel={this.gameLogic.nthStarThisLevel}
                        timeAtAddStar={this.gameLogic.timeAtAddStar}
                    />
                    <ScoreParticleManager loop={this.loop} timer1Pos={timer1Pos} timer2Pos={timer2Pos}/>
                </div>
            </div>
        )
    }
}

/* Debug stuff
<AspectRatioRect aspectRatio={16/9}/>
<div style={debugRectStyle(hexBoard.innerBounds.x, hexBoard.innerBounds.y)}/>
<div style={debugRectStyle(hexBoard.outerBounds.x, hexBoard.outerBounds.y)}/>
 */

/* Background
<div style={backgroundStyle}>
    <BackgroundGL
        colorA={"#f4fcff"}
        colorB={"#8ca4b8"}
    />
</div>
 */