import React from 'react';

import clickSoundFile from "../sounds/card_flip4.wav";
import matchSoundFile from "../sounds/match3.wav";
import "./Card.css";

class Card extends React.PureComponent {

    static Phase = {
        INITIAL: 0,
        ENTER: 1,
        PLAY: 2,
        MATCHED: 3,
        EXIT: 4,
    };

    constructor(props) {
        super(props);

        this.clickSound = new Audio(clickSoundFile);
        this.matchSound = new Audio(matchSoundFile);
        this.matchSound.volume = 0.65;
        this.clickSound.volume = 0.65;

        this.phase = Card.Phase.INITIAL;

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
        this.handleTouch = this.handleTouch.bind(this);
        this.tick = this.tick.bind(this);
    }

    // Use this override to debug the Card if it is updating when it shouldn't.
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
        if (this.phase === Card.Phase.INITIAL) {
            this.setPhase(Card.Phase.ENTER);
        }
    }

    componentDidMount() {
        this.loopID = this.props.loop.subscribe(this.tick);
    }
    componentWillUnmount() {
        this.props.loop.unsubscribe(this.loopID);
    }

    handleClick() {
        //this.props.onClick(this.props.cardKey);
    }

    handleTouch(e) {
        if (this.props.matched) {
            return;
        }
        let numTouches = e.targetTouches.length;
        if (this.props.faceUp && numTouches === 0) {
            this.props.onClick(this.props.cardKey);
        }
        else if (!this.props.faceUp && numTouches > 0) {
            this.props.onClick(this.props.cardKey);
        }
        e.preventDefault();
        e.stopPropagation();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.matched && !this.props.matched) {
            if (!this.props.faceUp) {
                new Audio(matchSoundFile).play();
            }
            this.phase = Card.Phase.MATCHED;
        }
        if (nextProps.faceUp !== this.props.faceUp) {
            new Audio(clickSoundFile).play();
        }
    }

    setPhase(phase) {
        this.phase = phase;
        this.forceUpdate();
    }

    getStyles() {
        let pos, scale, transitionTime;
        if (this.phase === Card.Phase.INITIAL) {
            pos = {x:0, y:0};
            scale = 0.0;
        }
        else if (this.phase === Card.Phase.ENTER) {
            transitionTime = 0.5;
            pos = this.props.point;
            scale = 1.0;
        }
        else if (this.phase === Card.Phase.MATCHED) {
            transitionTime = 0.3;
            pos = this.props.point;
            scale = 1.2;
            setTimeout(() => (this.setPhase(Card.Phase.EXIT)), transitionTime * 1000);
        }
        else if (this.phase === Card.Phase.EXIT) {
            transitionTime = 0.3;
            pos = this.props.point;
            scale = 0.0;
        }

        const container = {
            transition: `transform ${transitionTime}s`,
            transitionTimingFunction: "cubic-bezier(.15,.94,.43,1.08)",
            transform: `translate(${pos.x}vh, ${pos.y}vh) scale(${scale}`,
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
                    onTouchStart={this.handleTouch}
                    onTouchEnd={this.handleTouch}
                    onTouchCancel={this.handleTouch}
                    onTouchMove={this.handleTouch}
                >
                    <h3 style = {{fontFamily: "Coda", fontWeight: "200", userSelect: "none"}}>{this.props.cardID}</h3>
                </div>
                <div
                    className={"card"}
                    style={styles.cardBack}
                    onClick={this.handleClick}
                    onTouchStart={this.handleTouch}
                    onTouchEnd={this.handleTouch}
                    onTouchCancel={this.handleTouch}
                    onTouchMove={this.handleTouch}
                >
                    {}
                </div>
            </div>
        )
    }
}

export default Card;