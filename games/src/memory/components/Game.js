import React from 'react';
import GameBoard from './GameBoard.js';
import BackgroundGL from "./BackgroundGL.js";
import Memory from '../controllers/Memory.js';

import winSoundFile from '../sounds/win.wav';
import loseSoundFile from '../sounds/lose.wav'

const styles = {
    body : {
        height: "100vh", // height is 100% of the viewport size
        display: "flex", // centers content vertically and horizontally
        //background: "-webkit-linear-gradient(290deg, #00C9FF 0%, #92FE9D 100%)",
        boxShadow: "inset 0 0 20px #000000",
    },

    background : {
        zIndex: "-1",
        position: "absolute",
    }
};


class Game extends React.Component {
    constructor(props){
        super(props);

        //this.handlePress = this.handlePress.bind(this);
        //this.handleRelease = this.handleRelease.bind(this);
        this.handleClick = this.handleClick.bind(this);

        // Create game logic object and add some levels
        var gameLogic = new Memory.Game(4, 5, 40);
        gameLogic.addLevel(5, 6, 40);
        gameLogic.addLevel(6, 7, 45);
        gameLogic.addLevel(7, 8, 60);
        gameLogic.addLevel(8, 9, 80);

        this.winSound = new Audio(winSoundFile);
        this.loseSound = new Audio(loseSoundFile);

        this.state = {
            gameLogic: gameLogic,
        };
    }

/*     handlePress(row, col) {
        var gameLogic = this.state.gameLogic;
        var gameState = gameLogic.gameState;
        
        gameLogic.pressCard(row, col);
        
        if (gameLogic.isGameLost()) {
            gameLogic.setLevel(0);
        }
        if (gameLogic.isGameWon()) {
            setTimeout(gameLogic.nextLevel(), 1000); // one second delay so the level jump isn't so jarring
            ;
        }
        this.forceUpdate();
        
        
    }

    handleRelease = (row, col) => {
        var gameLogic = this.state.gameLogic;

        this.state.gameLogic.releaseCard(row, col);
        
        if (gameLogic.isGameLost()) {
            gameLogic.setLevel(0);
        }
        if (gameLogic.isGameWon()) {
            setTimeout(gameLogic.nextLevel(), 1000); // one second delay so the level jump isn't so jarring
            ;
        }
        this.forceUpdate();


        
    } */

    // Called every time a card is clicked
    handleClick(row, col){

        var gameLogic = this.state.gameLogic;
        var gameState = gameLogic.gameState;

        // Toggle the card
        var card = gameState.board[row][col];
        if (card.faceUp) { //picture currently visible
            setTimeout(gameLogic.releaseCard(row, col), 1000); 
        } else { // picture not currently visible
            setTimeout(gameLogic.pressCard(row, col),1000); // icon visible
        }

        // Handle game win/loss conditions
        if (gameLogic.isGameLost()) {
            this.loseSound.play();
            gameLogic.setLevel(0);
        }
        if (gameLogic.isGameWon()) {
            
            this.winSound.play();

            setTimeout(gameLogic.nextLevel(), 1000); // one second delay so the level jump isn't so jarring
            ;
    
        }
        
        

        // Have to force the component to re-render because we touched state the "bad" way
        this.forceUpdate();
    }

    render() {
        var gameLogic = this.state.gameLogic;
        var gameState = gameLogic.gameState;
        return (
            <div style={styles.body}>
                <div style={styles.background}>
                    <BackgroundGL
                        colorA={"#f4fcff"}
                        colorB={"#8ca4b8"}
                    />
                </div>
                <GameBoard
                    gameState={gameState}
                    //press = {(row, col) => this.handlePress(row, col)}
                    //release = {(row, col) => this.handleRelease(row, col)}
                    onClick = {(row, col) => this.handleClick(row, col)}
                />
            </div>
        )
    }
}

export default Game;