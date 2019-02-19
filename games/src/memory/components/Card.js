import React from 'react';
import clickSoundFile from "../sounds/card_flip4.wav";
import matchSoundFile from "../sounds/match3.wav";

class Card extends React.PureComponent {
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
        this.props.onClick(this.props.cardKey);
    }

    getStyles() {
        const container = {

            // Card is positioned by its yPos and xPos props
            position: "absolute",
            left: this.props.point.x + "vh",
            top: this.props.point.y + "vh",

            // Card position is relative to its center
            height: "0",
            width: "0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",

            // Makes the card 3d flip stuff look right
            transformStyle: 'preserve-3d',
            perspective: "1000px",

            // Styling
            filter: "drop-shadow(0 0 0.2vh #000000)",
        };

        const cardCommon = {
            //
            height: this.props.size + "vh",
            width: this.props.size + "vh",

            // Center content
            display: "flex",
            justifyContent: "center",
            alignItems: "center",

            // Styling
            fontSize: this.props.size * 0.5 + "vh",

            // Flip
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
            transition: "transform 0.3s",
            position: "absolute",

            // Hexagon
            clipPath: "polygon(50% 0%, 93.30125% 25%, 93.30125% 75%, 50% 100%, 6.69875% 75%, 6.69875% 25%)", // pointy top
            //clipPath: "polygon(0% 50%, 25% 6.69875%, 75% 6.69875%, 100% 50%, 75% 93.30125%, 25% 93.30125%)" // flat top
        };

        const eplColors = [
            "#ffb748",
            "#79bd52",
            "#e80862",
            "#7c4694",
            "#009dd8",
        ];
        const cardBack = {
            ...cardCommon,

            zIndex: '2',

            transform: `rotateX(${this.props.faceUp ? 180 : 0}deg)`,
            backgroundColor : eplColors[this.props.blobID % eplColors.length],
            //backgroundColor : "#1e1e1e",
        };
        const cardFront = {
            ...cardCommon,

            zIndex: '1',

            transform: `rotateX(${this.props.faceUp ? 0 : -180}deg)`,
            backgroundColor : this.props.matched ? "#5ef997" : "#e5eae8",
        };

        return {container, cardFront, cardBack};
    }

    render() {
        const styles = this.getStyles();
        return(
            <div style={styles.container}>
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