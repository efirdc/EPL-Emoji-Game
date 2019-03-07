import React from 'react';
import {Motion, spring} from 'react-motion';

export default function TouchPoint(props) {

    let getStyle = (x, y) => { return {
        position: 'fixed',
        left: 0,
        top: 0,
        background: '#fff',
        border: 'solid 1px #999',
        opacity: .75,
        borderRadius: '50%',
        height: props.size + 'px',
        width: props.size + 'px',
        padding: 0,
        margin: 0,
        display: 'block',
        overflow: 'hidden',
        pointerEvents: 'all',
        //userSelect: 'none',
        transform: 'translate(' + (x - (props.size / 2)) + 'px, ' + (y - (props.size / 2)) + 'px)',
        zIndex: 100
    }};

    return (
        <Motion
            defaultStyle={{x: props.x, y: props.y}}
            style={{
                x: spring(props.x, {stiffness: 300, damping: 23}),
                y: spring(props.y, {stiffness: 300, damping: 23})
            }}
        >
            {interpolated =>
                <div
                    className={props.fake ? "FakeTouchPoint" : "TouchPoint"}
                    style={getStyle(interpolated.x, interpolated.y)}
                    id={props.id}
                />}
        </Motion>
    );
}