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
        return {
            x: spring(this.props.targetX, {stiffness: 75, damping: 6}),
            y: spring(this.props.targetY, {stiffness: 75, damping: 6}),
        }
    }

    getStyle(x, y) {
        let size = 3;
        return {
            zIndex: 3,
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
        };
    }


    render() {
        return (
            <Motion defaultStyle={this.getInitialValues()} style={this.getTargetValues()}>
                {interpolatedValues => {
                    return (
                        <div style={this.getStyle(interpolatedValues.x, interpolatedValues.y)}/>
                    )
                }}
            </Motion>
        );
    }
}