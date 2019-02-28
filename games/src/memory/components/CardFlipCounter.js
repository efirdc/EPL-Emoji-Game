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

    let displayNumber = (1 - (props.numFlips / props.maxFlips)).toFixed(2);

    return (
        <div style={counterStyle}>
            <h1
                style={{
                    fontFamily: "Courier New",
                    fontWeight: "200",
                    fontSize: "5vh",
                }}
            >
                {displayNumber}
            </h1>
        </div>
    );
}