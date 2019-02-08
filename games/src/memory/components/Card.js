import React from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';


const styles = {

    card : {
        "height" : "100px",
        "width" : "100px",
        "backgroundColor" : "#2e3d49",
        "display" : "inline-block",
        "margin" : "0 10px 10px 0",
        //"lineHeight" : "280px",
        "color": "#ffffff",
        "padding": "0px 0px 0px 0px",
        "bottom" : "10px",
        "text-align": "center",
        "border-radius": "8px",
        "vertical-align": "top",
        "font-size": "20px",
    },

    icon: {
        "margin" : "0 auto",
        "display" : "inline-block"
    }
}

export default class Card extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div style = {styles.card}>
                {this.props.id.toString()}
            </div>
        )
    }
}