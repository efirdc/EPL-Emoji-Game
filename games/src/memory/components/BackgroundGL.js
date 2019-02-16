import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

function colorHex2Vec3(h) {
    let r = 0, g = 0, b = 0;

    if (h.length === 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];

    } else if (h.length === 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
    }

    return [r/255, g/255, b/255]
}

// from https://www.shadertoy.com/view/4ssSzj?fbclid=IwAR30x3mS95I396m4NfFqs1yQp1tyWy6xoU0xqjB4Ni9Cpj30oreEwfNos7E
const shaders = Shaders.create({
    background: {

        frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float time;
uniform vec3 colorA, colorB;
void main() {
    float n = time/5.0;
	float x = uv.x/4.0+n/12.0;
	float y = uv.y/4.0-sin(n/10.0);
	
	float plas=(y*32.0+n*1.5+sin(x*16.0+n*(0.7)-cos(y*22.0-n*1.5+sin(x*12.0+y*22.0+n*1.1-sin(x*32.0))+cos(x*32.0)+n)+cos(x*16.0-n*1.27)*2.0)*8.0-n+sin(x*2.0-n*1.0)*16.0);
	
	float final = abs(cos((plas+n-sin(y+n*2.0)*cos(x+n*0.2)*2.0)/28.0));
	vec3 finalColor = mix(colorA, colorB, final * 2. - 1.);
    gl_FragColor = vec4(finalColor, 1.0);
}
` }
});

class SimplePlasma extends Component {
    constructor(props){
        super(props);
        var date = new Date();
        
        this.state = {date: date, initTime: date.getTime()};
    }

    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000/30,
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        this.setState({
            date: new Date()
        });
    }

    render() {
        var time = (this.state.date.getTime() - this.state.initTime) / 1000;
        return <Node shader={shaders.background} uniforms={{
            time: time,
            colorA: colorHex2Vec3(this.props.colorA),
            colorB: colorHex2Vec3(this.props.colorB),
        }}
        />;
    }
}

export default class BackgroundGL extends Component {
    constructor(props) {
        super(props);
        this.state = { width: 0, height: 0 };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    render() {
        return (
            <Surface width={this.state.width} height={this.state.height}>
                <SimplePlasma colorA={this.props.colorA} colorB={this.props.colorB}/>
            </Surface>
        );
    }
}