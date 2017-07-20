
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

import {mat4} from 'gl-matrix';

import {WebGL} from '../webgl';
import {SPHERE, HALF_SQUARE, SQUARE, CONE} from '../objects';

console.log(__filename);
console.log('WebGL Trials')

// ref: https://codepen.io/cantelope/pen/zzmORP


const elCanvas = document.getElementById('canvas-element-id') as HTMLCanvasElement;
const {
    clientWidth,
    clientHeight,
} = elCanvas;

const webgl = new WebGL(elCanvas);
webgl.setProgram(require('./vertex.glsl'), require('./fragment.glsl'));

webgl.setObject('pos', SPHERE);
// webgl.setObject('pos', HALF_SQUARE);
// webgl.setObject("pos", SQUARE);
// webgl.setObject("pos", CONE);

const perspective = mat4.create(); // The projection matrix
mat4.perspective(perspective, 45, clientWidth / clientHeight, 0.1, 10000.0);
webgl.run({
    time: 0,
    mouse: [200.0, 100.0],
    perspective,
}, (state) => {
    state.time += 1;
    webgl.setUniformValues(state);
    webgl.draw();
}, false);
