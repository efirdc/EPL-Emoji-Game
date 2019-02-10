import React from 'react';
import GameBoard from './GameBoard.js';
import BackgroundGL from "./BackgroundGL.js";
import Memory from '../controllers/Memory.js';

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

        // Create game logic object and add some levels
        var gameLogic = new Memory.Game(4, 5, 40);
        gameLogic.addLevel(5, 6, 40);
        gameLogic.addLevel(6, 7, 50);
        gameLogic.addLevel(7, 8, 60);
        gameLogic.addLevel(8, 9, 80);

        this.state = {
            gameLogic: gameLogic,
        };
    }

    // Called every time a card is clicked
    handleClick(row, col){

        var gameLogic = this.state.gameLogic;
        var gameState = gameLogic.gameState;

        // Toggle the card
        var card = gameState.board[row][col];
        if (card.faceUp) {
            gameLogic.releaseCard(row, col);
        } else {
            gameLogic.pressCard(row, col);
        }

        // Handle game win/loss conditions
        if (gameLogic.isGameLost()) {
            gameLogic.setLevel(0);
        }
        if (gameLogic.isGameWon()) {
            gameLogic.nextLevel();
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
                    <BackgroundGL/>
                </div>
                <GameBoard
                    gameState={gameState}
                    onClick={(row, col) => this.handleClick(row, col)}
                />
            </div>
        )
    }
}

export default Game;