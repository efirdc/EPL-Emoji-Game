import React from 'react';
import clickSoundFile from "../sounds/card_flip4.wav";
import matchSoundFile from "../sounds/match3.wav";

class Card extends React.Component {
    constructor(props) {
        super(props);

        this.clickSound = new Audio(clickSoundFile);
        this.matchSound = new Audio(matchSoundFile);
        this.matchSound.volume = 0.65;
        this.clickSound.volume = 0.65;

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.matched && !this.props.matched && !this.props.faceUp) {
            this.matchSound.play();
        }
        if (nextProps.faceUp !== this.props.faceUp) {
            this.clickSound.play();
        }
    }

    handleClick(){
        this.props.onClick()
    }

    getStyles() {
        const evenCol = this.props.col % 2 === 0;
        const container = {
            // Reposition the element
            position: "relative",
            top: evenCol ? "0" : this.props.columnOffset,

            // Needed to make the card 3d flip stuff look right
            transformStyle: 'preserve-3d',
            perspective: "1000px",

            // Styling
            filter: "drop-shadow(0 0 0.2vh #000000)",
        };

        const cardCommon = {
            // Parent element controls the size of the card
            height: "125%",
            width: "125%",

            // Center content
            display: "flex",
            justifyContent: "center",
            alignItems: "center",

            // Styling
            fontSize: "50px",

            // Flip
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
            transition: "transform 0.3s",
            position: "absolute",

            // Hexagon
            clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
        };

        const cardBack = {
            ...cardCommon,

            zIndex: '2',

            transform: `rotateY(${this.props.faceUp ? 180 : 0}deg)`,
            backgroundColor : "#1e1e1e",
        };
        const cardFront = {
            ...cardCommon,

            zIndex: '1',

            transform: `rotateY(${this.props.faceUp ? 0 : -180}deg)`,
            backgroundColor : this.props.matched ? "#5ef997" : "#e5eae8",
        };

        return {container, cardFront, cardBack};
    }

    render() {
        const styles = this.getStyles();
        return(
            <div style={styles.container} >
                <div
                    style={styles.cardFront}
                    onClick={this.handleClick}
                >
                    <h3 style = {{fontFamily: "Coda", fontWeight: "200"}}>{this.props.cardID}</h3>
                </div>
                <div
                    style={styles.cardBack}
                    onClick={this.handleClick}
                >
                    {}
                </div>
            </div>
        )
    }
}

export default Card;