import React from 'react';
import "./Fonts.css";
import {getCssData, polygonCss} from "../controllers/Utilities.js";
import Offset from "polygon-offset";

export default class StarCounter extends React.PureComponent {

    circleStyle() {
        let radius = 7.0;
        return {
            zIndex: 2,
            position: "fixed",
            width: (radius * 2) + "vh",
            height: (radius * 2) + "vh",
            transform: `
                translate(${-radius}vh, ${-radius}vh)
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

    render() {

        let numberStyle = {
            fontSize: "7vh",
            position: "absolute",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
        };

        let starStyles = this.getStarStyles();

        return (
            <div>
                <div style={starStyles.border}/>
                <div style={starStyles.fill} className={"radialGradient4"}/>
                <div style={this.circleStyle()} className={"radialGradient3"}/>
                <h1
                    className={"mainFontStyle"}
                    style={numberStyle}
                >
                    {this.props.numStars}
                </h1>
            </div>
        );
    }

}