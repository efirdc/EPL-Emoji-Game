import React from 'react';
import Card from './Card';
import {Line} from 'rc-progress';

const styles = {
    container: {
        margin: "auto",
    },

    progressBar: {
        marginTop: "14vh"
    },
};

class GameBoard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            windowWidth: 0,
            windowHeight: 0
        };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    // Component can respond to window resize.
    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
    updateWindowDimensions() {
        this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });
    }

    render() {
        var gameState = this.props.gameState;

        // Hex grid alignment values
        var maxHeightPercent = 0.6;
        var maxWidthPercent = 0.9;
        var heightConstraint = (maxHeightPercent * this.state.windowHeight)  / gameState.rows;
        var widthConstraint = (maxWidthPercent * this.state.windowWidth) / gameState.columns;
        var gridSpacing = Math.min(heightConstraint, widthConstraint);
        var rowGap = gridSpacing * 0.3333333;
        var columnOffset = (gridSpacing + rowGap) / 2;

        // Set the number of rows and columns, as well as the size
        var boardStyle = {
            display: "grid",
            gridTemplateColumns: (gridSpacing + "px ").repeat(gameState.columns),
            gridTemplateRows: (gridSpacing + "px ").repeat(gameState.rows),
            gridRowGap: rowGap + "px",
        };

        var progressBarStyle = {
            marginTop: gridSpacing + "px",
        };

        // Flatten the gameStates 2d board array into a 1d array of cards
        // Also give each card its row and column as a property since its needed later
        var cards = [];
        for (var row = 0; row < gameState.rows; row++) {
            for (var col = 0; col < gameState.columns; col++) {
                cards.push(gameState.board[row][col]);
            }
        }

        // Progress bar values
        var pbPercent = (gameState.flipsLeft / gameState.initialFlips) * 100;

        // Card components are mapped to the 1d array of cards
        // a unique key is calculated using the row and column of each Card so that React stops complaining
        return(
            <div style={styles.container}>
                <div style={boardStyle}>
                    {cards.map((card) => (
                        <Card
                            {...card}
                            key={card.row * 1000 + card.col}
                            columnOffset={columnOffset + "px"}
                            onClick={() => this.props.onClick(card.row, card.col)}
                        />
                    ))}
                </div>
                <Line
                    style={progressBarStyle}
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
