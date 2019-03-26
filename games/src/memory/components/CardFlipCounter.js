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
        let gameLogic = this.props.gameLogic;
        let numFlips = gameLogic.concurrentFlips;
        let maxFlips = gameLogic.level.maxConcurrentFlips;
        let flipsLeft = maxFlips - numFlips;

        // If the wizard is matched, the number of dots in the circle is 1 less than the max
        // This is because the wizard dot is in the center of the circle and not the edge
        let numRadialDots = maxFlips;
        if (gameLogic.wizardMatched) {
            numRadialDots -= 1;
        }

        // Calculate offsets for the angle of each dot and its radius from the center (polar coords)
        let dotSeparationAngle = 2 * Math.PI / numRadialDots;
        let dotInitialAngle = Math.PI * 0.5 + 0.5 * dotSeparationAngle;
        let dotRadius = numRadialDots * 0.5;

        // Calculate the angle of each dot and convert to rectangular coordinates (xy coordinates)
        let dotPositions = [];
        for (let i = 0; i < numRadialDots; i++) {
            let dotAngle = dotInitialAngle + i * dotSeparationAngle;
            dotPositions.push({
                x: dotRadius * Math.cos(dotAngle),
                y: dotRadius * Math.sin(dotAngle),
            })
        }

        // If the wizard is matched, add the position of the wizard dot at the center.
        if (gameLogic.wizardMatched) {
            dotPositions.unshift({x: 0, y: 0});
        }

        // Set the animation target for the wizard dot scale so that it pulses in and out
        // for a bit after you match him.
        let wizardDotSize = 0.0;
        let timeSinceWizardMatched = Date.now() - this.props.timeAtWizardMatched;
        if (gameLogic.wizardMatched && timeSinceWizardMatched < 4000) {
            if (timeSinceWizardMatched % 400 < 200) {
                wizardDotSize = 2.0;
            } else {
                wizardDotSize = 1.5;
            }
        }

        return (
            <div style={this.containerStyle()}>
                <Motion
                    defaultStyle={{
                        numFlips: flipsLeft,
                        wizardDotScale: 0.0,
                    }}
                    style={{
                        numFlips: spring(flipsLeft, presets.stiff),
                        wizardDotScale: spring(wizardDotSize, presets.wobbly)
                    }}
                >
                    {interpolatingStyle => {
                            return (
                                <div>
                                    {dotPositions.map((dotPosition, i) => {

                                        // Get the fill of the current dot
                                        let fill = interpolatingStyle.numFlips - i;

                                        // Clamp the fill between 0 and 1
                                        fill = Math.min(Math.max(fill, 0.0), 1.0);

                                        // This dot is the wizard dot
                                        if (gameLogic.wizardMatched && (i===0)) {
                                            let wizardFill = Math.max(fill * 1.5, interpolatingStyle.wizardDotScale);
                                            return (
                                                <CardFlipDot
                                                    {...dotPosition}
                                                    fill={wizardFill}
                                                    wizardDot={true}
                                                />
                                            )
                                        }

                                        // Not the wizard dot
                                        else {
                                            return (
                                                <CardFlipDot
                                                    {...dotPosition}
                                                    fill={fill}
                                                    wizardDot={false}
                                                />
                                            )
                                        }
                                    })}
                                </div>
                            )
                    }}
                </Motion>
            </div>
        )
    }
}