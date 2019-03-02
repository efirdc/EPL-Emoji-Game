import React from 'react';
import emoji from 'node-emoji';
import Twemoji from 'react-twemoji';
import emojiData from './EmojiData.js';
import clickSoundFile from "../sounds/card_flip4.wav";
import matchSoundFile from "../sounds/match3.wav";
import "./Card.css";
import * as colorConvert from "color-convert";
import {Motion, spring, presets} from 'react-motion';

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

        // phase takes on values of the Phase enum, and controls what the Card is doing at the moment
        this.phase = Card.Phase.INITIAL;

        // Reference to the input handler is needed to add listeners to real events since react events can not be trusted.
        this.inputHandlerRef = React.createRef();

        // This property must count the number of fingers that are currently on the card.
        this.fingersOnCard = 0;

        // Keeps track of the pointer ids that are currently captured by the card.
        // We have to track these manually so that we can check if a pointer is captured by our card or not
        // You might think we could use elem.hasPointerCapture, but the browser prefers to take its time when
        // it captures pointers sometimes (almost a full second).
        this.capturedPointers = [];

        // Binding "this" is necessary for callback functions (otherwise "this" is undefined in the callback).
        this.tick = this.tick.bind(this);
        this.handlePointer = this.handlePointer.bind(this);
        this.touchStartBehavior = this.touchStartBehavior.bind(this);
        this.touchEndBehavior = this.touchEndBehavior.bind(this);
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

    // tick runs every frame
    // not using this too much at the moment...
    tick (deltaTime) {
        if (this.phase === Card.Phase.INITIAL) {
            this.setPhase(Card.Phase.ENTER);
        }
    }

    // Set up event listeners, and loop stuff
    componentDidMount() {
        this.loopID = this.props.loop.subscribe(this.tick);
        this.inputHandlerRef.current.addEventListener("pointermove", this.handlePointer);
        this.inputHandlerRef.current.addEventListener("pointerdown", this.handlePointer);
        this.inputHandlerRef.current.addEventListener("lostpointercapture", this.handlePointer);
        this.inputHandlerRef.current.addEventListener("fakecapture", this.touchStartBehavior);
        this.inputHandlerRef.current.addEventListener("fakerelease", this.touchEndBehavior);
    }
    componentWillUnmount() {
        this.props.loop.unsubscribe(this.loopID);
    }

    // Detect changes in props
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

    handlePointer(event) {

        // Handle pointer down and move events
        if (event.type === "pointerdown" || event.type === "pointermove") {

            // If there is an active pointer on the card that hasn't been captured yet
            // then capture it and trigger the touch start behavior
            if (event.buttons && !this.capturedPointers.includes(event.pointerId)) {
                event.target.setPointerCapture(event.pointerId);
                this.capturedPointers.push(event.pointerId);
                this.touchStartBehavior();
            }

            // If there is a captured pointer that is no longer on the card
            // then release it so it can start firing events at other cards
            // note: the touch end behavior is not triggered here yet because pointer capture can be released for other reasons
            if (event.target.hasPointerCapture(event.pointerId)) {
                let elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY);
                if (!elementsAtPoint.includes(event.target)) {
                    event.target.releasePointerCapture(event.pointerId);
                }
            }
        }

        // trigger the touch end behavior on the lostpointercapture event
        if (event.type === "lostpointercapture") {
            this.capturedPointers = this.capturedPointers.filter((id) => (id !== event.pointerId));
            this.touchEndBehavior();
        }
    }

    // This must be called every time a finger enters the card
    touchStartBehavior() {
        // if the card has no fingers on it yet, tell the Game that its being touched now
        if (this.fingersOnCard === 0) {
            this.props.onCardTouchStart(this.props.cardKey);
        }
        this.fingersOnCard += 1;
    }

    // this must be called every time a finger exits a card
    touchEndBehavior() {
        this.fingersOnCard -= 1;
        // if the card is no longer touched by any finger, tell the Game
        if (this.fingersOnCard === 0) {
            this.props.onCardTouchEnd(this.props.cardKey);
        }
    }

    getInitialValues() {
        return {
            x: 0,
            y: 0,
            flipRotation: 0,
            scale: 0,
        };
    }

    getTargetValues() {
        let values = {};
        values.x = this.props.point.x;
        values.y = this.props.point.y;

        if (this.props.faceUp) {
            values.flipRotation = 180;
            values.scale = 1.0;
        } else {
            values.flipRotation = 0;
            values.scale = 0.9;
        }

        if (this.phase === Card.Phase.MATCHED) {
            values.scale = 1.1;
        }
        else if (this.phase === Card.Phase.EXIT) {
            values.scale = 0.0;
        }
        values.x = spring(values.x, presets.gentle);
        values.y = spring(values.y, presets.gentle);
        values.flipRotation = spring(values.flipRotation, presets.wobbly);
        values.scale = spring(values.scale, presets.wobbly);

        return values;
    }

    handlePhaseTransitions() {
        if (this.phase === Card.Phase.MATCHED) {
            setTimeout(() => (this.setPhase(Card.Phase.EXIT)), 1000);
        }
    }

    setPhase(phase) {
        this.phase = phase;
        this.forceUpdate();
    }

    getStyles(values) {

        const container = {
            transform: `translate(${values.x}vh, ${values.y}vh) scale(${values.scale})`,
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

            transform: `rotateX(${values.flipRotation}deg)`,
            backgroundColor : color,
        };

        const cardFront = {
            ...cardCommon,

            zIndex: this.props.matched || this.props.faceUp ? '3' : "1",

            transform: `rotateX(${values.flipRotation - 180}deg)`,
            backgroundColor : "#000000"
        };

        const cardInner = {
            ...cardCommon,
            transform: "scale(0.92)",
            backgroundColor : this.props.matched ? "#5ef997" : "#e5eae8",
        };

        return {cardCommon, cardFront, cardBack, container, cardInner};
    }

    render() {
        this.handlePhaseTransitions();

        let initialValues = this.getInitialValues();
        let targetValues = this.getTargetValues();

        return(
            <Motion defaultStyle={initialValues} style={targetValues}>
                {interpolatedValues => {
                    let styles = this.getStyles(interpolatedValues);
                    return (
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
                                <div className={"card"} style={styles.cardInner}>
                                    <span role="img">{emojiData.sequence[this.props.matchID % emojiData.sequence.length]}</span>
                                </div>
                            </div>
                            <div className={"card"} style={styles.cardBack}>
                                {}
                            </div>
                        </div>
                    </div>
                    )
                }}
            </Motion>
        )
    }
}