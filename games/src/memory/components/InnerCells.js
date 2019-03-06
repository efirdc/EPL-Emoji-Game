import React from 'react';
import Card from "./Game";

export default function InnerCells(props) {
    let getStyle = (x, y) => { return {
        position: 'fixed',
        height: props.size + "vh",
        width: props.size + "vh",
        transform: `translate(${x - 0.5 * props.size}vh, ${y - 0.5 * props.size}vh) scale(0.9)`,
        //zIndex: -1,
        clipPath: "polygon(50% 0%, 93.30125% 25%, 93.30125% 75%, 50% 100%, 6.69875% 75%, 6.69875% 25%)",
        backgroundColor : "#fbfdff"
    }};
    return (
        <div>
            {props.innerCells.map((innerCell, index) => (
                <div
                    key={index.toString()}
                    style={getStyle(innerCell.x, innerCell.y)}
                />
            ))}
        </div>
    )
}