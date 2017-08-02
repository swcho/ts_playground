
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

import {mat4, vec3} from 'gl-matrix';

import {WebGL, Object, CameraType} from '../webgl';
import * as objects from '../objects';

const sphere = require('../sphere.json');

console.log(__filename);
console.log('WebGL Trials')

// ref: https://codepen.io/cantelope/pen/zzmORP

const elCanvas = document.getElementById('canvas-element-id') as HTMLCanvasElement;
const webgl = new WebGL(elCanvas, CameraType.TRACKING);
const home = vec3.create();
home.set([0.0, 2.0, 50.0])
webgl.setDefaultProgram(home);

// webgl.setObject('pos', objects.HALF_SQUARE);

webgl.addObject(objects.createFloor(60, 1));
webgl.addObject(objects.createAxis(20));
webgl.addObject(objects.CONE6);
webgl.addObject(sphere as Object);

const uLightPosition = [0, 120, 120];
const uLightAmbient = [0.20, 0.20, 0.20, 1.0];
const uLightDiffuse = [1.0, 1.0, 1.0, 1.0];

webgl.run({
    uLightPosition,
    uLightAmbient,
    uLightDiffuse,
}, (state) => {
    // webgl.updateMVMatrix(state.uMVMatrix);
    webgl.setUniformValues(state);
    // webgl.drawArea();
    webgl.drawObjects(false);
}, true);

// draw half rect
// apply color
// change frag

// ch5_SimpleAnimation.html
