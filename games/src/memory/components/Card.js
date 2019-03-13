import React from 'react';
import { CardPhase } from "../controllers/GameLogic.js";
import emojiData from '../controllers/EmojiData.js';
import "./Card.css";
import {Motion, spring, presets} from 'react-motion';
import * as colorConvert from "color-convert";

export default class Card extends React.Component {

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

        this.eplColorsDefault = [
            "#ffb748",
            "#79bd52",
            "#e80862",
            "#7c4694",
            "#009dd8",
        ];

        this.eplColors = [
            "#ffa424", // +15 saturation
            "#6ebd40", // +10 saturation
            "#e80862",
            "#773894", // +10 saturation
            "#009dd8",
        ];
        let borderLightness = 0.35;
        let flipRejectedLightness = 0.75;
        let hsvColors = this.eplColors.map((color) => colorConvert.hex.hsv(color.substring(1)));

        let convertLightness = (hsvColor, lightness) => {
            return "#" + colorConvert.hsv.hex([hsvColor[0], hsvColor[1] , hsvColor[2] * lightness]);
        };
        this.eplColorsBorder = hsvColors.map((hsvColor) => convertLightness(hsvColor, borderLightness));
        this.eplColorsFlipRejected = hsvColors.map((hsvColor) => convertLightness(hsvColor, flipRejectedLightness));

        // Binding "this" is necessary for callback functions (otherwise "this" is undefined in the callback).
        this.handlePointer = this.handlePointer.bind(this);
        this.touchStartBehavior = this.touchStartBehavior.bind(this);
        this.touchEndBehavior = this.touchEndBehavior.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        for (let propName in this.props) {
            if (this.props[propName] !== nextProps[propName]) {
                //console.log("Card update because of", propName, "change.");
                return true;
            }
        }

        if (nextProps.phase === CardPhase.COMBO || nextProps.phase === CardPhase.MATCHED) {
            return true;
        }

