import React from 'react';
import Card from "./Game";

export default function OuterCells(props) {
    let getStyle = (x, y) => { return {
        position: 'fixed',
        height: props.size + "vh",
        width: props.size + "vh",
        transform: `translate(${x - 0.5 * props.size}vh, ${y - 0.5 * props.size}vh) scale(0.9)`,
        //zIndex: -1,
        clipPath: "polygon(50% 0%, 93.30125% 25%, 93.30125% 75%, 50% 100%, 6.69875% 75%, 6.69875% 25%)",
        backgroundColor : "#282528"
    }};
    return (
        <div>
            {props.outerCells.map((outerCell, index) => (
                <div
                    key={index.toString()}
                    style={getStyle(outerCell.x, outerCell.y)}
                />
            ))}
        </div>
    )
}