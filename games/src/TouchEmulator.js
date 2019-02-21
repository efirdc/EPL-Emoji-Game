// This is the hammerjs touch emulator module converted to ES6 syntax
// https://github.com/hammerjs/touchemulator/blob/master/touch-emulator.js

/**
 * create an touch point
 * @constructor
 * @param target
 * @param identifier
 * @param pos
 * @param deltaX
 * @param deltaY
 * @returns {Object} touchPoint
 */
class Touch {
    constructor(target, identifier, pos, deltaX, deltaY) {
        deltaX = deltaX || 0;
        deltaY = deltaY || 0;

        this.identifier = identifier;
        this.target = target;
        this.clientX = pos.clientX + deltaX;
        this.clientY = pos.clientY + deltaY;
        this.screenX = pos.screenX + deltaX;
        this.screenY = pos.screenY + deltaY;
        this.pageX = pos.pageX + deltaX;
        this.pageY = pos.pageY + deltaY;
    }
}

/**
 * create empty touchlist with the methods
 * @constructor
 * @returns touchList
 */
class TouchList extends Array {
    item(index) {
        return this[index] || null;
    }

    identifiedTouch(id) {
        return this[id + 1] || null;
    }
}

export default class TouchEmulator {
    constructor() {
        this.isMultiTouch = false;
        this.multiTouchStartPos;
        this.eventTarget;
        this.touchElements = {};

        // polyfills
        if (!document.createTouch) {
            document.createTouch = function (view, target, identifier, pageX, pageY, screenX, screenY, clientX, clientY) {
                // auto set
                if (clientX === undefined || clientY === undefined) {
                    clientX = pageX - window.pageXOffset;
                    clientY = pageY - window.pageYOffset;
                }

                return new Touch(target, identifier, {
                    pageX: pageX,
                    pageY: pageY,
                    screenX: screenX,
                    screenY: screenY,
                    clientX: clientX,
                    clientY: clientY
                });
            };
        }

        if (!document.createTouchList) {
            document.createTouchList = function () {
                var touchList = new TouchList();
                for (var i = 0; i < arguments.length; i++) {
                    touchList[i] = arguments[i];
                }
                touchList.length = arguments.length;
                return touchList;
            };
        }

        if (this.hasTouchSupport()) {
            return;
        }

        this.fakeTouchSupport();

        window.addEventListener("mousedown", this.onMouse('touchstart'), true);
        window.addEventListener("mousemove", this.onMouse('touchmove'), true);
        window.addEventListener("mouseup", this.onMouse('touchend'), true);

        window.addEventListener("mouseenter", this.preventMouseEvents, true);
        window.addEventListener("mouseleave", this.preventMouseEvents, true);
        window.addEventListener("mouseout", this.preventMouseEvents, true);
        window.addEventListener("mouseover", this.preventMouseEvents, true);

        // it uses itself!
        window.addEventListener("touchstart", this.showTouches, true);
        window.addEventListener("touchmove", this.showTouches, true);
        window.addEventListener("touchend", this.showTouches, true);
        window.addEventListener("touchcancel", this.showTouches, true);
    }

    /**
     * Simple trick to fake touch event support
     * this is enough for most libraries like Modernizr and Hammer
     */
    fakeTouchSupport() {
        var objs = [window, document.documentElement];
        var props = ['ontouchstart', 'ontouchmove', 'ontouchcancel', 'ontouchend'];

        for (var o = 0; o < objs.length; o++) {
            for (var p = 0; p < props.length; p++) {
                if (objs[o] && objs[o][props[p]] === undefined) {
                    objs[o][props[p]] = null;
                }
            }
        }
    }

    /**
     * we don't have to emulate on a touch device
     * @returns {boolean}
     */
    hasTouchSupport() {
        return ("ontouchstart" in window) || // touch events
            (window.Modernizr && window.Modernizr.touch) || // modernizr
            (navigator.msMaxTouchPoints || navigator.maxTouchPoints) > 2; // pointer events
    }

    /**
     * disable mouseevents on the page
     * @param ev
     */
    preventMouseEvents(ev) {
        ev.preventDefault();
        ev.stopPropagation();
    }

    /**
     * only trigger touches when the left mousebutton has been pressed
     * @param touchType
     * @returns {Function}
     */
    onMouse(touchType) {
        return (ev) => {
            // prevent mouse events
            this.preventMouseEvents(ev);

            if (ev.which !== 1) {
                return;
            }

            // The EventTarget on which the touch point started when it was first placed on the surface,
            // even if the touch point has since moved outside the interactive area of that element.
            // also, when the target doesnt exist anymore, we update it
            if (ev.type === 'mousedown' || !this.eventTarget || (this.eventTarget && !this.eventTarget.dispatchEvent)) {
                this.eventTarget = ev.target;
            }

            // shiftKey has been lost, so trigger a touchend
            if (this.isMultiTouch && !ev.shiftKey) {
                this.triggerTouch('touchend', ev);
                this.isMultiTouch = false;
            }

            this.triggerTouch(touchType, ev);

            // we're entering the multi-touch mode!
            if (!this.isMultiTouch && ev.shiftKey) {
                this.isMultiTouch = true;
                this.multiTouchStartPos = {
                    pageX: ev.pageX,
                    pageY: ev.pageY,
                    clientX: ev.clientX,
                    clientY: ev.clientY,
                    screenX: ev.screenX,
                    screenY: ev.screenY
                };
                this.triggerTouch('touchstart', ev);
            }

            // reset
            if (ev.type === 'mouseup') {
                this.multiTouchStartPos = null;
                this.isMultiTouch = false;
                this.eventTarget = null;
            }
        }
    }

