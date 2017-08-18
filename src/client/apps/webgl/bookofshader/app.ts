
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
    GLObject,
    GLProgram,
    TransformMat,
} from '../webgl';
import * as objects from '../objects';

console.log(__filename);
console.log('Book of shader');

class Program extends GLProgram<{pos: vec3}, {}> {

    constructor(gl, frag) {
        super(gl, require('./default.vert'), frag, {pos: 3});
    }

    drawStart(transformMat: Readonly<TransformMat>) {
        this.setAttributeBuffers({
            pos: [
                -1, -1, 0,
                1, -1, 0,
                1, 1, 0,
                -1, -1, 0,
                -1, 1, 0,
                1, 1, 0,
            ]
        });
        const gl = this.gl;
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    drawObject(transformMat: Readonly<TransformMat>, glObject: Readonly<GLObject>, wireframe: boolean) {
    }
}

function run(fragSource) {
    const elCanvas = document.getElementById('canvas-element-id') as HTMLCanvasElement;
    const webgl = new WebGL(elCanvas, CameraType.TRACKING);
    const program = new Program(webgl.getContext(), fragSource);
    webgl.setGlProgram(program);
    webgl.run({
    }, (state) => {
        webgl.drawProgram();
    }, false);
}

run(require('./ch02/hello.frag'));
