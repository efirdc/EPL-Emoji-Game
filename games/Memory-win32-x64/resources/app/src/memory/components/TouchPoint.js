import React from 'react';
import {Motion, spring} from 'react-motion';

export default class TouchPoint extends React.PureComponent {

    getStyle(x, y) {
        return {
            position: 'fixed',
            left: 0,
            top: 0,
            background: '#fff',
            border: 'solid 2px #999',
            opacity: .4,
            borderRadius: '50%',
            height: this.props.size + 'px',
            width: this.props.size + 'px',
            padding: 0,
            margin: 0,
            display: 'block',
            overflow: 'hidden',
            pointerEvents: 'all',
            //userSelect: 'none',
            transform: 'translate(' + (x - (this.props.size / 2)) + 'px, ' + (y - (this.props.size / 2)) + 'px)',
            zIndex: 100
        };
    }

    render() {
        return (
            <Motion
                defaultStyle={{x: this.props.x, y: this.props.y}}
                style={{
                    x: spring(this.props.x, {stiffness: 300, damping: 23}),
                    y: spring(this.props.y, {stiffness: 300, damping: 23})
                }}
            >
                {interpolated =>
                    <div
                        className={this.props.fake ? "FakeTouchPoint" : "TouchPoint"}
                        style={this.getStyle(interpolated.x, interpolated.y)}
                        id={this.props.id}
                    />}
            </Motion>
        );
    }

}