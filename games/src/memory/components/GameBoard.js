import React from 'react';
import Card from './Card';
import {Line} from 'rc-progress';

const styles = {

    container: {
        margin: "auto",
    },

    board: {
        display: "grid",
        gridColumnGap: "2vh",
        gridRowGap: "5px" // spacing between cards
    },

    progressBar: {
        margin: "6vh 0vh 2vh 0vh"
    }
};

class GameBoard extends React.Component {
    constructor(props) {
        super(props);


        this.state = {
            hexSize: 100 / this.props.gameState.len
        }
        

    }

    render() {

        // Flatten the gameStates 2d board array into a 1d array of cards
        // Also give each card its row and column as a property since its needed later
        var gameState = this.props.gameState;
        var cards = [];
        for (var row = 0; row < gameState.rows; row++) {
            for (var col = 0; col < gameState.columns; col++) {
                cards.push(gameState.board[row][col]);
            }
        }

        // Set the number of rows and columns, as well as the size
        var boardStyle = {
            ...styles.board,
            gridTemplateColumns: "14vh ".repeat(gameState.columns),
            gridTemplateRows: "14vh ".repeat(gameState.rows),
            
        };

        // Progress bar values
        var pbPercent = (gameState.flipsLeft / gameState.initialFlips) * 100;

        

        // map Card components to the 1d array of cards
        // a unique key is calculated using the row and column of each Card so that React stops complaining
        return (
            <div style = {styles.container}>
                <div className = "GameBoard" style = {boardStyle}>
                    {cards.map((card) => (
                        <Card
                            {...card}
                            key={card.row * 10 + card.col}
                            onClick={() => this.props.onClick(card.row, card.col)}
                            hexSize = {this.state.hexSize}
                            row = {card.row}
                        />
                    ))}
                </div>
                <Line
                    style={styles.progressBar}
                    percent={pbPercent-6}
                    strokeWidth="6"
                    trailWidth="6"
                    strokeColor="#212121"
                />
            </div>
        );
    }
}

export default GameBoard;
