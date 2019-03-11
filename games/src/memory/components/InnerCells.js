import React from 'react';

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

        let polyPoints = [];
        for (let hullPoint of this.props.hull) {
            let polyPoint = {x: hullPoint.x + halfWidth, y: hullPoint.y + halfHeight};
            polyPoint.x = polyPoint.x.toFixed(3);
            polyPoint.y = polyPoint.y.toFixed(3);
            polyPoints.push(polyPoint);
        }

        let stringCoords = polyPoints.map((point) => (point.x + 'vh ' + point.y + 'vh'));

        let polygon = "polygon(" + stringCoords.join(', ') + ')';

        let mainHullStyle = {
            position: 'fixed',
            height: height + 'vh',
            width: width + 'vh',
            transform: `translate(${-halfWidth}vh, ${-halfHeight}vh)`,
            clipPath: polygon,
            backgroundColor : "#fbfdff"
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
                <div style={mainHullStyle}>

                </div>
            </div>
        )
    }
}