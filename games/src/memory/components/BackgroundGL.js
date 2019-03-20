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

let plasma1 = `
precision highp float;
varying vec2 uv;
uniform float time;
uniform vec3 colorA, colorB;
uniform vec2 iResolution;

vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
    float n = time/10.0;
	float x = uv.x/4.0+n/12.0;
	float y = uv.y/4.0-sin(n/10.0);
	
	float plas=(y*32.0+n*1.5+sin(x*16.0+n*(0.7)-cos(y*22.0-n*1.5+sin(x*12.0+y*22.0+n*1.1-sin(x*32.0))+cos(x*32.0)+n)+cos(x*16.0-n*1.27)*2.0)*8.0-n+sin(x*2.0-n*1.0)*16.0);
	
	float final = abs(cos((plas+n-sin(y+n*2.0)*cos(x+n*0.2)*2.0)/28.0));
	float t = final;// * 2.0 - 1.0;
	vec3 col = pal( t, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,0.7,0.4),vec3(0.0,0.15,0.20) );
	//vec3 col = pal(t ,vec3(0.55),vec3(0.8),vec3(0.29),vec3(0.00,0.05,0.15) + 0.54 );
	
	float dist = distance(uv, vec2(0.5)) * 1.0;
	col *= 1.3 - dist;
	
	/* not supported yet
    col *= vec3(1, .7, .4) 
        *  pow(max(normalize(vec3(length(dFdx(col)), length(dFdy(col)), .5/iResolution.y)).z, 0.), 2.)
        + .75; 
    */
	
    gl_FragColor = vec4(col, 1.0);
}
`;

let plasma2 = `
precision highp float;
varying vec2 uv;
uniform float time;
uniform vec3 colorA, colorB;
uniform vec2 iResolution;

#define N 3

vec4 plasma(vec2 u)
{
  vec2 p = u;
  float t = time * 2.4;
  float r = 0.0;
	float a = atan(p.x,p.y)*4.;
  for ( int i = 0; i < N; i++ )
  {
    float d = 3.14159265 * float(i) * 5.0 / float(N);
    r = length(p) + 0.01;
    a = atan(p.x,p.y)*4.;
    float xx = p.x;
    p.x += cos(p.y+sin(r*1.3+time) + d + r ) + cos(t*2.+a+r);
    p.y -= sin(xx +cos(r*2.3+a) - d + r + time*2.) + sin(t-r*2.);
    //p.x += cos(p.y+sin(r*1.3+time) + d + r ) + cos(t*2.+r);
    //p.y -= sin(xx +cos(r*2.3+a) - d + r + time*2.) + sin(t-r*2.);
  }
  //return vec4(cos(r*0.5), cos(r*1.9), cos(r*2.0), 1.0);
	r/=35.;
	r=1.-r;
	return vec4(r, r*r, 0.7-r, 1.0);
}

void main( void ) 
{
  vec2 UV = (uv.xy - resolution.xy / 2.0) / resolution.yy * 40.0;
  gl_FragColor = plasma (uv);
}`;

// from https://www.shadertoy.com/view/4ssSzj?fbclid=IwAR30x3mS95I396m4NfFqs1yQp1tyWy6xoU0xqjB4Ni9Cpj30oreEwfNos7E
const shaders = Shaders.create({
    background: {

        frag: `
precision highp float;
varying vec2 uv;
uniform float time;
uniform vec3 colorA, colorB;
uniform vec2 iResolution;

vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
    float n = time/10.0;
	float x = uv.x/4.0+n/12.0;
	float y = uv.y/4.0-sin(n/10.0);
	
	float plas=(y*32.0+n*1.5+sin(x*16.0+n*(0.7)-cos(y*22.0-n*1.5+sin(x*12.0+y*22.0+n*1.1-sin(x*32.0))+cos(x*32.0)+n)+cos(x*16.0-n*1.27)*2.0)*8.0-n+sin(x*2.0-n*1.0)*16.0);
	
	float final = abs(cos((plas+n-sin(y+n*2.0)*cos(x+n*0.2)*2.0)/28.0));
	float t = final;// * 2.0 - 1.0;
	vec3 col = pal( t, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,0.7,0.4),vec3(0.0,0.15,0.20) );
	//vec3 col = pal(t ,vec3(0.55),vec3(0.8),vec3(0.29),vec3(0.00,0.05,0.15) + 0.54 );
	
	float dist = distance(uv, vec2(0.5)) * 1.0;
	col *= 1.3 - dist;
	
	/* not supported yet
    col *= vec3(1, .7, .4) 
        *  pow(max(normalize(vec3(length(dFdx(col)), length(dFdy(col)), .5/iResolution.y)).z, 0.), 2.)
        + .75; 
    */
	
    gl_FragColor = vec4(col, 1.0);
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
            //colorA: colorHex2Vec3(this.props.colorA),
            //colorB: colorHex2Vec3(this.props.colorB),
            //iResolution: [this.props.width, this.props.height]
        }}
        />;
    }
}

export default class BackgroundGL extends Component {
    constructor(props) {
        super(props);
        this.state = { width: 0, height: 0 };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.surfaceRef = React.createRef();
        this.preload = this.preload.bind(this);

    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    preload() {
        console.log(this.surfaceRef.current);
        const gl = this.surfaceRef.glView.canvas.getContext('webgl');
        console.log(gl.getExtension('OES_standard_derivatives'));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        var docElem = document.documentElement;
        this.setState({ width: docElem.clientWidth, height: docElem.clientHeight });
    }

    render() {
        return (
            <Surface
                width={this.state.width}
                height={this.state.height}
                ref={this.surfaceRef}
            >
                <SimplePlasma
                    surface={this.surfaceRef}
                    colorA={this.props.colorA}
                    colorB={this.props.colorB}
                    width={this.state.width}
                    height={this.state.height}
                />
            </Surface>
        );
    }
}