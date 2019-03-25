import React from 'react';
import "./Fonts.css"
import {Motion, spring, presets} from 'react-motion';
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

    mainCircleStyle() {
        let radius = 4.5;
        return {
            zIndex: 2,
            position: 'absolute',
            width: (radius * 2) + "vh",
            height: (radius * 2) + "vh",
            borderRadius: "50%",
            borderWidth: "0.5vh",
            borderColor: "#16162f",
            borderStyle: "solid",
            backgroundColor: "#e5eae8",
            transform: `
                translate(${-radius}vh, ${-radius}vh) 
            `
        }
    }

    innerCircleStyle(fillPercent) {
        let radius = 4.0;
        return {
            zIndex: 2,
            width: (radius * 2) + "vh",
            height: (radius * 2) + "vh",
            position: 'absolute',
            borderRadius: '50%',
            backgroundColor: "#009cff",
            transform: `
                translate(${-radius}vh, ${-radius}vh) 
                scale(${fillPercent})
            `
        }
    }

    render() {
        let numberStyle = {
            fontSize: "7vh",
            position: "absolute",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
        };

        let flipsLeft = this.props.maxFlips - this.props.numFlips;
        let flipPercent = flipsLeft / this.props.maxFlips;

        return (
            <Motion
                defaultStyle={{flipPercent}}
                style={{flipPercent: spring(flipPercent, presets.wobbly)}}
            >
                {interpolatingStyle => {
                return (
                    <div style={this.containerStyle()}>
                        <div style={this.mainCircleStyle()}/>
                        <div style={this.innerCircleStyle(interpolatingStyle.flipPercent)}/>
                        <h1 className={"hullFont"} style={numberStyle}>
                            {this.props.maxFlips}
                        </h1>
                    </div>
                )
                }}
            </Motion>
        );
    }
}