import React from 'react';
import Twemoji from 'react-twemoji';
import "./Card.css";
import {Motion, spring, presets} from 'react-motion';
import * as colorConvert from "../utils/color-convert";
import "../fonts/Segoe UI.ttf";

export default class Card extends React.Component {

    constructor(props) {
        super(props);

        this.card = this.props.card;

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

    convertColors(hex, lightness){

    }

    shouldComponentUpdate(nextProps, nextState) {
        for (let propName in this.props) {
            if (this.props[propName] !== nextProps[propName]) {
                //console.log("Card update because of", propName, "change.");
                return true;
            }
        }

        if (this.card.matched && !this.card.exiting && this.card.timeSinceTransition < 4000) {
            return true;
        }

        if (this.card.isAfraid || this.card.isShocked) {
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
            this.props.onCardTouchStart(this.card.cardKey);
        }
        this.fingersOnCard += 1;
    }

    // this must be called every time a finger exits a card
    touchEndBehavior() {
        this.fingersOnCard -= 1;
        // if the card is no longer touched by any finger, tell the Game
        if (this.fingersOnCard === 0) {
            this.props.onCardTouchEnd(this.card.cardKey);
        }
    }

    // initial values for the spring animation system.
    getInitialValues() {
        return {
            x: this.card.x,
            y: this.card.y,
            flipRotation: 0,
            rotation: 0,
            scale: 0,
            comboIndicatorScale: 0,
        };
    }

    // Get target values for the spring animation system
    // the values are "driven towards" these target values using spring forces
    getTargetValues() {
        let values = {};
        values.x = this.card.x;
        values.y = this.card.y;
        values.comboIndicatorScale = 0.0;

        values.flipRotation = this.card.faceUp ? 180 : 0;
        values.scale = this.card.faceUp ? 0.9 : 0.8;

        values.rotation = 0.0;

        let normalAfraidCard = this.card.isAfraid && !this.card.comboBreaker;
        if (normalAfraidCard && this.card.timeSinceTransition % 5000 < 3000) {
            let shiverAngle = 2 * Math.PI * Math.random();
            let shiverRadius = 0.5;
            values.x += shiverRadius * Math.cos(shiverAngle);
            values.y += shiverRadius * Math.sin(shiverAngle);
        }

        // The afraid card that triggers a combo breaker should shrink and shake erratically.
        let comboBreakerAfraidCard = this.card.isAfraid && this.card.comboBreaker;
        if (comboBreakerAfraidCard) {
            let shiverAngle = 2 * Math.PI * Math.random();
            let shiverRadius = 1.0;
            values.x += shiverRadius * Math.cos(shiverAngle);
            values.y += shiverRadius * Math.sin(shiverAngle);
            values.scale = 0.7;
        }

        // Shocked cards shake violently for a short time
        if (this.card.isShocked && this.card.timeSinceTransition < 600) {
            let shiverAngle = 2 * Math.PI * Math.random();
            let shiverRadius = 2.0;
            values.x += shiverRadius * Math.cos(shiverAngle);
            values.y += shiverRadius * Math.sin(shiverAngle);
            values.scale = 0.8;
        }

        // Matched cards should pop out
        if (this.card.matched) {
            if (this.card.timeSinceTransition < 400) {
                values.scale = 1.1;
            }
            else {
                values.scale = 0.95;
            }
        }

        // Show the combo indicator
        if (this.card.showComboIndicator) {
            let lingerTime = this.card.specialMatch ? 3500 : 1500;
            if (this.card.timeSinceTransition < lingerTime) {
                values.comboIndicatorScale = this.card.specialMatch ? 1.3 : 1.0;
            }
        }

        // Special matched cards have special wobble rotate animation
        if (this.card.specialMatch) {
            if (this.card.timeSinceTransition < 100) {
                values.rotation = -20;
            } else if (this.card.timeSinceTransition < 200) {
                values.rotation = 20;
            }
        }

        // The wizard should also wobble when he is matched
        if (this.card.matched && this.card.specialCard) {
            if (this.card.timeSinceTransition < 100) {
                values.rotation = -10;
            } else if (this.card.timeSinceTransition < 200) {
                values.rotation = 10;
            }
        }

        // exiting cards disappear
        if (this.card.exiting) {
            values.flipRotation = 0;
            values.scale = 0.0;
        }

        let positionSpring = {stiffness: 300, damping: 20};
        values.x = spring(values.x, positionSpring);
        values.y = spring(values.y, positionSpring);
        values.flipRotation = spring(values.flipRotation, {stiffness: 90, damping: 11});
        values.scale = spring(values.scale, {stiffness: 120, damping: 7});
        values.comboIndicatorScale = spring(values.comboIndicatorScale, {stiffness: 150, damping: 15});
        values.rotation = spring(values.rotation, {stiffness: 120, damping: 5});

        return values;
    }

    // gets the inline css styles for this component using animated values.
    getStyles(values) {

        const cardMain = {
            zIndex: 1 + this.card.comboCounter,
            position: 'fixed',
            height: this.props.size + "vh",
            width: this.props.size + "vh",
            transform: `
                translate(${values.x - 0.5 * this.props.size}vh, ${values.y - 0.5 * this.props.size}vh) 
                scale(${Math.max(values.scale, 0.0)}) 
                rotate(${values.rotation}deg)
            `,
        };

        let colorId = this.card.blobID % this.eplColors.length;

        let cardBackBorderColor;
        if (this.card.isBurned) {
            cardBackBorderColor = "#120f12";
        }
        else {
            cardBackBorderColor = this.eplColorsBorder[colorId];
        }

        let cardBackInnerColor;
        if (this.card.flipRejected) {
            cardBackInnerColor = this.eplColorsFlipRejected[colorId];
        }
        else if (this.card.isBurned) {
            cardBackInnerColor = "#282528"
        }
        else {
            cardBackInnerColor = this.eplColors[colorId];
        }

        const cardBack = {
            zIndex: '2',

            transform: `rotateX(${values.flipRotation}deg)`,
            backgroundColor: cardBackBorderColor,
        };

        const cardBackInner = {
            zIndex: '3',

            transform: "scale(0.88)",
            backgroundColor: cardBackInnerColor,
        };

        const cardFront = {
            zIndex: this.card.faceUp ? '3' : "1",

            transform: `rotateX(${values.flipRotation - 180}deg)`,
            backgroundColor : "#000000"
        };

        let frontColor;
        if (this.card.specialMatch) {
            frontColor = "#f296ff";
        }
        else if (this.card.comboBreaker) {
            frontColor = "#ff3726";
        }
        else if (this.card.matched && this.card.specialCard) {
            frontColor = "#7bd6ff";
        }
        else if (this.card.matched) {
            frontColor = "#5ef997";
        }
        else if (this.card.emoji === '⚡') {
            frontColor = "#f9ed6a";
        }
        else {
            frontColor = "#e5eae8";
        }

        const cardFrontInner = {
            transform: `scale(0.88)`,
            backgroundColor : frontColor,
        };

        const horizontalLineWidth = 30;
        let emojiRotationVector = {x:0, y:0};
        if (Math.abs(this.card.x) < horizontalLineWidth) {
            emojiRotationVector = {x:0, y:this.card.y};
        }
        else if ( this.card.x > horizontalLineWidth) {
            emojiRotationVector = {x: this.card.x - horizontalLineWidth, y: this.card.y};
        }
        else {
            emojiRotationVector = {x: this.card.x + horizontalLineWidth, y: this.card.y};
        }

        let emojiAngleRad = Math.atan2(emojiRotationVector.y, emojiRotationVector.x);
        let emojiAngle = emojiAngleRad * 180 / Math.PI - 90;
        const emoji = {
            zIndex: '4',
            isolation: 'isolate',
            transform: `translate(${0}vh, ${0}vh) rotate(${emojiAngle}deg)`,
            fontFamily: "'Segoe UI'",
            fontSize: this.props.size * 0.5 + "vh",
            lineHeight: this.props.size + "vh",
        };

        const twemoji = {
            zIndex: '4',
            position: 'absolute',
            isolation: 'isolate',
            height: this.props.size + "vh",
            width: this.props.size + "vh",
            transformOrigin: 'center center',
            transform: `
                rotate(${emojiAngle}deg) 
                scale(0.5)
            `,
        };

        let comboIndicatorRadius = 3.5;
        let comboIndicatorSize = 0.30 * this.props.size;
        let comboIndicatorAngle = emojiAngle - 35;
        let comboIndicatorTiltAngle = 10;

        const comboIndicatorContainer = {
            zIndex: '5',
            position: 'absolute',
            isolation: 'isolate',
            top: "50%",
            left: "50%",
            width: '0vh',
            height: '0vh',
            transform: `rotate(${comboIndicatorAngle}deg) translate(0vh, -${comboIndicatorRadius}vh)`
        };

        const comboIndicator = {
            zIndex: '5',
            position: 'absolute',
            isolation: 'isolate',
            transform: `translate(-50%, -50%) rotate(${comboIndicatorTiltAngle}deg) scale(${values.comboIndicatorScale})`,
            fontFamily: "'Arial Black', Gadget, sans-serif",
            fontSize: comboIndicatorSize + "vh",
            color: this.card.specialMatch ? "#ff00bb" : '#e92200',
            WebkitTextStrokeWidth: 0.2 + 'vh',
            WebkitTextStrokeColor: "black",
            lineHeight: comboIndicatorSize + "vh",
        };

        return {cardFront, cardBack, cardMain, cardFrontInner, cardBackInner, emoji, twemoji, comboIndicator, comboIndicatorContainer};
    }

    render() {

        let initialValues = this.getInitialValues();
        let targetValues = this.getTargetValues();

        let useTwemoji = false;

        return(
            <Motion defaultStyle={initialValues} style={targetValues}>
                {interpolatedValues => {
                    let styles = this.getStyles(interpolatedValues);
                    let showCombo = this.card.comboCounter;
                    let combo = showCombo ? this.card.comboCounter + 'x' : '';
                    return (
                        <div style={styles.cardMain} >
                            <div className={"cardInputHandler"} id={this.props.cardKey} ref={this.inputHandlerRef}/>
                            <div style={styles.comboIndicatorContainer}>
                                <div style={styles.comboIndicator}>{combo}</div>
                            </div>

                            <div className={"card"} style={styles.cardFront}>
                                <div className={"card"} style={styles.cardFrontInner}>
                                    {useTwemoji ? (
                                        <Twemoji options={{ className: 'twemoji', noWrapper: true}}>
                                            <div style={styles.twemoji}>
                                                {this.card.emoji.substring(0, 2)}
                                            </div>
                                        </Twemoji>
                                    ) : (
                                        <div style={styles.emoji}>
                                            {this.card.emoji}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={"card"} style={styles.cardBack}>
                                <div className={"card"} style={styles.cardBackInner}>
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