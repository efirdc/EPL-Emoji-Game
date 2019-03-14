import React from 'react';
import Offset from 'polygon-offset';
import "./Patterns.css";

export default class InnerFrame extends React.PureComponent {
    getPointData(points) {
        let minX = Math.min(...points.map(([x, ]) => (x)));
        let maxX = Math.max(...points.map(([x, ]) => (x)));
        let minY = Math.min(...points.map(([, y]) => (y)));
        let maxY = Math.max(...points.map(([, y]) => (y)));
        let boundingBox = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        };

        let localPoints = points.map(([x, y]) => ([x - boundingBox.x, y - boundingBox.y]));
        let stringCoords = localPoints.map(([x, y]) =>
            (x.toFixed(3) + 'vh ' + y.toFixed(3) + 'vh')
        );
        let clipPolygon = 'polygon(' + stringCoords.join(', ') + ')';
        return {boundingBox, localPoints, clipPolygon};
    }

    render () {

        /////////////
        let inputPoints = this.props.hull.map(({x, y}) => ([x, y]));
        inputPoints.push(inputPoints[0]);
        let offset = new Offset();
        let innerPoints = new Offset().data(inputPoints).margin(1.25)[0];
        let outerPoints = new Offset().data(inputPoints).margin(0.75)[0];
        console.log(innerPoints)

        let innerPointData = this.getPointData(innerPoints);
        let outerPointData = this.getPointData(outerPoints);

        let polygonCSS = (pointData) => {return {
            position: 'fixed',
            width: pointData.boundingBox.width + 'vh',
            height: pointData.boundingBox.height + 'vh',
            transform: `translate(${pointData.boundingBox.x}vh, ${pointData.boundingBox.y}vh)`,
            clipPath: pointData.clipPolygon,
        }};
        let borderHullStyle = {
            zIndex: 1,
            ...polygonCSS(innerPointData),
            backgroundColor : "#0e091d",
        };

        let mainHullStyle = {
            zIndex: 1,
            ...polygonCSS(outerPointData),
        };

        return (
            <div>
                <div style={borderHullStyle}/>
                <div className={"radialGradient2"} style={mainHullStyle}/>
            </div>
        )
    }
}