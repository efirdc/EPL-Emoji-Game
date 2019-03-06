import React from 'react';

export default function CardFlipCounter(props) {
    let counterStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: 'absolute',
        height: 0,
        width: 0,
        transform: `translate(${props.x}vh, ${props.y}vh) rotate(${props.rotation}deg)`,
        zIndex: 1
    };

    let flipsLeft = props.maxFlips - props.numFlips;

    return (
        <div style={counterStyle}>
            <h1
                style={{
                    fontFamily: "Courier New",
                    fontWeight: "200",
                    fontSize: "8vh",
                }}
            >
                {flipsLeft}
            </h1>
        </div>
    );
}