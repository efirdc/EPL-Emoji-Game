import React from 'react';
import GameBoard from './GameBoard.js';
import Memory from '../controllers/Memory.js';

const styles = {
    body : {
        "height" : "100vh", // height is 100% of the viewport size
        "display": "flex", // centers content vertically and horizontally
        "background": "-webkit-linear-gradient(290deg, #00C9FF 0%, #92FE9D 100%)",
        "boxShadow": "inset 0 0 20px #000000",
    },
};

class Game extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            gameLogic: new Memory.Game(7, 10, 40),
        };
    }

    render() {
        var gameLogic = this.state.gameLogic;
        var gameState = gameLogic.gameState;
        return (
        <div style = {styles.body}>
            <GameBoard gameState = {gameState}/>
        </div>
        )
    }
}

export default Game;