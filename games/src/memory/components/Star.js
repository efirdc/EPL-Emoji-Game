import React from 'react';
import './Star.css';

const positionStar = (x, y) => ({
    position: "absolute",
    transform: `translate(${x}vh, ${y}vh`
});

const Stars = () => ({

});

export default class Star extends React.Component {
    constructor(props) {
        super(props);
        this.state = {starsYellow: 0}
    }

    render() {
        let stars = [];
        let points = [
            {x: -2, y: -10},
            {x: 5, y: -5},
            {x: 2, y: 3},
            {x: -6, y: 3},
            {x: -9, y: -5}];
        for (let i = 0; i < 5; i++) {
            stars.push(<div className={"greyStar"} style={positionStar(points[i].x, points[i].y)}/>);
        };

        return (
            <div>
            {stars}
            </div>
        );
    }
}
