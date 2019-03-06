import React from 'react';

export default class OuterCells extends React.PureComponent {
    render () {
        let getStyle = (x, y) => {return {
            position: 'fixed',
            height: this.props.size + "vh",
            width: this.props.size + "vh",
            transform: `translate(${x - 0.5 * this.props.size}vh, ${y - 0.5 * this.props.size}vh) scale(0.8)`,
            //zIndex: -1,
            clipPath: "polygon(50% 0%, 93.30125% 25%, 93.30125% 75%, 50% 100%, 6.69875% 75%, 6.69875% 25%)",
            backgroundColor: "#282528"
        }};
        return (
            <div>
                {this.props.outerCells.map((outerCell, index) => (
                    <div
                        key={index.toString()}
                        style={getStyle(outerCell.x, outerCell.y)}
                    />
                ))}
            </div>
        )
    }
}