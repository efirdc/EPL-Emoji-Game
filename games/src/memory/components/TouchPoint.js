import React from 'react';
import {Motion, spring} from 'react-motion';

export default function TouchPoint(props) {

    let getStyle = (x, y, size) => { return {
        position: 'fixed',
        left: 0,
        top: 0,
        background: '#fff',
        border: 'solid 1px #999',
        opacity: .4,
        borderRadius: '50%',
        height: size + 'px',
        width: size + 'px',
        padding: 0,
        margin: 0,
        display: 'block',
        overflow: 'hidden',
        //pointerEvents: 'none',
        //userSelect: 'none',
        transform: 'translate(' + (x - (size / 2)) + 'px, ' + (y - (size / 2)) + 'px)',
        zIndex: 100
    }};
    return (
        <Motion defaultStyle={{x: 0, y: 0}}
        <div
            className={props.fake ? "FakeTouchPoint" : "TouchPoint"}
            style={style}
            id={props.id}
        />
    );
}