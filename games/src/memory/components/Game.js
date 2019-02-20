import React from 'react';
import PropTypes from 'prop-types';

import Card from './Card';
import BackgroundGL from "./BackgroundGL.js";
import AspectRatioRect from "./AspectRatioRect.js"
import Memory from '../controllers/Memory.js';
import HexBoard from '../controllers/HexBoard.js';
import GameLoop from '../controllers/GameLoop.js';

import winSoundFile from '../sounds/win.wav';
import loseSoundFile from '../sounds/lose.wav'

const Phase = {
    PLAY: 0,
    LEVEL_LOAD: 1,
};

class Game extends React.Component {

    static childContextTypes = {
        loop: PropTypes.object,
    };

    constructor(props) {
        super(props);

        this.loop = new GameLoop();

        this.hexBoard = new HexBoard();
        this.gameLogic = new Memory.Game(300, this.hexBoard.size * 2);
        this.hexBoard.distributeBlobs(this.gameLogic.getLevel().size);

        this.winSound = new Audio(winSoundFile);
        this.loseSound = new Audio(loseSoundFile);

        this.phase = Phase.LEVEL_LOAD;
        this.timer = 0;
        this.levelLoadTime = 1.5;
        this.cardDisplayPercent = 0;

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
        this.tick = this.tick.bind(this);
    }

    tick(deltaTime) {


        if (this.phase === Phase.LEVEL_LOAD) {
            if (this.timer < this.levelLoadTime) {
                this.timer += deltaTime;
                this.cardDisplayPercent = this.timer / this.levelLoadTime;
                this.forceUpdate();
            } else {
                this.phase = Phase.Play;
            }
        }

        else if (this.phase === Phase.PLAY) {

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
    getChildContext() {
        return {loop: this.loop,};
    }

    // Called every time a card is clicked
    handleClick(key){
        if (this.phase === Phase.LEVEL_LOAD) {
            return;
        }
        var gameLogic = this.gameLogic;
        var gameState = gameLogic.gameState;
        var hexBoard = this.hexBoard;

        // Toggle the card
        var card = gameState.cards[key];
        if (card.faceUp) {
            gameLogic.releaseCard(key);
        } else {
            gameLogic.pressCard(key);
        }

        // Handle game win/loss conditions
        if (gameLogic.isGameWon()) {
            this.winSound.play();
            gameLogic.nextLevel();
            hexBoard.distributeBlobs(gameLogic.getLevel().size);
            this.cardDisplayPercent = 0;
        }
        if (gameLogic.isGameLost()) {
            this.loseSound.play();
            gameLogic.setLevel(0);
            hexBoard.distributeBlobs(gameLogic.getLevel().size);
            this.cardDisplayPercent = 0;
        }

        // Have to force the component to re-render because we touched state the "bad" way
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

        var hexBoard = this.hexBoard;
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

        var gameLogic = this.gameLogic;
        var gameState = gameLogic.gameState;
        var hexPoints = hexBoard.pointsFlat;
        var blobs = hexBoard.blobData;

        var partialCards = gameState.cards.slice(0, blobs.length * this.cardDisplayPercent);

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
                                onClick={this.handleClick}
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

export default Game;