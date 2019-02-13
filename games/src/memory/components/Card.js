// This is based on https://github.com/AaronCCWong/react-card-flip/blob/master/src/ReactCardFlip.jsx
import React from 'react';
import './board.css';
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
        
        boxShadow: "2px 4px 6px 0 hsla(0, 0%, 0%, 0.1)",

        // Flip
        backfaceVisibility: 'hidden',
        left: '0',
        top: '0',
        transformStyle: 'preserve-3d',
        transition: "transform 0.3s",
        position: "absolute",

        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
    },

    
};

class Card extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            offset : this.props.offset ? "offset" : "",
            pix : this.props.hexSize * 3 
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

            width: `${this.state.pix}vh`,
            height: `${this.state.pix}vh`,
            transform: `rotateY(${this.props.faceUp ? 180 : 0}deg)`,
            backgroundColor : "#1e1e1e",
        };
        const cardFront = {
            ...styles.card,

            zIndex: '1',

            width: `${this.state.pix}vh`,
            height: `${this.state.pix}vh`,
            transform: `rotateY(${this.props.faceUp ? 0 : -180}deg)`,
            backgroundColor : "#eaf7ff",
        };

        return(
            <div className = {this.state.offset} style={styles.container}>
                <div
                    className = "cardFront"
                    style={cardFront}
                    onClick={this.handleClick}
                >
                    <h3 style = {{fontFamily: "Coda", fontWeight: "200"}}>{this.props.cardID}</h3>
                </div>

                <div
                    className = "cardBack"
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