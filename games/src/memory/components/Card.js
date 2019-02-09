import React from 'react';

const styles = {
    card : {
        // Parent element controls the size of the card
        "height" : "100%",
        "width" : "100%",

        // Center content
        "display": "flex",
        "justify-content": "center",
        "align-items": "center",

        // Styling
        "backgroundColor" : "#1e1e1e",
        "color": "#ffffff",
        "border-radius": "15px",
        "font-size": "50px",
        "boxShadow": "0 0 20px 0px #000000",
    },
};

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