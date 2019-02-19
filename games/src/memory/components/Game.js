import React from 'react';
import Card from './Card';
import BackgroundGL from "./BackgroundGL.js";
import AspectRatioRect from "./AspectRatioRect.js"
import Memory from '../controllers/Memory.js';
import HexBoard from '../controllers/HexBoard.js'

import winSoundFile from '../sounds/win.wav';
import loseSoundFile from '../sounds/lose.wav'


class Game extends React.Component {
    constructor(props) {
        super(props);

        this.hexBoard = new HexBoard();
        this.gameLogic = new Memory.Game(210, 250);
        this.hexBoard.distributeBlobs(this.gameLogic.getLevel().size);

        this.winSound = new Audio(winSoundFile);
        this.loseSound = new Audio(loseSoundFile);

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
    }

    // Called every time a card is clicked
    handleClick(key){

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
        }
        if (gameLogic.isGameLost()) {
            this.loseSound.play();
            gameLogic.setLevel(0);
            hexBoard.distributeBlobs(gameLogic.getLevel().size);
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

        var gameLogic = this.gameLogic;
        var gameState = gameLogic.gameState;
        var hexBoard = this.hexBoard;
        var hexPoints = hexBoard.pointsFlat;
        var blobs = hexBoard.blobData;

        return (
            <div style={bodyStyle}>
                <AspectRatioRect aspectRatio={16/9}/>
                <div style={boardStyle}>
                    {gameState.cards.map((card) => (
                        <Card
                            {...card}
                            {...blobs[card.cardKey]}
                            key={card.cardKey.toString()}
                            size={hexBoard.hexSize * 2 - 1}
                            onClick={this.handleClick}
                        />
                    ))}
                </div>
            </div>
        )
    }
}

export default Game;