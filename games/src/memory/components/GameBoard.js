import React from 'react';
import Card from './Card';

const styles = {
    board : {
        display: "grid",
        margin: "auto",
        gridGap: "2vh 2vh", // spacing between cards
    },
};

class GameBoard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        // Flatten the gameStates 2d board array into a 1d array of cards
        // Also give each card its row and column as a property since its needed later
        var gameState = this.props.gameState;
        var cards = [];
        for (var row = 0; row < gameState.rows; row++) {
            for (var col = 0; col < gameState.columns; col++) {
                var card = {row:row, col:col};
                card = Object.assign(card, gameState.board[row][col]);
                cards.push(card);
            }
        }

        // Set the number of rows and columns, as well as the size
        var boardStyle = {
            ...styles.board,
            gridTemplateColumns: "10vh ".repeat(gameState.columns),
            gridTemplateRows: "10vh ".repeat(gameState.rows),
        };

        // map Card components to the 1d array of cards
        // a unique key is calculated using the row and column of each Card so that React stops complaining
        return (
            <div style = {boardStyle}>
                {cards.map((card) => (
                    <Card
                        key={card.row * 10 + card.col}
                        id={card.cardID}
                        faceUp={card.faceUp}
                        onClick={() => this.props.onClick(card.row, card.col)}
                    />
                    ))}
            </div>
        );
    }
}

export default GameBoard;
