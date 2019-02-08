import React from 'react';
import Card from './Card';

const styles = {

};

class GameBoard extends React.Component {
    constructor(props) {
        super(props);
    }

    renderRow(row) {
        return (
            <div>
                {row.map((card) => (<Card id = {card.cardID}/>))}
            </div>
        )
    }

    render() {
        var gameState = this.props.gameState;
        return (
            <div>
                {gameState.board.map((row) => (this.renderRow(row)))}
            </div>
        );
    }
}

export default GameBoard;
