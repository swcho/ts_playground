
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

import {mat4, vec3} from 'gl-matrix';
import {TweenMax, Bounce} from 'gsap';

import {WebGL, Object, CameraType} from '../webgl';
import * as objects from '../objects';


console.log(__filename);
console.log('WebGL Trials')

// ref: https://codepen.io/cantelope/pen/zzmORP

const elCanvas = document.getElementById('canvas-element-id') as HTMLCanvasElement;
const webgl = new WebGL(elCanvas, CameraType.TRACKING);

// webgl.setObject('pos', objects.HALF_SQUARE);
webgl.addObject(objects.createFloor(60, 1));
webgl.addObject(objects.createAxis(20));

// const objCone = objects.CONE6;
// objCone.position = {
//     x: 0,
//     y: 0,
//     z: 0,
// };
// TweenMax.to(objCone.position, 1, {
//     ...{x: 20} as any,
//     ease: Bounce,
//     yoyo: true,
//     repeat: -1,
// });
// webgl.addObject(objCone);

// const sphere: Object = require('../sphere.json');
// sphere.position = {
//     x: 0,
//     y: 0,
//     z: 0,
// };
// TweenMax.to(sphere.position, 1, {
//     ...{z: 20} as any,
//     ease: Bounce,
//     yoyo: true,
//     repeat: -1,
// });
// webgl.addObject(sphere as Object);

// Cube
// webgl.addObject(require('../complexcube.json'));

// Balls
const BALL = require('../ball.json');
for (let i = 0; i<10; i += 1) {

}

const home = vec3.create();
home.set([0.0, 0.0, 5.0])
webgl.setDefaultProgram(home, 45, -30);
const uLightPosition = [-5, 5, 5];
const uLightAmbient = [1.0, 1.0, 1.0, 1.0];
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
