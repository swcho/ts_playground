
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

import {mat4} from 'gl-matrix';

import {WebGL} from '../webgl';
import * as objects from '../objects';

console.log(__filename);
console.log('WebGL Trials')

// ref: https://codepen.io/cantelope/pen/zzmORP


const elCanvas = document.getElementById('canvas-element-id') as HTMLCanvasElement;
const {
    clientWidth,
    clientHeight,
} = elCanvas;

const webgl = new WebGL(elCanvas);
webgl.setProgram(require('./mvp.vert'), require('./macgann.frag'));
// webgl.setObject('pos', objects.HALF_SQUARE);
webgl.setAttributes([
    'pos',
]);

webgl.addObject(objects.createFloor(60, 1));
webgl.addObject(objects.createAxis(20));

const mModelView = mat4.create();
mat4.identity(mModelView);
mat4.translate(mModelView, mModelView, [2.0, 2.0, -5.0])
const mPerspective = mat4.create(); // The projection matrix
mat4.identity(mPerspective);
mat4.perspective(mPerspective, 45, clientWidth / clientHeight, 0.1, 10000.0);
webgl.run({
    time: 0,
    mouse: [200.0, 100.0],
    mModelView,
    mPerspective,
}, (state) => {
    state.time += 1;
    webgl.setUniformValues(state);
    // webgl.drawArea();
    webgl.drawObjects({
        vbo: 'pos'
    })
}, false);

// draw half rect
// apply color
// change frag
