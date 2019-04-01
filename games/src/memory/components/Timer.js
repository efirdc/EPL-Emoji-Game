import React from 'react';
import "./Fonts.css"
import {Motion, presets, spring} from "react-motion";
import CardFlipDot from "./CardFlipCounter";

export default class Timer extends React.Component {

    timerIndicatorTextStyle(scale, rotation) {
        let size = 3;
        return {
            zIndex: '2',
            position: 'absolute',
            transform: `
                translate(-50%, -50%) 
                rotate(${rotation}deg) 
                scale(${scale})
            `,
            fontFamily: "'Arial Black', Gadget, sans-serif",
            fontSize: size + "vh",
            WebkitTextStrokeWidth: 0.2 + 'vh',
            WebkitTextStrokeColor: "black",
            lineHeight: size + "vh",
        }
    }

    render() {

        let gameLogic = this.props.gameLogic;

        let containerStyle = {
            position: 'absolute',
            height: 0,
            width: 0,
            transform: `
                translate(${this.props.x}vh, ${this.props.y}vh) 
                rotate(${this.props.rotation}deg)
            `,
            zIndex: 2,
        };

        let numberStyle = {
            fontSize: "7vh",
            position: "absolute",
            transform: "translate(-50%, -50%)",
            hyphens: "none",
            zIndex: 2,
        };

        let minutes, seconds;
        if (gameLogic.timeLeft === Infinity) {
            minutes = seconds = '\u2011\u2011'; // Unicode characters for '--' but without line breaks
        } else {
            let time = Math.max(0, Math.ceil(gameLogic.timeLeft));
            minutes = Math.floor(time / 60).toString().padStart(2, '0');
            seconds = Math.floor(time - minutes * 60).toString().padStart(2, '0');
        }

        let timerIndicatorScale = 0.0;
        let timeSinceTimerMatched = Date.now() - this.props.timeAtTimerMatched;
        if (gameLogic.wizardMatched && timeSinceTimerMatched < 4000) {
            timerIndicatorScale = 1.0;
        }

        let timerIndicatorContainerStyle = {
            zIndex: '2',
            position: 'absolute',
            width: '0vh',
            height: '0vh',
            transform: `translate(0vh, -8vh)`
        };

        return (
            <div style={containerStyle}>
                <h1
                    className={"hullFont"}
                    style={numberStyle}
                >
                    {minutes + ":" + seconds}
                </h1>
                <Motion
                    defaultStyle={{scale: 0.0}}
                    style={{scale: spring(timerIndicatorScale, presets.stiff)}}
                >
                    {interpolatingStyle => {
                        return (
                            <div style={timerIndicatorContainerStyle}>
                                <h1
                                    style={this.timerIndicatorTextStyle(interpolatingStyle.scale, 0.0)}
                                >
                                    {"⏱ + " + gameLogic.level.timerAdds}
                                </h1>

                            </div>
                        )
                    }}
                </Motion>
            </div>
        );
    }

}