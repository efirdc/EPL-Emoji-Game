import React from 'react';
import "./Fonts.css"
import {Motion, presets, spring} from "react-motion";
import CardFlipDot from "./CardFlipCounter";

export default class Timer extends React.Component {

    timerIndicatorTextStyle(scale, rotation) {
        let size = 3;
        return {
            zIndex: 3,
            position: 'absolute',
            transform: `
                translate(-50%, -50%) 
                rotate(${rotation}deg) 
                scale(${scale})
            `,
            fontSize: size + "vh",
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
        let timeSinceTimerMatched = Date.now() - gameLogic.timeAtTimerMatched;
        if (gameLogic.timeLeft === Infinity) {
            minutes = seconds = '\u2011\u2011'; // Unicode characters for '--' but without line breaks
        } else {
            let time = Math.max(0, Math.ceil(gameLogic.timeLeft));
            if (gameLogic.timerMatched) {
                let timeAdded = gameLogic.level.timerAdds;
                time -= Math.max(timeAdded - timeSinceTimerMatched * 20 / 1000 , 0)
            }
            minutes = Math.floor(time / 60).toString().padStart(2, '0');
            seconds = Math.floor(time - minutes * 60).toString().padStart(2, '0');
        }

        let timerIndicatorScale = 0.0;
        if (gameLogic.timerMatched && timeSinceTimerMatched < 4000) {
            timerIndicatorScale = 1.0;
        }

        let timerIndicatorContainerStyle = {
            zIndex: 3,
            position: 'absolute',
            width: '0vh',
            height: '0vh',
            transform: `translate(0vh, -5.5vh)`
        };

        return (
            <div style={containerStyle}>
                <p
                    className={"hullFont"}
                    style={numberStyle}
                >
                    {minutes + ":" + seconds}
                </p>
                <Motion
                    defaultStyle={{
                        scale: 0.0,
                        rotation: -5
                    }}
                    style={{
                        scale: spring(timerIndicatorScale, presets.stiff),
                        rotation: spring(0, {stiffness: 25, damping: 0})
                    }}
                >
                    {interpolatingStyle => {
                        return (
                            <div style={timerIndicatorContainerStyle}>
                                <div className={"hullFont"} style={this.timerIndicatorTextStyle(interpolatingStyle.scale, interpolatingStyle.rotation)}>
                                    ⏱<nbr/>{`+${gameLogic.level.timerAdds}`}
                                </div>

                            </div>
                        )
                    }}
                </Motion>
            </div>
        );
    }

}