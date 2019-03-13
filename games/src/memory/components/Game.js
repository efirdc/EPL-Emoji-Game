import React from 'react';
import {Howl, Howler} from 'howler';

import Card from './Card';
import TouchPoint from './TouchPoint.js'
import FakeTouchPoints from "./FakeTouchPoints"
import Timer from "./Timer.js"
import CardFlipCounter from "./CardFlipCounter.js"
import StarCounter from "./StarCounter.js"
import InnerCells from "./InnerCells.js"
import OuterCells from "./OuterCells.js"
import BackgroundGL from "./BackgroundGL.js";
import AspectRatioRect from "./AspectRatioRect.js"
import GameLogic, {GamePhase} from '../controllers/GameLogic.js';
import GameLoop from '../controllers/GameLoop.js';

import Sounds from '../controllers/Sounds.js';

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

        this.gameLogic = new GameLogic(0);

        // This binding is necessary to make `this` work in the callback
        this.tick = this.tick.bind(this);
        this.onCardTouchStart = this.onCardTouchStart.bind(this);
        this.onCardTouchEnd = this.onCardTouchEnd.bind(this);
        this.playWinSound.bind(this);
    }

    playWinSound() {
        Sounds.winSound.play()
    }

    tick(deltaTime) {

        let eventHappened = this.gameLogic.updateGame();
        if (eventHappened.match) {
            let i = Math.min(Math.floor(this.gameLogic.comboCounter / 2), Sounds.matchSounds.length - 1);
            Sounds.matchSounds[i].play();
        }
        if (eventHappened.faceUp) {
            let i = Math.floor(Math.random() * (Sounds.flipSounds.length));
            Sounds.flipSounds[i].play();
        }
        if (eventHappened.gameWon) {
            setTimeout(this.playWinSound, 500);
        }
        if (eventHappened.gameLost) {
            Sounds.loseSound.play();

        }
        if (eventHappened.playStart) {

        }
        if (eventHappened.loadStart) {
            Sounds.loadSound.play()
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
        this.gameLogic.touchStart(cardKey);
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
            background: "radial-gradient(ellipse at center, rgba(255,230,102,1) 0%, rgba(189,107,0,1) 49%, rgba(43,33,0,1) 90%)",
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
        let cards = gameLogic.cards;
        let hexBoard =  gameLogic.hexBoard;
        let innerCells = hexBoard.innerCells;
        let outerCells = hexBoard.outerCells;

        return (
            <div style={bodyStyle}>
                <div style={boardStyle}>
                    <div>
                        {cards.map((card) => (
                            <Card
                                {...card}
                                key={card.cardKey.toString()}
                                size={hexBoard.hexSize * 2}
                                onCardTouchStart={this.onCardTouchStart}
                                onCardTouchEnd={this.onCardTouchEnd}
                            />
                        ))}
                    </div>
                    <InnerCells innerCells={innerCells} size={hexBoard.hexSize * 2} hull={hexBoard.cornerCellCenters}/>
                    <OuterCells outerCells={outerCells} size={hexBoard.hexSize * 2}/>
                    <FakeTouchPoints loop={this.loop} clearTouchPoints={this.gameLogic.phase !== GamePhase.PLAY}/>
                    <Timer x={-23} y={-5} rotation={0} time={this.gameLogic.timeLeft} loop={this.loop}/>
                    <Timer x={23} y={5} rotation={-180} time={this.gameLogic.timeLeft} loop={this.loop}/>
                    <CardFlipCounter
                        x={-23} y={5} rotation={0}
                        numFlips={this.gameLogic.concurrentFlips}
                        maxFlips={this.gameLogic.level.maxConcurrentFlips}
                    />
                    <CardFlipCounter
                        x={23} y={-5} rotation={180}
                        numFlips={this.gameLogic.concurrentFlips}
                        maxFlips={this.gameLogic.level.maxConcurrentFlips}
                    />
                    <StarCounter x={0} y={0} numStars={this.gameLogic.numStars}/>
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