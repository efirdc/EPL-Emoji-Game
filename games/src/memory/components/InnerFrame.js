import React from 'react';
import Offset from 'polygon-offset';

export default class InnerFrame extends React.PureComponent {
    getPointData(points) {
        let minX = Math.min(points.map(([x, ]) => (x)));
        let maxX = Math.max(points.map(([x, ]) => (x)));
        let minY = Math.min(points.map(([, y]) => (y)));
        let maxY = Math.max(points.map(([, y]) => (y)));
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

        let halfWidth = this.props.hull[0].x * -1;
        let halfHeight = this.props.hull[1].y * -1;
        let width = halfWidth * 2;
        let height = halfHeight * 2;

        console.log(this.props.hull);
        let polyPoints = this.props.hull.map(({x, y}) => ([x + halfWidth, y + halfHeight]));
        polyPoints.push(polyPoints[0]);

        let polyStringCoords = polyPoints.map(([x, y]) => (x + 'vh ' + y + 'vh'));
        let clipPolygon = 'polygon(' + polyStringCoords.join(', ') + ')';

        let offset = new Offset();
        let polyPointsMargin = offset.data(polyPoints).arcSegments(1).offset(-0.5)[0];
        let marginStringCoords = polyPointsMargin.map(([x, y]) => (x + 'vh ' + y + 'vh'));
        let marginClipPolygon = 'polygon(' + marginStringCoords.join(', ') + ')';


        let inputPoints = this.props.hull.map(({x, y}) => ([x + halfWidth, y + halfHeight]));
        let innerPoints = offset.data(inputPoints).arcSegments(1).offset(-1.5)[0];
        let outerPoints = offset.data(inputPoints).arcSegments(1).offset(-2.0)[0];

        let innerPointData = this.getPointData(innerPoints);
        let outerPointData = this.getPointData(outerPoints);

        let polygonCSS = (bb) => {return {
            position: 'fixed',
            width: bb.width,
            height: bb.height,
            top: bb.y,
            left: bb.x,
        }};
        let borderHullStyle = {
            zIndex: 0,
            position: 'fixed',
            height: outerPointData.boundingBox.y + 'vh',
            width: outerPointData.boundingBox.x + 'vh',
            transform: `translate(${-halfWidth}vh, ${-halfHeight}vh)`,
            clipPath: clipPolygon,
            backgroundColor : "#120c23",
        };

        let mainHullStyle = {
            zIndex: 1,
            position: 'fixed',
            height: height + 'vh',
            width: width + 'vh',
            transform: `translate(${-halfWidth}vh, ${-halfHeight}vh)`,
            clipPath: marginClipPolygon,
            background: "radial-gradient(ellipse at center, rgba(154,93,171,1) 0%, rgba(154,93,171,1) 7%, rgba(6,4,26,1) 100%)",
        };


        return (
            <div>
                <div style={borderHullStyle}/>
                <div style={mainHullStyle}/>
            </div>
        )
    }
}