import React from 'react';
import {Motion, spring, presets} from 'react-motion';

export default class ScoreParticle extends React.PureComponent {

    getInitialValues() {
        return {
            x: this.props.spawnX,
            y: this.props.spawnY,
        }
    }

    getTargetValues() {
        let springParams;
        if (this.props.absorb) {
            springParams = {stiffness: 80, damping: 7};
        } else {
            springParams = {stiffness: 50, damping: 13};
        }

        return {
            x: spring(this.props.targetX, springParams),
            y: spring(this.props.targetY, springParams),
        }
    }

    getStyle(x, y) {
        let size = 1.5;
        return {
            zIndex: 1000,
            position: 'absolute',
            width: size + 'vh',
            height: size + 'vh',
            transform: `
                translate(${-size * 0.5 + x}vh, ${-size * 0.5 + y}vh)
            `,
            borderRadius: "50%",
            backgroundColor: "#22d900",
            borderColor: "#126200",
            borderStyle: "solid",
            borderSize: size * 0.2 + 'vh',
            opacity: 0.65,
        };
    }

    render() {
        return (
            <Motion defaultStyle={this.getInitialValues()} style={this.getTargetValues()}>
                {interpolatedValues => {
                    let x = interpolatedValues.x;
                    let y = interpolatedValues.y;
                    let distanceFromCenter = Math.sqrt(x*x + y*y);
                    if (distanceFromCenter <= 7.0) {
                        this.props.deleteParticle(this.props.id);
                    }
                    return (
                        <div style={this.getStyle(interpolatedValues.x, interpolatedValues.y)}/>
                    )
                }}
            </Motion>
        );
    }
}