import React from 'react';
import { CardPhase } from "../controllers/GameLogic.js";
import emojiData from './EmojiData.js';
import "./Card.css";
import {Motion, spring, presets} from 'react-motion';

export default class Card extends React.PureComponent {

    constructor(props) {
        super(props);

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

    // Set up event listeners, and loop stuff
    componentDidMount() {
        this.inputHandlerRef.current.addEventListener("pointermove", this.handlePointer);
        this.inputHandlerRef.current.addEventListener("pointerdown", this.handlePointer);
        this.inputHandlerRef.current.addEventListener("lostpointercapture", this.handlePointer);
        this.inputHandlerRef.current.addEventListener("pointerup", this.handlePointer);
        this.inputHandlerRef.current.addEventListener("pointerout", this.handlePointer);

        this.inputHandlerRef.current.addEventListener("fakecapture", this.touchStartBehavior);
        this.inputHandlerRef.current.addEventListener("fakerelease", this.touchEndBehavior);
    }

    handlePointer(event) {

        // A pointer event can be captured only if it is in the "active buttons state"
        // https://www.w3.org/TR/pointerevents/#dfn-active-buttons-state
        let canCapture = event.type === "pointerdown" || (event.type === "pointermove" && event.buttons);
        let isCaptured = this.capturedPointers.includes(event.pointerId);

        // If the pointer can be captured and is not captured yet,
        // then capture it trigger the touch start behavior
        if (canCapture && !isCaptured) {
            event.target.setPointerCapture(event.pointerId);
            this.capturedPointers.push(event.pointerId);
            this.touchStartBehavior();
        }

        // If there is a captured pointer that is no longer on the card
        // then release it so it can start firing events at other cards
        // note: the touch end behavior is not triggered here yet because pointer capture can be released for other reasons
        else if (this.capturedPointers.includes(event.pointerId)) {
            let elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY);
            if (!elementsAtPoint.includes(event.target)) {
                event.target.releasePointerCapture(event.pointerId);
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

    // initial values for the spring animation system.
    getInitialValues() {
        return {
            x: this.props.x,
            y: this.props.y,
            flipRotation: 0,
            scale: 0,
        };
    }

    // Get target values for the spring animation system
    // the values are "driven towards" these target values using spring forces
    getTargetValues() {
        let values = {};
        values.x = this.props.x;
        values.y = this.props.y;

        const neutralScale = 0.8;
        switch (this.props._phase) {

            case CardPhase.SPAWNING:
                values.flipRotation = 0;
                values.scale = neutralScale;
                break;

            case CardPhase.FACE_DOWN:
            case CardPhase.FLIP_REJECTED:
                values.flipRotation = 0;
                values.scale = neutralScale;
                break;

            case CardPhase.FACE_UP:
                values.flipRotation = 180;
                values.scale = 0.9;
                break;

            case CardPhase.MATCHED:
                values.flipRotation = 180;
                values.scale = 1.1;
                break;

            case CardPhase.EXITING:
                values.flipRotation = 180;
                values.scale = 0.0;
                break;
        }

        values.x = spring(values.x, presets.stiff);
        values.y = spring(values.y, presets.stiff);
        values.flipRotation = spring(values.flipRotation, {stiffness: 90, damping: 11});
        values.scale = spring(values.scale, {stiffness: 120, damping: 7});

        return values;
    }

    // gets the inline css styles for this component using animated values.
    getStyles(values) {

        const cardInputHandler = {
            height: this.props.size + "vh",
            width: this.props.size + "vh",
            transform: `translate(${values.x - 0.5 * this.props.size}vh, ${values.y - 0.5 * this.props.size}vh) scale(${Math.max(values.scale, 0.0)})`,
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

        const cardBack = {
            zIndex: '2',

            transform: `rotateX(${values.flipRotation}deg)`,
            backgroundColor: color,
            filter: (this.props._phase === CardPhase.FLIP_REJECTED) ? "brightness(75%)" : "brightness(100%)",
        };

        const cardFront = {
            zIndex: this.props.faceUp ? '3' : "1",

            transform: `rotateX(${values.flipRotation - 180}deg)`,
            backgroundColor : "#000000"
        };

        let useMatchColor = this.props._phase === CardPhase.MATCHED || this.props._phase === CardPhase.EXITING;
        const cardInner = {
            transform: "scale(0.92)",
            backgroundColor : useMatchColor ? "#5ef997" : "#e5eae8",
            fontSize: this.props.size * 0.5 + "vh",
            lineHeight: this.props.size + "vh",
        };

        return {cardFront, cardBack, cardInputHandler, cardInner};
    }

    render() {

        let initialValues = this.getInitialValues();
        let targetValues = this.getTargetValues();

        return(
            <Motion defaultStyle={initialValues} style={targetValues}>
                {interpolatedValues => {
                    let styles = this.getStyles(interpolatedValues);
                    return (
                    <div
                        className={"cardInputHandler"}
                        style={styles.cardInputHandler}
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
                    )
                }}
            </Motion>
        )
    }
}