import React from 'react';

import Card from './Card';
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
        this.gameLogic.addLevel(100, 200, 8);
        this.gameLogic.setLevel(0);
        this.hexBoard.distributeBlobs(this.gameLogic.size);

        this.phase = Game.Phase.LEVEL_LOAD;
        this.timer = 0;
        this.cardDisplayPercent = 0;

        // This binding is necessary to make `this` work in the callback
        this.handleFlip = this.handleFlip.bind(this);
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
            this.forceUpdate();
        }

        else if (this.phase === Game.Phase.PLAY) {

        }
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

    loadNextLevel (prevLevelWon) {
        if (prevLevelWon) {
            this.gameLogic.nextLevel();
        } else {
            this.gameLogic.setLevel(0);
        }

        this.hexBoard.distributeBlobs(this.gameLogic.size);
        this.phase = Game.Phase.LEVEL_LOAD;
        this.timer = 0;
        this.cardDisplayPercent = 0;
        this.forceUpdate();
    }

    // Called every time a card is clicked
    handleFlip(cardKey) {

        if (this.phase !== Game.Phase.PLAY) {
            return;
        }

        // Toggle the card
        let card = this.gameLogic.cards[cardKey];
        if (card.faceUp) {
            this.gameLogic.releaseCard(cardKey);
        } else {
            this.gameLogic.pressCard(cardKey);
        }

        // Handle game win/loss conditions
        if (this.gameLogic.isGameWon()) {
            this.phase = Game.Phase.LEVEL_WIN;
            setTimeout(() => new Audio(winSoundFile).play(), 250);
            setTimeout(() => this.loadNextLevel(true), 2000.0);
        }
        else if (this.gameLogic.isGameLost()) {
            this.phase = Game.Phase.LEVEL_LOSE;
            setTimeout(() => new Audio(loseSoundFile).play(), 250);
            setTimeout(() => this.loadNextLevel(true), 2000.0);
        }
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
            <div style={bodyStyle}>
                <AspectRatioRect aspectRatio={16/9}/>
                <div style={boardStyle}>
                    <div>
                        {partialCards.map((card) => (
                            <Card
                                {...card}
                                {...blobs[card.cardKey]}
                                key={card.cardKey.toString()}
                                size={hexBoard.hexSize * 2 - 1}
                                flipHandler={this.handleFlip}
                                loop={this.loop}
                            />
                        ))}
                    </div>
                    <div style={debugRectStyle(hexBoard.innerBox.x, hexBoard.innerBox.y)}/>
                    <div style={debugRectStyle(hexBoard.outerBox.x, hexBoard.outerBox.y)}/>
                </div>
            </div>
        )
    }
}