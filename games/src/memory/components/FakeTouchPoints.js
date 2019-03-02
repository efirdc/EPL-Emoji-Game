import React from "react"
import TouchPoint from "./TouchPoint.js";

// This component lets you add or remove fake draggable touch points by shift clicking with the mouse.
// The touch points will fire "gotpointercapture" and "releasepointercapture" events at divs with className "cardInputHandler"
// Since the Cards use the Pointer Event API to handle touch, they will respond to these events in the same way as when they are actually touched.
export default class FakeTouchPoints extends React.Component {
    constructor(props) {
        super(props);

        // This object contains all of the touchPoint objects
        // The properties are just integers that are consistent identifiers for the touchPoints.
        // These integers are used as keys on the components, as well as the id attribute on the TouchPoints div HTML element
        // This way the components have a consistent identity, and we can figure out which TouchPoint component is being clicked as well
        // Each touchPoint has an x, y, cardElem, and id property.
        // The cardElem is the HTML element that was under the touchPoint at the last update.
        this.touchPoints = {};

        // This identifier will be used for the next touchPoint that is added to touchPoints
        // then it gets incremented
        this.nextIdentifier = 0;

        // Index of the touchPoint in touchPoints that is currently being dragged
        // -1 when nothing is currently being dragged.
        this.draggingTouchPoint = -1;

        // size of a touch point
        this.touchPointSize = 20;

        // Binding "this" is necessary for callback functions (otherwise "this" is undefined in the callback).
        this.tick = this.tick.bind(this);
        this.handleMouse = this.handleMouse.bind(this);
    }

    // Called by React when the component enters the scene
    componentDidMount() {

        // Handle all mouse events on the document
        document.addEventListener("mousemove", this.handleMouse);
        document.addEventListener("mousedown", this.handleMouse);
        document.addEventListener("mouseup", this.handleMouse);

        // Subscribe the the loop so that tick() gets called every frame.
        this.loopID = this.props.loop.subscribe(this.tick);
    }

    // Unsubscribe when component leaves the scene.
    componentWillUnmount() {
        this.props.loop.unsubscribe(this.loopID);
    }

    // called every frame
    tick(deltaTime) {
        this.updateTouchTargets();
        this.forceUpdate();
    }

    // Gets a Card components HTML element at a given point.
    // If there is no Card at that point, returns false instead
    getCardElement(x, y) {
        let elementsAtPoint = document.elementsFromPoint(x, y);
        for (let elem of elementsAtPoint) {
            if (elem.className === "cardInputHandler") {
                return elem;
            }
        }
        return false;
    }

    // Dispatches a pointer capture event at a card so it thinks it being touched
    dispatchCaptureEvent(cardElem) {
        let fakeEvent = new window.PointerEvent("gotpointercapture", {
            bubbles: true,
            cancelable: true,
            composed: true,
        });
        cardElem.dispatchEvent(fakeEvent);
    }

    // Same thing, but a release event.
    dispatchReleaseEvent(cardElem) {
        let fakeEvent = new window.PointerEvent("lostpointercapture", {
            bubbles: true,
            cancelable: true,
            composed: true,
        });
        cardElem.dispatchEvent(fakeEvent);
    }

    // Touch points move, but so can cards.
    // So we have to continuously retarget the touch points to make sure they are actually referencing the right card elements
    // This is called every frame right now, which gets really slow with lots of touch points
    updateTouchTargets() {

        // Loop through every touch point
        for (let touchID in this.touchPoints) {

            // Skip the objects prototype properties
            if (!this.touchPoints.hasOwnProperty(touchID)) {
                continue;
            }

            // Get the card elements targeted on the previous and current update.
            let prevCardElem = this.touchPoints[touchID].cardElem;
            let currentCardElem = this.getCardElement(this.touchPoints[touchID].x, this.touchPoints[touchID].y);
            this.touchPoints[touchID].cardElem = currentCardElem;

            // If the touch point switched from one card to another,
            // then release the old card and capture the new one.
            if (prevCardElem && currentCardElem && prevCardElem !== currentCardElem) {
                this.dispatchCaptureEvent(currentCardElem);
                this.dispatchReleaseEvent(prevCardElem);
            }

            // If the touch point wasn't targeting a card and now it is
            // then capture the card
            else if (!prevCardElem && currentCardElem) {
                this.dispatchCaptureEvent(currentCardElem);
            }

            // If the touch point was targeting a card and now it isn't
            // then release the card
            else if (prevCardElem && !currentCardElem) {
                this.dispatchReleaseEvent(prevCardElem);
            }
        }
    }

    // This gets called on all the mouse events bound in componentDidMount()
    // it handles creating, dragging, and removing touch points with the mouse.
    handleMouse(event) {

        if (event.type === "mousedown") {

            // add or remove touch points on shift + click
            if (event.shiftKey) {

                // Delete a fake touch point if it is shift clicked
                // and dispatch a release event if it was targeting a card element
                if (event.target.className === "FakeTouchPoint") {
                    let cardElem = this.touchPoints[event.target.id].cardElem;
                    if (cardElem) {
                        this.dispatchReleaseEvent(cardElem);
                    }
                    delete this.touchPoints[event.target.id];
                }

                // otherwise just create a fake touch point.
                // dispatch a capture event if it is targeting a card element
                else {
                    let cardElem = this.getCardElement(event.clientX, event.clientY);
                    this.touchPoints[this.nextIdentifier] = {
                        x: event.clientX,
                        y: event.clientY,
                        cardElem: cardElem,
                    };
                    if (cardElem) {
                        this.dispatchCaptureEvent(cardElem);
                    }
                    this.nextIdentifier += 1;
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

        // Release any dragged touch points
        else if (event.type === "mouseup") {
            this.draggingTouchPoint = -1;
        }
    }

    render() {
        // Map all the touchPoints to TouchPoint components
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


