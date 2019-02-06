import React from 'react';
import Card from './card';
var shuffle = require('shuffle-array')




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
        
    }
}
class GameBoard extends React.Component {
    constructor(props){
        super(props);
        this.symbols = [
            {id: 1, symbol: "fa-angry"},
            {id: 2, symbol: "angry"},
            {id: 3, symbol: "flushed"},
            {id: 4, symbol: "flushed"},
            {id: 5, symbol: "grin"},
            {id: 6, symbol: "grin"},
            {id: 7, symbol: "coffee"},
            {id: 8, symbol: "coffee"},
            {id: 9, symbol: "grin-hearts"},
            {id: 10, symbol: "grin-hearts"},
            {id: 11, symbol: "meh-blank"},
            {id: 12, symbol: "meh-blank"}
        ]
        shuffle(this.symbols)

        console.log(this.symbols)
    


    }
    render() {
        return(
            <div style = {styles.body}>
                <h1 style = {styles.title}>Memory</h1>
                <ul style = {styles.board}>
                {
                    this.symbols.map((card) =>(
                        <Card key = {card.id} symbol = {card.symbol}/>
                    ))
                }
                </ul>
            </div>
        )
    }
}

export default GameBoard;
