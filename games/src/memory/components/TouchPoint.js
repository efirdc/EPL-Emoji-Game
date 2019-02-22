import React from 'react';

export default function TouchPoint(props) {
    let transform = 'translate(' + (props.x - (props.size / 2)) + 'px, ' + (props.y - (props.size / 2)) + 'px)';
    let style = {
        position: 'fixed',
        left: 0,
        top: 0,
        background: '#fff',
        border: 'solid 1px #999',
        opacity: .6,
        borderRadius: '100%',
        height: props.size + 'px',
        width: props.size + 'px',
        padding: 0,
        margin: 0,
        display: 'block',
        overflow: 'hidden',
        //pointerEvents: 'none',
        //userSelect: 'none',
        transform: transform,
        zIndex: 100
    };
    return (
        <div
            className={props.fake ? "FakeTouchPoint" : "TouchPoint"}
            style={style}
            id={props.id}
        />
    );
}