import React from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';


const styles = {

    card : {
        "height" : "155px",
        "width" : "200px",
        "backgroundColor" : "#2e3d49",
        "display" : "inline-block",
        "margin" : "0 20px 10px 0",
        "lineHeight" : "280px",
        "color": "#ffffff",
        'font-family': 'FontAwesome',
        "padding": "0px 25px 60px 15px",
        "bottom" : "10px",
        "text-align": "center",
        "border-radius": "8px",
        "vertical-align": "top"
        
        
    },

    icon: {
        "margin" : "0 auto",
        "display" : "inline-block"
        
        
    }
}

export default class Card extends React.Component {
    constructor(props) {
        super(props);
        this.symbol = this.props.symbol;
    }

    render() {
        var symbol = this.symbol
        console.log(symbol)
        return(
            <li style = {styles.card}>
                <FontAwesomeIcon icon = {symbol} size = "4x" style = {styles.icon}/>
            </li>
        )
    }
}