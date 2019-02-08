import React from 'react';
import GameBoard from './GameBoard.js';
import Memory from '../controllers/Memory.js';

const styles = {
    body : {
        "width": "90%",
        "height" : "90%",
        "color": "#2e3d49",
        "margin" : "0 auto"
    },

    title : {
        "fontFamily" : "Open Sans, sans-serif",
        "fontWeight" : "300",
        "margin" : "0 auto"
    },

    board : {
        "height" : "100%",
        "margin": "0 auto",
        "background": "-webkit-linear-gradient(290deg, #00C9FF 0%, #92FE9D 100%)",
        "padding": "20px",
        "borderRadius": "10px",
        "boxShadow": "12px 15px 20px 9px rgba(46, 61, 73, 0.10)",
    },
};

class Game extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            gameLogic: new Memory.Game(4, 8, 40),
        };
    }

    render() {
        var gameLogic = this.state.gameLogic;
        var gameState = gameLogic.gameState;
        return (
        <div style = {styles.body}>
            <div style = {styles.board}>
                <GameBoard gameState = {gameState}/>
            </div>
        </div>
        )
    }
}

export default Game;