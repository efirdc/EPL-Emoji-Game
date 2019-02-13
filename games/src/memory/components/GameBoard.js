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
        gridRowGap: "5px", // spacing between cards
        margin: "0 0 3vh 0",

    },

    progressBar: {
        margin: "12vh 0vh 2vh 2vh"
    }
};

class GameBoard extends React.Component {
    constructor(props) {
        super(props);

        this.renderBoard = this.renderBoard.bind(this);
        this.initialBoard = this.initialBoard.bind(this);

        this.state = {
            hexSize: 100 / this.props.gameState.len,
            
        }
        

    }

    initialBoard() {
        // Flatten the gameStates 2d board array into a 1d array of cards
        // Also give each card its row and column as a property since its needed later
        var gameState = this.props.gameState;
        var cards = [];
        for (var row = 0; row < gameState.rows; row++) {
            for (var col = 0; col < gameState.columns; col++) {
                cards.push(gameState.board[row][col]);
            }
        }

        console.log(cards)
        return cards;

    }

    renderBoard(cards) {

        var gameState = this.props.gameState;
        // Set the number of rows and columns, as well as the size
        var boardStyle = {
            ...styles.board,
            gridTemplateColumns: "14vh ".repeat(gameState.columns),
            gridTemplateRows: "13vh ".repeat(gameState.rows),
            
        };

        // Progress bar values
        var pbPercent = (gameState.flipsLeft / gameState.initialFlips) * 100;
        return(
            <div style = {styles.container}>
            <div className = "GameBoard" style = {boardStyle}>
                {cards.map((card) => (
                    <Card
                        {...card}
                        key={card.row * 10 + card.col}
                        //onClick={() => this.props.onClick(card.row, card.col)}
                        onTouchStart = {() => this.props.press(card.row, card.col)}
                        onTouchEnd = {() => this.props.release(card.row, card.col)}
                        onMouseDown = {() => this.props.press(card.row, card.col)}
                        onMouseUp = {() => this.props.release(card.row, card.col)}
                        onMouseLeave = {() => this.props.release(card.row, card.col)}
                        hexSize = {this.state.hexSize}
                        row = {card.row}
                        matched = {card.matched}
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

    render() {
        // map Card components to the 1d array of cards
        // a unique key is calculated using the row and column of each Card so that React stops complaining
        return (
            this.renderBoard(this.initialBoard())
        );
    }
}

export default GameBoard;
