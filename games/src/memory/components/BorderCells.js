import React from 'react';
import "./Patterns.css";

export default class BorderCells extends React.PureComponent {
    render() {
        let getStyle = (x, y, scale, color) => {
            return {
                position: 'fixed',
                height: this.props.size + "vh",
                width: this.props.size + "vh",
                transform: `
                translate(${x - 0.5 * this.props.size}vh, ${y - 0.5 * this.props.size}vh) 
                scale(${scale})
                `,
                //zIndex: -1,
                clipPath: "polygon(50% 0%, 93.30125% 25%, 93.30125% 75%, 50% 100%, 6.69875% 75%, 6.69875% 25%)",
                backgroundColor: color,
            }
        };


        let allCells = this.props.innerCells.concat(this.props.outerCells);

        return (
            <div>
                <div>
                    {allCells.map((innerCell, index) => (
                        <div
                            key={index.toString()}
                            style={
                                getStyle(
                                    innerCell.x, innerCell.y,
                                    0.8,
                                    "#120f12"

                                )}
                        />
                    ))}
                </div>
                <div>
                    {allCells.map((innerCell, index) => (
                        <div
                            key={index.toString()}
                            style={getStyle(
                                innerCell.x, innerCell.y,
                                0.8*0.88,
                                "#282528"
                            )}
                        />
                    ))}
                </div>
            </div>
        )
    }
}