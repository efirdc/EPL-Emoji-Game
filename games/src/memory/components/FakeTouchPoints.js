import React from "react"
import TouchPoint from "./Game";

export default class FakeTouchPoints extends React.Component {
    constructor(props) {
        super(props);
        this.touchPoints = {}; // Touch points simulated by the mouse
        this.nextFakeTouchIdentifier = 1000; // Next identifier to be used for a fake touch point (needs to be > 80)
        this.touchPointSize = 30; // size of a touch point
        this.draggingTouchPoint = -1; // identifier of the fake touch point that is being dragged

        this.tick = this.tick.bind(this);
    }

    // Game loop stuff
    componentDidMount() {
        this.loopID = this.props.loop.subscribe(this.tick);
        document.addEventListener("mousemove", this.handleMouse);
        document.addEventListener("mousedown", this.handleMouse);
        document.addEventListener("mouseup", this.handleMouse);
    }
    componentWillUnmount() {
        this.props.loop.unsubscribe(this.loopID);
    }
    tick(deltaTime) {
        this.updateTouchTargets();
        this.forceUpdate();
    }

    getCardElement(x, y) {
        let elementsAtPoint = document.elementsFromPoint(x, y);
        for (let elem of elementsAtPoint) {
            if (elem.className === "cardInputHandler") {
                return elem;
            }
        }
        return false;
    }

    dispatchCaptureEvent(cardElem) {
        let fakeEvent = new window.PointerEvent("gotpointercapture", {
            bubbles: true,
            cancelable: true,
            composed: true,
        });
        cardElem.dispatchEvent(fakeEvent);
    }

    dispatchReleaseEvent(cardElem) {
        let fakeEvent = new window.PointerEvent("lostpointercapture", {
            bubbles: true,
            cancelable: true,
            composed: true,
        });
        cardElem.dispatchEvent(fakeEvent);
    }

    updateTouchTargets() {
        for (let id in this.touchPoints) {

            if(!this.touchPoints.hasOwnProperty(id)) {
                continue;
            }

            let prevCardElem = this.touchPoints[id].cardElem;
            let newCardElem = this.getCardElement(this.touchPoints[id].x, this.touchPoints[id].y);
            this.touchPoints[id].cardElem = newCardElem;

            // Switch from one card to another
            if (prevCardElem && newCardElem && prevCardElem !== newCardElem) {
                this.dispatchCaptureEvent(newCardElem);
                this.dispatchReleaseEvent(prevCardElem);
            }

            // from no card to a card
            else if (!prevCardElem && newCardElem) {
                this.dispatchCaptureEvent(newCardElem);
            }

            // from card to no card
            else if (prevCardElem && !newCardElem) {
                this.dispatchReleaseEvent(prevCardElem);
            }
        }
    }

    handleMouse(event) {

        if (event.type === "mousedown") {

            // add or remove touch points on shift + click
            if (event.shiftKey) {

                // Delete a fake touch point if it is shift clicked
                // First dispatch a release event if it was targeting a card element
                if (event.target.className === "FakeTouchPoint") {
                    let cardElem = this.touchPoints[event.target.id].cardElem;
                    if (cardElem) {
                        this.dispatchReleaseEvent(cardElem);
                    }
                    delete this.touchPoints[event.target.id];
                }

                // Create a fake touch point
                // dispatch a capture event if it is targeting a card elemet
                else {
                    let cardElem = this.getCardElement(event.clientX, event.clientY);
                    this.touchPoints[this.nextFakeTouchIdentifier] = {
                        x: event.clientX,
                        y: event.clientY,
                        cardElem: cardElem,
                    };
                    if (cardElem) {
                        this.dispatchCaptureEvent(cardElem);
                    }
                    this.nextFakeTouchIdentifier += 1;
                }
            }

            // Start drag behavior if a touch point is clicked.
            else if (event.target.className === "FakeTouchPoint") {
                this.draggingTouchPoint = event.target.id;
            }
        }

        // Touch point drag behavior.
        else if (event.type === "mousemove" && this.draggingTouchPoint !== -1) {
            this.touchPoints[this.draggingTouchPoint].x = event.clientX;
            this.touchPoints[this.draggingTouchPoint].y = event.clientY;
        }

        else if (event.type === "mouseup") {
            this.draggingTouchPoint = -1;
        }
    }

    render() {
        return (
        <div>
            {Object.keys(this.touchPoints).map((touchID) => (
                <TouchPoint
                    {...this.touchPoints[touchID]}
                    fake={true}
                    id={touchID}
                    key={touchID.toString()}
                    size={this.touchPointSize}
                />
            ))}
        </div>
        );
    }
}


