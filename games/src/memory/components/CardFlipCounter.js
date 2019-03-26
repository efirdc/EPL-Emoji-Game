import React from 'react';
import "./Fonts.css"
import {Motion, spring, presets} from 'react-motion';
import CardFlipDot from "./CardFlipDot.js";

export default class CardFlipCounter extends React.Component {

    containerStyle() {
        return {
            zIndex: 2,
            position: 'absolute',
            transform: `
                translate(${this.props.x}vh, ${this.props.y}vh) 
                rotate(${this.props.rotation}deg)
            `,
        }
    }

    render() {
        let flipsLeft = this.props.maxFlips - this.props.numFlips;

        let dotSeparationAngle = 2 * Math.PI / this.props.maxFlips;
        let dotInitialAngle = Math.PI * 0.5 + 0.5 * dotSeparationAngle;
        let dotRadius = this.props.maxFlips * 0.5;

        let dotPositions = [];
        for (let i = 0; i < this.props.maxFlips; i++) {
            let dotAngle = dotInitialAngle + i * dotSeparationAngle;
            dotPositions.push({
                x: dotRadius * Math.cos(dotAngle),
                y: dotRadius * Math.sin(dotAngle),
            })
        }

        return (
            <div style={this.containerStyle()}>
                <Motion
                    defaultStyle={{numFlips: flipsLeft}}
                    style={{numFlips: spring(flipsLeft, presets.stiff)}}
                >
                    {interpolatingStyle => {
                        return (
                            <div>
                                {dotPositions.map((dotPosition, i) => (
                                    <CardFlipDot
                                        {...dotPosition}
                                        fill={Math.min(Math.max(interpolatingStyle.numFlips - i, 0.0), 1.0)}
                                        wizardDot={this.props.wizardMatched && (i === 0)}
                                    />
                                ))}
                            </div>
                        )
                    }}
                </Motion>
            </div>
        )
    }
}