        return false;
    }

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
            comboIndicatorScale: 0,
        };
    }

    // Get target values for the spring animation system
    // the values are "driven towards" these target values using spring forces
    getTargetValues() {
        let values = {};
        values.x = this.props.x;
        values.y = this.props.y;
        values.comboIndicatorScale = 0.0;

        const neutralScale = 0.8;
        switch (this.props.phase) {

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
            case CardPhase.COMBO:
                values.flipRotation = 180;
                if (Date.now() - this.props.timeAtSetPhase < 400) {
                    values.scale = 1.2;
                }
                else {
                    values.scale = 0.95;
                }

                if (Date.now() - this.props.timeAtSetPhase < 1500) {
                    values.comboIndicatorScale = 1.0;
                }

                break;

            case CardPhase.MATCHED_EXITING:
            case CardPhase.COMBO_EXITING:
                values.flipRotation = 180;
                values.scale = 0.0;
                break;

            case CardPhase.EXITING:
                values.flipRotation = 0;
                values.scale = 0.0;
                break;
        }

        values.x = spring(values.x, presets.stiff);
        values.y = spring(values.y, presets.stiff);
        values.flipRotation = spring(values.flipRotation, {stiffness: 90, damping: 11});
        values.scale = spring(values.scale, {stiffness: 120, damping: 7});
        values.comboIndicatorScale = spring(values.comboIndicatorScale, {stiffness: 150, damping: 15});

        return values;
    }

    // gets the inline css styles for this component using animated values.
    getStyles(values) {


        const cardMain = {
            zIndex: '1',
            position: 'fixed',
            height: this.props.size + "vh",
            width: this.props.size + "vh",
            transform: `translate(${values.x - 0.5 * this.props.size}vh, ${values.y - 0.5 * this.props.size}vh) scale(${Math.max(values.scale, 0.0)})`,
        };

        // blobID decides card back color
        let colorId = this.props.blobID % this.eplColors.length;
        let color = this.eplColors[colorId];
        let borderColor = this.eplColorsBorder[colorId];
        let flipRejectedColor = this.eplColorsFlipRejected[colorId];

        const cardBack = {
            zIndex: '2',

            transform: `rotateX(${values.flipRotation}deg)`,
            backgroundColor: borderColor,
        };

        const cardBackInner = {
            zIndex: '3',

            transform: "scale(0.88)",
            backgroundColor: (this.props.phase === CardPhase.FLIP_REJECTED) ? flipRejectedColor : color,
        };

        const cardFront = {
            zIndex: this.props.faceUp ? '3' : "1",

            transform: `rotateX(${values.flipRotation - 180}deg)`,
            backgroundColor : "#000000"
        };

        let frontColor;
        switch (this.props.phase) {
            case CardPhase.MATCHED:
            case CardPhase.MATCHED_EXITING:
            case CardPhase.COMBO:
            case CardPhase.COMBO_EXITING:
                frontColor = "#5ef997";
                break;
            default:
                frontColor = "#e5eae8";
        }

        const cardFrontInner = {
            transform: `scale(0.88)`,
            backgroundColor : frontColor,
        };

        const horizontalLineWidth = 30;
        let emojiRotationVector = {x:0, y:0};
        if (Math.abs(this.props.x) < horizontalLineWidth) {
            emojiRotationVector = {x:0, y:this.props.y};
        }
        else if ( this.props.x > horizontalLineWidth) {
            emojiRotationVector = {x: this.props.x - horizontalLineWidth, y: this.props.y};
        }
        else {
            emojiRotationVector = {x: this.props.x + horizontalLineWidth, y: this.props.y};
        }

        let emojiAngleRad = Math.atan2(emojiRotationVector.y, emojiRotationVector.x);
        let emojiAngle = emojiAngleRad * 180 / Math.PI - 90;
        const emoji = {
            zIndex: '4',
            isolation: 'isolate',
            transform: `translate(${0}vh, ${0}vh) rotate(${emojiAngle}deg)`,
            fontSize: this.props.size * 0.5 + "vh",
            lineHeight: this.props.size + "vh",
        };

        let comboIndicatorRadius = 3.5;
        let comboIndicatorSize = 0.30 * this.props.size;
        let comboIndicatorAngle = emojiAngle - 35;
        let comboIndicatorTiltAngle = 10;

        const comboIndicatorContainer = {
            zIndex: '5',
            position: 'absolute',
            top: "50%",
            left: "50%",
            width: '0vh',
            height: '0vh',
            transform: `rotate(${comboIndicatorAngle}deg) translate(0vh, -${comboIndicatorRadius}vh)`
        };

        const comboIndicator = {
            zIndex: '5',
            position: 'absolute',
            transform: `translate(-50%, -50%) rotate(${comboIndicatorTiltAngle}deg) scale(${values.comboIndicatorScale})`,
            fontFamily: "'Arial Black', Gadget, sans-serif",
            fontSize: comboIndicatorSize + "vh",
            color: '#e92200',
            webkitTextStrokeWidth: 0.2 + 'vh',
            webkitTextStrokeColor: "black",
            lineHeight: comboIndicatorSize + "vh",
        };

        return {cardFront, cardBack, cardMain, cardFrontInner, cardBackInner, emoji, comboIndicator, comboIndicatorContainer};
    }

    render() {

        let initialValues = this.getInitialValues();
        let targetValues = this.getTargetValues();

        return(
            <Motion defaultStyle={initialValues} style={targetValues}>
                {interpolatedValues => {
                    let styles = this.getStyles(interpolatedValues);
                    let showCombo = this.props.comboCounter;
                    let combo = showCombo ? this.props.comboCounter + 'x' : '';
                    return (
                        <div style={styles.cardMain} >
                            <div className={"cardInputHandler"} id={this.props.cardKey} ref={this.inputHandlerRef}/>

                            <div className={"card"} style={styles.cardFront}>
                                <div className={"card"} style={styles.cardFrontInner}>
                                    <div style={styles.emoji}>
                                        {this.props.emoji}
                                    </div>
                                </div>
                            </div>
                            <div className={"card"} style={styles.cardBack}>
                                <div className={"card"} style={styles.cardBackInner}>
                                    {}
                                </div>
                            </div>
                            <div style={styles.comboIndicatorContainer}>
                                <div style={styles.comboIndicator}>{combo}</div>
                            </div>

                        </div>
                    )
                }}
            </Motion>
        )
    }
}