
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

import {mat4, vec3} from 'gl-matrix';
import {TweenMax, Bounce} from 'gsap';

import {
    WebGL,
    Object3D,
    Light,
    _vec3, _vec4, _light,
    CameraType,
    GoraudLambertian,
    PhongProgram,
} from '../webgl';
import * as objects from '../objects';


console.log(__filename);
console.log('WebGL Trials')

// ref: https://codepen.io/cantelope/pen/zzmORP

const elCanvas = document.getElementById('canvas-element-id') as HTMLCanvasElement;
const webgl = new WebGL(elCanvas, CameraType.TRACKING);

function exLambertain() {
    const goroudLambertian = new GoraudLambertian(webgl.getContext());
    webgl.setGlProgram(goroudLambertian);
    goroudLambertian.setUniformValue('uLightPosition', [-5, 5, 5]);
    goroudLambertian.setUniformValue('uLightDiffuse', [1.0, 1.0, 1.0, 1.0]);

    const home = vec3.create();
    home.set([0.0, 0.0, 5.0])
    webgl.setCamera(home, 45, -30);

    webgl.addObject(objects.createFloor(60, 1));
    webgl.addObject(objects.createAxis(20));
    webgl.addObject(require('../models/complexcube.json'));
}


function ch06_Wall_Initial() {
    const lights: Light[] = [
        _light({
            position: _vec3(0, 7, 3),
            diffuse: _vec4(1.0, 0.0, 0.0, 1.0),
        }),
        _light({
            position: _vec3(2.5, 3, 3),
            diffuse: _vec4(0.0, 1.0, 0.0, 1.0),
        })
    ]
    const program = new PhongProgram(webgl.getContext(), lights.length);
    webgl.setGlProgram(program);
    program.setUniformValue('uCutoff', 0.4);
    program.setUniformValue('uLightPosition', lights.map(l => l.position));
    program.setUniformValue('uLightDiffuse', lights.map(l => l.diffuse));
    webgl.setCamera(_vec3(0, 5, 30), 0, -3);
    webgl.addObject(objects.createFloor(80, 2));
    webgl.addObject(require('../models/wall.json'));
    webgl.addObject(require('../models/smallsph.json'));
}

ch06_Wall_Initial();

webgl.run({
}, (state) => {
    webgl.drawProgram();
}, true);

// webgl.setObject('pos', objects.HALF_SQUARE);

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

// Balls
// const BALL = require('../ball.json');
// for (let i = 0; i<10; i += 1) {

// }



// draw half rect
// apply color
// change frag

// ch5_SimpleAnimation.html
