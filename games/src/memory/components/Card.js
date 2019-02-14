// This is based on https://github.com/AaronCCWong/react-card-flip/blob/master/src/ReactCardFlip.jsx
import React from 'react';

import './board.css';
import clickSoundFile from "../sounds/card_flip4.wav";
import matchSoundFile from "../sounds/match3.wav";


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
        
        boxShadow: "2px 4px 6px 0 hsla(0, 0%, 0%, 0.2)",

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
            offset : this.props.row % 2 == 0 ? "offset" : "false",
            pix : this.props.hexSize * 3,
        };
        

        this.clickSound = new Audio(clickSoundFile);
        this.matchSound = new Audio(matchSoundFile);
        this.matchSound.volume = 0.65;
        this.clickSound.volume = 0.65;

        // This binding is necessary to make `this` work in the callback
        
        this.handleClick = this.handleClick.bind(this);
        /* this.handlePressStart = this.handlePressStart.bind(this);
        this.handlePressEnd = this.handlePressEnd.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this); */

        
        
    }

    componentWillReceiveProps(nextProps){
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

   /*  handlePressStart() {
        console.log("touch started")
        this.props.onTouchStart();
    }

    handlePressEnd() {
        console.log("touch ended")
        this.props.onTouchEnd();
    }

    handleMouseDown() {
        this.props.onMouseDown();
    }

    handleMouseUp(){
        this.props.onMouseUp();
    }

    handleMouseLeave(){
        this.props.onMouseLeave();
    } */



    render() {

        // front/back css styles change on every render
        const cardBack = {
            ...styles.card,

            zIndex: '2',

            width: `${this.state.pix}vh`,
            height: `${this.state.pix * 1.05 }vh`,
            transform: `rotateX(${this.props.faceUp ? 180 : 0}deg)`,
            backgroundColor : "#1e1e1e",
        };
        const cardFront = {
            ...styles.card,

            zIndex: '1',

            width: `${this.state.pix}vh`,
            height: `${this.state.pix * 1.05 }vh`,
            transform: `rotateX(${this.props.faceUp ? 0 : -180}deg)`,

            backgroundColor : this.props.matched ? "#5ef997" : "#e5eae8",
        };

        return(
            <div className = {this.state.offset} style={styles.container}>
                <div
                    className = "cardFront"
                    style={cardFront}
                    onClick={this.handleClick}
                    /* onTouchStart = {this.handlePressStart}
                    onTouchEnd = {this.handlePressEnd}
                    onMouseDown = {this.handleMouseDown}
                    onMouseUp = {this.handleMouseUp}
                    onMouseLeave = {this.handleMouseLeave} */
                >
                    <img src = {this.props.cardID}/>
                </div>

                <div
                    className = "cardBack"
                    style={cardBack}
                    onClick={this.handleClick}
                    /* onTouchStart = {this.handlePressStart}
                    onTouchEnd = {this.handlePressEnd}
                    onMouseDown = {this.handleMouseDown}
                    onMouseUp = {this.handleMouseUp}
                    onMouseLeave = {this.handleMouseLeave} */
                >
                    {}
                </div>
            </div>
        )
    }
}

export default Card;