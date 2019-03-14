import React from 'react';
import "./Fonts.css";

export default function StarCounter(props) {
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

    return (
        <div style={counterStyle}>
            <h1
                className={"mainFontStyle"}
                style={{
                    fontSize: "14vh",
                }}
            >
                {props.numStars}
            </h1>
        </div>
    );
}