import React from 'react';

export default class CardFlipDot extends React.Component {
    render() {
        let innerDotRadius = 0.5;
        let outerDotRadius = 1.0;
        return (
            <div
                style = {{
                    zIndex: 2,
                    position: 'absolute',
                    transform: `translate(${this.props.x}vh, ${this.props.y}vh)`,

                }}
            >
                <div
                    style ={{
                        position: 'absolute',
                        width: (innerDotRadius * 2) + "vh",
                        height: (innerDotRadius * 2) + "vh",
                        transform: `
                            translate(${-innerDotRadius}vh, ${-innerDotRadius}vh)
                        `,
                        borderRadius: "50%",
                        borderWidth: "0.25vh",
                        borderColor: "#120f12",
                        borderStyle: "solid",
                        backgroundColor: "#282528",
                        boxShadow: "0 0 0.25vh #000000",
                    }}
                />
                <h1 style={{
                    fontSize: "1vh",
                    position: "absolute",
                    transform: `
                        translate(-50%, -50%)
                        scale(${this.props.wizardDot ? this.props.fill : 0.0})
                    `,
                    zIndex: 2,
                }}>
                    {'🧙‍'}
                </h1>
                <div
                    style ={{
                        position: 'absolute',
                        width: (outerDotRadius * 2) + "vh",
                        height: (outerDotRadius * 2) + "vh",
                        transform: `
                            translate(${-outerDotRadius}vh, ${-outerDotRadius}vh)
                            scale(${this.props.fill})
                        `,
                        borderRadius: "50%",
                        borderWidth: "0.25vh",
                        borderColor: this.props.wizardDot ? "#0a1211" : "#090912",
                        borderStyle: "solid",
                        backgroundColor: this.props.wizardDot ? "#7bd6ff" : "#5ef997",
                        boxShadow: "0 0 0.25vh #000000",
                    }}
                />


            </div>
        )
    }
}