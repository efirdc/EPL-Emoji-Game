// This is based on https://github.com/AaronCCWong/react-card-flip/blob/master/src/ReactCardFlip.jsx
import React from 'react';

const styles = {
    container: {
        position: "relative", // definitely does something
        transformStyle: 'preserve-3d', // probably does something
        perspective: "500px", // lower = more stupid looking
    },

    card: {
        // Parent element controls the size of the card
        height: "100%",
        width: "100%",

        // Center content
        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        // Styling
        borderRadius: "15px",
        fontSize: "50px",
        boxShadow: "0 0 10px #000000",

        // Flip
        backfaceVisibility: 'hidden',
        left: '0',
        top: '0',
        transformStyle: 'preserve-3d',
        transition: "transform 0.3s",
        position: "absolute",
    }
};

class Card extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(){
        this.props.onClick()
    }

    render() {

        // front/back css styles change on every render
        const cardBack = {
            ...styles.card,

            zIndex: '2',

            transform: `rotateY(${this.props.faceUp ? 180 : 0}deg)`,
            backgroundColor : "#1e1e1e",
        };
        const cardFront = {
            ...styles.card,

            zIndex: '1',

            transform: `rotateY(${this.props.faceUp ? 0 : -180}deg)`,
            backgroundColor : "#eaf7ff",
        };

        return(
            <div style={styles.container}>
                <div
                    style={cardFront}
                    onClick={this.handleClick}
                >
                    {this.props.cardID}
                </div>

                <div
                    style={cardBack}
                    onClick={this.handleClick}
                >
                    {}
                </div>
            </div>
        )
    }
}

export default Card;