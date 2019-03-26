import React from 'react';
import "./Fonts.css"

export default class Timer extends React.Component {

    render() {

        let gameLogic = this.props.gameLogic;

        let containerStyle = {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: 'absolute',
            height: 0,
            width: 0,
            transform: `
                translate(${this.props.x}vh, ${this.props.y}vh) 
                rotate(${this.props.rotation}deg)
            `,
            zIndex: 1,
        };

        let minutes, seconds;
        if (gameLogic.timeLeft === Infinity) {
            minutes = seconds = '\u2011\u2011'; // Unicode characters for '--' but without line breaks
        } else {
            let time = Math.max(0, Math.ceil(gameLogic.timeLeft));
            minutes = Math.floor(time / 60).toString().padStart(2, '0');
            seconds = Math.floor(time - minutes * 60).toString().padStart(2, '0');
        }

        return (
            <div style={containerStyle}>
                <h1
                    className={"hullFont"}
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

}