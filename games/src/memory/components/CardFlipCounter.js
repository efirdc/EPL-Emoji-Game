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
                    fontSize: "8vh",

                    fontFamily: "'Arial Black', Gadget, sans-serif",
                    color: '#e5eae8',
                    WebkitTextStrokeWidth: 0.5 + 'vh',
                    WebkitTextStrokeColor: "black",
                }}
            >
                {flipsLeft}
            </h1>
        </div>
    );
}