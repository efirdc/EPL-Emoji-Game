import React from 'react';

class AspectRatioRect extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            windowWidth: 0,
            windowHeight: 0,
        };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    // Component can respond to window resize.
    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
    updateWindowDimensions() {
        var docElem = document.documentElement;
        this.setState({ windowWidth: docElem.clientWidth, windowHeight: docElem.clientHeight });
    }

    render() {

        // Test if the aspect ratio of the window is wider than the target aspect ratio
        var aspect = this.props.aspectRatio;
        var wide = (this.state.windowWidth/this.state.windowHeight) > aspect;

        // Calculate the height and width of the rect in pixels
        var rectWidth, rectHeight;
        if (wide) {
            rectWidth = this.state.windowHeight * aspect;
            rectHeight = this.state.windowHeight;
        } else {
            rectWidth = this.state.windowWidth;
            rectHeight = this.state.windowWidth / aspect;
        }

        const style = {
            margin: "auto",
            width: rectWidth + "px",
            height: rectHeight + "px",

            // Just for debugging
            borderStyle: "solid",
            borderColor: wide ? "green" : "red",
        };

        return <div style={style}/>
    }
}

export default AspectRatioRect;