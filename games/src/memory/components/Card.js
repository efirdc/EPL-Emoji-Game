import React from 'react';
import Twemoji from 'react-twemoji';
import "./Card.css";
import {Motion, spring} from 'react-motion';
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

        // 35% lightness
        this.eplColorsBorder = [
            "#593a0d",
            "#274217",
            "#520324",
            "#190c1f",
            "#00364a",
        ];

        // 75% lightness
        this.eplColorsFlipRejected = [
            "#bf7c1d",
            "#558f31",
            "#800538",
            "#5a2b70", // +10 saturation
            "#007aa6",
        ];

        this.indicatorRadius = 3.5;

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

        if (this.card.matched && !this.card.exiting && this.card.timeSinceTransition < 4000) {
            return true;
        }

        if (this.card.isAfraid || this.card.isShocked || this.card.onFire || this.card.brokeCombo) {
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
            statusIndicatorScale: 0,
            statusIndicatorRadius: 0,
            statusIndicatorAngle: this.getEmojiAngle(),
            statusIndicatorTiltAngle: 0,
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

        // Cards that trigger a combo breaker should shrink and shake erratically.
        if (this.card.brokeCombo) {
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

        // status indicator values
        if (this.card.onFire) {
            // Use an exponential curve for the fire scale so it grows quickly
            // see https://www.desmos.com/calculator/q6ovcj7qqi
            let fireScale = 1 - Math.pow(Math.max(1 - this.card.burnPercent, 0.0), 2.5);
            values.statusIndicatorScale = fireScale;
        }
        else if (this.card.statusIndicator !== '') {
            values.statusIndicatorScale = 1.0;
        }
        else {
            values.statusIndicatorScale = 0.0;
        }

        values.statusIndicatorRadius = 0;
        values.statusIndicatorAngle = this.getEmojiAngle();
        values.statusIndicatorTiltAngle = 0;

        if (this.card.faceUp) {
            values.statusIndicatorRadius = this.indicatorRadius;
            values.statusIndicatorAngle += 40;
            values.statusIndicatorTiltAngle = -10;
        }

        if (this.card.onFire) {
            let timeSinceOnFire = Date.now() - this.card.timeAtOnFire;
            if (timeSinceOnFire < 70) {
                values.statusIndicatorTiltAngle = -20.0;
            }
            values.statusIndicatorTiltAngle = spring(values.statusIndicatorTiltAngle, {stiffness: 60, damping: 0.0});
            values.statusIndicatorScale = spring(values.statusIndicatorScale, {stiffness: 60, damping: 0.0});
        } else {
            values.statusIndicatorScale = spring(values.statusIndicatorScale, {stiffness: 150, damping: 15});
            values.statusIndicatorTiltAngle = spring(values.statusIndicatorTiltAngle, {stiffness: 150, damping: 15});
        }

        values.statusIndicatorRadius = spring(values.statusIndicatorRadius, {stiffness: 150, damping: 15});
        values.statusIndicatorAngle = spring(values.statusIndicatorAngle, {stiffness: 150, damping: 15});


        return values;
    }

    getEmojiAngle() {
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
        return emojiAngleRad * 180 / Math.PI - 90;
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
        if (this.card.isBurned || this.card.isShocked) {
            cardBackBorderColor = "#2e2e2e";
        }
        else {
            cardBackBorderColor = this.eplColorsBorder[colorId];
        }

        let cardBackInnerColor;
        if (this.card.flipRejected) {
            cardBackInnerColor = this.eplColorsFlipRejected[colorId];
        }
        else if (this.card.isBurned || this.card.isShocked) {
            cardBackInnerColor = "#4d4d4d"
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
        else if (this.card.brokeCombo && (this.card.isShocked || this.card.isBurned)) {
            frontColor = "#535053";
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
        else if (this.card.emoji === '🔥') {
            frontColor = "#f97176";
        }
        else {
            frontColor = "#e5eae8";
        }

        const cardFrontInner = {
            transform: `scale(0.88)`,
            backgroundColor : frontColor,
        };

        let emojiAngle = this.getEmojiAngle();
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

        let indicatorRadius = 3.5;

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
            transform: `rotate(${comboIndicatorAngle}deg) translate(0vh, -${indicatorRadius}vh)`
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

        let statusIndicatorSize = 0.5 * this.props.size;
        const statusIndicatorContainer = {
            zIndex: '5',
            position: 'absolute',
            isolation: 'isolate',
            top: "50%",
            left: "50%",
            width: '0vh',
            height: '0vh',
            transform: `rotate(${values.statusIndicatorAngle}deg) translate(0vh, -${values.statusIndicatorRadius}vh)`
        };
        const statusIndicator = {
            zIndex: '5',
            position: 'absolute',
            isolation: 'isolate',
            transform: `translate(-50%, -50%) rotate(${values.statusIndicatorTiltAngle}deg) scale(${values.statusIndicatorScale})`,
            fontFamily: "'Arial Black', Gadget, sans-serif",
            fontSize: statusIndicatorSize + "vh",
            color: this.card.specialMatch ? "#ff00bb" : '#e92200',
            lineHeight: statusIndicatorSize + "vh",
        };

        return {cardFront, cardBack, cardMain, cardFrontInner, cardBackInner, emoji, twemoji,
            comboIndicator, comboIndicatorContainer, statusIndicator, statusIndicatorContainer};
    }

    render() {

        let initialValues = this.getInitialValues();
        let targetValues = this.getTargetValues();

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

                            <div style={styles.statusIndicatorContainer}>
                                <div style={styles.statusIndicator}>{this.card.statusIndicator}</div>
                            </div>

                            <div className={"card"} style={styles.cardFront}>
                                <div className={"card"} style={styles.cardFrontInner}>
                                    {this.props.useTwemoji ? (
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