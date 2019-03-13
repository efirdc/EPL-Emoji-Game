import React from 'react';

export default function Timer(props) {
    let containerStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: 'absolute',
        height: 0,
        width: 0,
        transform: `translate(${props.x}vh, ${props.y}vh) rotate(${props.rotation}deg)`,
        zIndex: 1


    };

    let time = Math.max(0, Math.ceil(props.time));
    let minutes = Math.floor(time / 60).toString().padStart(2, '0');
    let seconds = Math.floor(time - minutes * 60).toString().padStart(2, '0');
    return (
        <div style={containerStyle}>
            <h1
                style={{
                    fontWeight: "200",
                    fontSize: "8vh",

                    fontFamily: "'Arial Black', Gadget, sans-serif",
                    color: '#e5eae8',
                    WebkitTextStrokeWidth: 0.5 + 'vh',
                    WebkitTextStrokeColor: "black",
                }}
            >
                {minutes + ":" + seconds}
            </h1>
        </div>
    );
}