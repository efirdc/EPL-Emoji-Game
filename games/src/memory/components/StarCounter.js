import React from 'react';
import "./Fonts.css";
import {getCssData, polygonCss} from "../controllers/Utilities.js";
import Offset from "polygon-offset";
import {Motion, spring, presets} from 'react-motion';

export default class StarCounter extends React.Component {

    constructor(props) {
        super(props);
        this.timeAtLastAbsorb = Date.now() - 1000;

        this.absorbEvent = this.absorbEvent.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    componentDidMount() {
        document.addEventListener("particleabsorb", this.absorbEvent);
    }

    absorbEvent(event) {
        this.timeAtLastAbsorb = Date.now();
    }

    containerStyle(scale, rotation) {
        return {
            zIndex: 2,
            position: 'absolute',
            transform: `
                translate(0vh, 1vh) 
                scale(${scale}) 
                rotate(${rotation}deg)
            `
        }
    }

    circleStyle(scale) {
        let radius = 7.0;
        return {
            zIndex: 2,
            position: "fixed",
            width: (radius * 2) + "vh",
            height: (radius * 2) + "vh",
            transform: `
                translate(${-radius}vh, ${-radius}vh) 
                scale(${scale})
            `,
            borderRadius: "50%",
            borderWidth: "0.5vh",
            borderStyle: "solid",
            borderColor: "#ffbe00",
        };
    }

    getStarStyles() {

        let pointsInAStar = 10;
        let starPoints = [];
        for (let i = 0; i < pointsInAStar; i++) {

            let angle = (Math.PI / pointsInAStar) + (2 * Math.PI / pointsInAStar) * i;

            let innerPoint = (i % 2) === 0;
            let radius;
            if (innerPoint) {
                radius = 8.0;
            } else {
                radius = 14.0;
            }

            let x = radius * Math.cos(angle);
            let y = radius * Math.sin(angle);
            starPoints.push([x, y]);
        }
        starPoints.push(starPoints[0]);

        let starFillPoints = new Offset().data(starPoints).margin(0.75)[0];
        let starBorderPoints = new Offset().data(starPoints).margin(1.25)[0];

        // Shift the star points from the [-1, 1] domain to the [0, 1] domain
        let fillCssData = getCssData(starFillPoints);
        let borderCssData = getCssData(starBorderPoints);

        let fill = {
            ...polygonCss(fillCssData),
            zIndex: 2,
        };

        let border = {
            ...polygonCss(borderCssData),
            zIndex: 2,
            backgroundColor: "#ffbe00",
        };

        return {fill, border};
    };

    getInitialValues() {
        return {
            containerScale: 1.0,
            containerRotation: 0,
            circleScale: 1.0,
        }
    }

    getTargetValues() {

        let gameLogic = this.props.gameLogic;

        let values = {
            containerScale: 1.0,
            containerRotation: 0,
            circleScale: 1.0,
        };

        let timeSinceAddStar = Date.now() - gameLogic.timeAtAddStar;
        let timeSinceLastAbsorb = Date.now() - this.timeAtLastAbsorb;

        if (timeSinceLastAbsorb < 30) {
            values.circleScale = 1.1;
        }

        if (gameLogic.nthStarThisLevel === 1 && timeSinceAddStar < 300) {
            values.containerScale = 1.3;
        }
        else if (gameLogic.nthStarThisLevel === 2 && timeSinceAddStar < 300) {
            values.containerScale = 1.60;
        }
        else if (gameLogic.nthStarThisLevel === 3 && timeSinceAddStar < 300) {
            values.containerScale = 2.00;
            if (timeSinceAddStar < 150) {
                values.containerRotation = -50;
            } else {
                values.containerRotation = 50;
            }
        }
        else if (gameLogic.nthStarThisLevel === 4 && timeSinceAddStar < 300) {
            values.containerScale = 3.00;
            if (timeSinceAddStar < 150) {
                values.containerRotation = -90;
            } else {
                values.containerRotation = 90;
            }
        }
        else if (gameLogic.nthStarThisLevel === 5 && timeSinceAddStar < 300) {
            values.containerScale = 3.25;
            if (timeSinceAddStar < 150) {
                values.containerRotation = -160;
            } else {
                values.containerRotation = 160;
            }
        }

        values.circleScale = spring(values.circleScale, {stiffness: 100, damping: 2});
        values.containerScale = spring(values.containerScale, presets.wobbly);
        values.containerRotation = spring(values.containerRotation, {stiffness: 60, damping: 2});

        return values;
    }

    render() {

        let gameLogic = this.props.gameLogic;

        let numberStyle = {
            fontSize: "7vh",
            position: "absolute",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
        };

        let starStyles = this.getStarStyles();

        return (
            <Motion defaultStyle={this.getInitialValues()} style={this.getTargetValues()}>
                {interpolatingStyle => {
                return (
                    <div style={this.containerStyle(interpolatingStyle.containerScale, interpolatingStyle.containerRotation)}>
                        <div style={starStyles.border}/>
                        <div style={starStyles.fill} className={"radialGradient4"}/>
                        <div style={this.circleStyle(interpolatingStyle.circleScale)} className={"radialGradient3"}/>
                        <h1
                            className={"starFont"}
                            style={numberStyle}
                        >
                            {gameLogic.numStars}
                        </h1>
                    </div>
                )
                }}
            </Motion>
        );
    }

}