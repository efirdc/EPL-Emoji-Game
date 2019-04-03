import React from 'react';
import Offset from 'polygon-offset';
import "./Patterns.css";
import {getCssData, polygonCss} from "../controllers/Utilities.js";

export default class InnerFrame extends React.PureComponent {

    render () {

        let inputPoints = this.props.hull.map(({x, y}) => ([x, y]));
        inputPoints.push(inputPoints[0]);
        let innerPoints = new Offset().data(inputPoints).margin(1.25)[0];
        let outerPoints = new Offset().data(inputPoints).margin(0.75)[0];

        let innerPointData = getCssData(innerPoints);
        let outerPointData = getCssData(outerPoints);

        let borderHullStyle = {
            zIndex: 1,
            ...polygonCss(innerPointData),
            backgroundColor : "#0e091d",
        };

        let mainHullStyle = {
            zIndex: 1,
            ...polygonCss(outerPointData),
        };

        return (
            <div>
                <div style={borderHullStyle}/>
                <div className={"radialGradient2"} style={mainHullStyle}/>
            </div>
        )
    }
}