    /**
     * trigger a touch event
     * @param eventName
     * @param mouseEv
     */
    triggerTouch(eventName, mouseEv) {
        var touchEvent = document.createEvent('Event');
        touchEvent.initEvent(eventName, true, true);

        touchEvent.altKey = mouseEv.altKey;
        touchEvent.ctrlKey = mouseEv.ctrlKey;
        touchEvent.metaKey = mouseEv.metaKey;
        touchEvent.shiftKey = mouseEv.shiftKey;

        touchEvent.touches = this.getActiveTouches(mouseEv, eventName);
        touchEvent.targetTouches = this.getActiveTouches(mouseEv, eventName);
        touchEvent.changedTouches = this.getChangedTouches(mouseEv, eventName);

        this.eventTarget.dispatchEvent(touchEvent);
    }

    /**
     * create a touchList based on the mouse event
     * @param mouseEv
     * @returns {TouchList}
     */
    createTouchList(mouseEv) {
        var touchList = new TouchList();

        if (this.isMultiTouch) {
            var f = TouchEmulator.multiTouchOffset;
            var deltaX = this.multiTouchStartPos.pageX - mouseEv.pageX;
            var deltaY = this.multiTouchStartPos.pageY - mouseEv.pageY;

            touchList.push(new Touch(this.eventTarget, 1, this.multiTouchStartPos, (deltaX * -1) - f, (deltaY * -1) + f));
            touchList.push(new Touch(this.eventTarget, 2, this.multiTouchStartPos, deltaX + f, deltaY - f));
        } else {
            touchList.push(new Touch(this.eventTarget, 1, mouseEv, 0, 0));
        }

        return touchList;
    }

    /**
     * receive all active touches
     * @param mouseEv
     * @param eventName
     * @returns {TouchList}
     */
    getActiveTouches(mouseEv, eventName) {
        // empty list
        if (mouseEv.type === 'mouseup') {
            return new TouchList();
        }

        var touchList = this.createTouchList(mouseEv);
        if (this.isMultiTouch && mouseEv.type !== 'mouseup' && eventName === 'touchend') {
            touchList.splice(1, 1);
        }
        return touchList;
    }

    /**
     * receive a filtered set of touches with only the changed pointers
     * @param mouseEv
     * @param eventName
     * @returns {TouchList}
     */
    getChangedTouches(mouseEv, eventName) {
        var touchList = this.createTouchList(mouseEv);

        // we only want to return the added/removed item on multitouch
        // which is the second pointer, so remove the first pointer from the touchList
        //
        // but when the mouseEv.type is mouseup, we want to send all touches because then
        // no new input will be possible
        if (this.isMultiTouch && mouseEv.type !== 'mouseup' &&
            (eventName === 'touchstart' || eventName === 'touchend')) {
            touchList.splice(0, 1);
        }

        return touchList;
    }

    /**
     * show the touchpoints on the screen
     */
    showTouches(ev) {
        if (this.touchElements === undefined) {
            this.touchElements = {};
        }

        var touch, i, el, styles;

        // first all visible touches
        for (i = 0; i < ev.touches.length; i++) {
            touch = ev.touches[i];
            el = this.touchElements[touch.identifier];
            if(!el) {
                el = this.touchElements[touch.identifier] = document.createElement("div");
                document.body.appendChild(el);
            }

            styles = TouchEmulator.template(touch);
            for (var prop in styles) {
                el.style[prop] = styles[prop];
            }
        }

        // remove all ended touches
        if (ev.type === 'touchend' || ev.type === 'touchcancel') {
            for (i = 0; i < ev.changedTouches.length; i++) {
                touch = ev.changedTouches[i];
                el = this.touchElements[touch.identifier];
                if (el) {
                    el.parentNode.removeChild(el);
                    delete this.touchElements[touch.identifier];
                }
            }
        }
    }


    // start distance when entering the multitouch mode
    static multiTouchOffset = 75;

    /**
     * css template for the touch rendering
     * @param touch
     * @returns object
     */
    static template = function (touch) {
        var size = 30;
        var transform = 'translate(' + (touch.clientX - (size / 2)) + 'px, ' + (touch.clientY - (size / 2)) + 'px)';
        return {
            position: 'fixed',
            left: 0,
            top: 0,
            background: '#fff',
            border: 'solid 1px #999',
            opacity: .6,
            borderRadius: '100%',
            height: size + 'px',
            width: size + 'px',
            padding: 0,
            margin: 0,
            display: 'block',
            overflow: 'hidden',
            pointerEvents: 'none',
            webkitUserSelect: 'none',
            mozUserSelect: 'none',
            userSelect: 'none',
            webkitTransform: transform,
            mozTransform: transform,
            transform: transform,
            zIndex: 100
        }
    };
}