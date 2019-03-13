import React from 'react';
import Offset from 'polygon-offset';

export default class InnerCells extends React.PureComponent {
    render () {
        let getStyle = (x, y) => {return {
            position: 'fixed',
            height: this.props.size + "vh",
            width: this.props.size + "vh",
            transform: `translate(${x - 0.5 * this.props.size}vh, ${y - 0.5 * this.props.size}vh) scale(0.8)`,
            //zIndex: -1,
            clipPath: "polygon(50% 0%, 93.30125% 25%, 93.30125% 75%, 50% 100%, 6.69875% 75%, 6.69875% 25%)",
            backgroundColor : "#282528"
        }};

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

        let mainHullStyle = {
            zIndex: 0,
            position: 'fixed',
            height: height + 'vh',
            width: width + 'vh',
            transform: `translate(${-halfWidth}vh, ${-halfHeight}vh)`,
            clipPath: clipPolygon,
            backgroundColor : "#120c23"
        };

        let innerHullStyle = {
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
                <div>
                    {this.props.innerCells.map((innerCell, index) => (
                        <div
                            key={index.toString()}
                            style={getStyle(innerCell.x, innerCell.y)}
                        />
                    ))}
                </div>
                <div style={mainHullStyle}/>
                <div style={innerHullStyle}/>
            </div>
        )
    }
}