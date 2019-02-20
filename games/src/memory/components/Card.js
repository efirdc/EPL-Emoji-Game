import React from 'react';
import PropTypes from 'prop-types';

import clickSoundFile from "../sounds/card_flip4.wav";
import matchSoundFile from "../sounds/match3.wav";
import "./Card.css";

class Card extends React.PureComponent {

    // Needed to use the loop context
    static contextTypes = {
        loop: PropTypes.object,
    };

    constructor(props) {
        super(props);

        this.clickSound = new Audio(clickSoundFile);
        this.matchSound = new Audio(matchSoundFile);
        this.matchSound.volume = 0.65;
        this.clickSound.volume = 0.65;

        this.enter = false;

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
        this.tick = this.tick.bind(this);
    }

    // Use this override to debug the Card if it is updating when it shouldnt.
    /*
    shouldComponentUpdate(nextProps, nextState) {
        for (let propName in this.props) {
            if (this.props[propName] !== nextProps[propName]) {
                console.log("Card update because of", propName, "change.");
                return true;
            }
        }
        return false;
    }*/

    tick (deltaTime) {
        if (!this.enter) {
            this.enter = true;
            this.forceUpdate();
        }
    }

    componentDidMount() {
        this.loopID = this.context.loop.subscribe(this.tick);
    }
    componentWillUnmount() {
        this.context.loop.unsubscribe(this.loopID);
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
        const p = this.enter ? this.props.point : {x:0, y:0};
        const container = {
            transition: "transform 0.5s",
            transitionTimingFunction: "cubic-bezier(.15,.94,.43,1.08)",
            transform: `translate(${p.x}vh, ${p.y}vh) scale(${this.enter ? 1.0 : 0.0})`,
        };
        const cardCommon = {
            // Position
            height: this.props.size + "vh",
            width: this.props.size + "vh",

            // Styling
            fontSize: this.props.size * 0.5 + "vh",

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

        return {cardFront, cardBack, container};
    }

    render() {
        const styles = this.getStyles();
        return(
            <div
                className={"container"}
                style={styles.container}
            >
                <div
                    className={"card"}
                    style={styles.cardFront}
                    onClick={this.handleClick}
                >
                    <h3 style = {{fontFamily: "Coda", fontWeight: "200", userSelect: "none"}}>{this.props.cardID}</h3>
                </div>
                <div
                    className={"card"}
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