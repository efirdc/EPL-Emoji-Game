import React from 'react';
import "./Fonts.css"

export default function Timer(props) {
    let containerStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: 'absolute',
        height: 0,
        width: 0,
        transform: `translate(${props.x}vh, ${props.y}vh) rotate(${props.rotation}deg)`,
        zIndex: 1,
    };

    let minutes, seconds;
    if (props.time === Infinity) {
        minutes = seconds = '\u2011\u2011'; // Unicode characters for '--' but without line breaks
    } else {
        let time = Math.max(0, Math.ceil(props.time));
        minutes = Math.floor(time / 60).toString().padStart(2, '0');
        seconds = Math.floor(time - minutes * 60).toString().padStart(2, '0');
    }
    return (
        <div style={containerStyle}>
            <h1
                className={"mainFontStyle"}
                style={{
                    fontWeight: "200",
                    fontSize: "7vh",
                    hyphens: "none",
                }}
            >
                {minutes + ":" + seconds}
            </h1>
        </div>
    );
}