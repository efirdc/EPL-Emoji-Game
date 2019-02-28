import React from 'react';
import emoji from 'node-emoji';
import Twemoji from 'react-twemoji';
import emojiData from './EmojiData.js';
import clickSoundFile from "../sounds/card_flip4.wav";
import matchSoundFile from "../sounds/match3.wav";
import "./Card.css";
import * as colorConvert from "color-convert";

export default class Card extends React.PureComponent {

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
        this.inputHandlerRef = React.createRef();
        this.fingersOnCard = 0;

        // This binding is necessary to make `this` work in the callback
        this.tick = this.tick.bind(this);
        this.handlePointer = this.handlePointer.bind(this);
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
        this.inputHandlerRef.current.addEventListener("pointermove", this.handlePointer);
        this.inputHandlerRef.current.addEventListener("pointerdown", this.handlePointer);
        this.inputHandlerRef.current.addEventListener("gotpointercapture", this.handlePointer);
        this.inputHandlerRef.current.addEventListener("lostpointercapture", this.handlePointer);
    }

    componentWillUnmount() {
        this.props.loop.unsubscribe(this.loopID);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.matched && !this.props.matched) {
            if (!this.props.faceUp) {
                new Audio(matchSoundFile).play();
            }
            this.phase = Card.Phase.MATCHED;
        }
        if (nextProps.faceUp && !this.props.faceUp) {
            new Audio(clickSoundFile).play();
        }
    }

    setPhase(phase) {
        this.phase = phase;
        this.forceUpdate();
    }

    handlePointer(event) {
        console.log(event.pointerId);
        if (event.type === "pointermove" || event.type === "pointerdown") {
            if (event.buttons) {
                //event.target.setPointerCapture(event.pointerId);
            }

            if (event.target.hasPointerCapture(event.pointerId)) {
                let elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY);
                if (!elementsAtPoint.includes(event.target)) {
                    //event.target.releasePointerCapture(event.pointerId);
                }
            }
        }

        else if (event.type === "gotpointercapture") {
            console.log("capture");
            if (this.fingersOnCard === 0) {
                this.props.onCardTouchStart(this.props.cardKey);
            }
            this.fingersOnCard += 1;
        }

        else if (event.type === "lostpointercapture") {
            console.log("release");
            this.fingersOnCard -= 1;
            if (this.fingersOnCard === 0) {
                this.props.onCardTouchEnd(this.props.cardKey);
            }
        }
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

        // blobID decides card back color
        const eplColors = [
            "#ffb748",
            "#79bd52",
            "#e80862",
            "#7c4694",
            "#009dd8",
        ];
        let color = eplColors[this.props.blobID % eplColors.length];

        // Reduce saturation to 75% if the card is
        if (this.props.flipRejected) {
            let colorHsv = colorConvert.hex.hsv(color.substring(1));
            colorHsv[2] *= 0.75;
            color = "#" + colorConvert.hsv.hex(colorHsv);
        }

        const cardBack = {
            ...cardCommon,

            zIndex: '2',

            transform: `rotateX(${this.props.faceUp ? 180 : 0}deg)`,
            backgroundColor : color,
        };
        const cardFront = {
            ...cardCommon,

            zIndex: '1',

            transform: `rotateX(${this.props.faceUp ? 0 : -180}deg)`,
            backgroundColor : this.props.matched ? "#5ef997" : "#e5eae8",
        };

        return {cardCommon, cardFront, cardBack, container};
    }

    render() {
        const styles = this.getStyles();
        return(
            <div
                className={"container"}
                style={styles.container}
            >
                <div
                    className={"cardInputHandler"}
                    style={styles.cardCommon}
                    id={this.props.cardKey}
                    ref={this.inputHandlerRef}
                >
                    <div className={"card"} style={styles.cardFront}>
                        <span role="img" >{emojiData.sequence[this.props.matchID % emojiData.sequence.length]}</span>
                    </div>
                    <div className={"card"} style={styles.cardBack}>
                        {}
                    </div>
                </div>
            </div>
        )
    }
}