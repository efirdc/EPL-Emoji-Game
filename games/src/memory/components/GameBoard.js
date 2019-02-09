import React from 'react';
import Card from './Card';

const styles = {
    board : {
        "display": "grid",
        "margin": "auto",
        "grid-gap": "2vh 2vh", // spacing between cards
    },
};

class GameBoard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        // Flatten the gameStates 2d board array into a 1d array of cards
        var gameState = this.props.gameState;
        var cards = [];
        for (var row = 0; row < gameState.rows; row++) {
            for (var col = 0; col < gameState.columns; col++) {
                cards.push(gameState.board[row][col]);
            }
        }

        // Set the size of each row and column
        styles.board["grid-template-columns"] = "10vh ".repeat(gameState.columns);
        styles.board["grid-template-rows"] = "10vh ".repeat(gameState.rows);

        // map Card components to the 1d array of cards
        return (
            <div style = {styles.board}>
                {cards.map((card) => (<Card id = {card.cardID}/>))}
            </div>
        );
    }
}

export default GameBoard;
