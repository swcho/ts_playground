
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

import {mat4, vec2, vec3} from 'gl-matrix';
import {TweenMax, Bounce} from 'gsap';

import {
    WebGL,
    Object3D,
    Light,
    _vec2, _vec3, _vec4, _light,
    CameraType,
    GLObject,
    GLProgram,
    TransformMat,
} from '../webgl';
import * as objects from '../objects';

console.log(__filename);
console.log('Book of shader');

class Program extends GLProgram<{
    pos: vec3;
}, {
    u_mouse: vec2;
    u_resolution: vec2;
    u_time: number;
}> {

    private startTime = new Date().getTime();
    private mousePos = {
        clientX: 0,
        clientY: 0,
    };
    constructor(private elCanvas: HTMLCanvasElement, gl, frag) {
        super(gl, require('./default.vert'), frag, {pos: 3});
        const {
            top,
            left,
            right,
            bottom,
            height,
            width,
        } = elCanvas.getBoundingClientRect();
        elCanvas.onmousemove = (e) => {
            const {
                clientX,
                clientY,
            } = e;
            const mx = Math.round((clientX - left) / (right - left) * width);
            const my = Math.round((clientY - top) / (bottom - top) * height);
            this.mousePos = {
                clientX: mx, // clientX - left,
                clientY: height - my, // height - clientY - top,
            };
        };
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
        this.setUniformValue('u_time', (new Date().getTime() - this.startTime) / 1000);
        const {
            clientWidth,
            clientHeight,
        } = this.elCanvas;
        this.setUniformValue('u_resolution', _vec2(clientWidth, clientHeight));
        const {
            clientX,
            clientY,
        } = this.mousePos;
        this.setUniformValue('u_mouse', _vec2(clientX, clientY));
    }

    drawObject(transformMat: Readonly<TransformMat>, glObject: Readonly<GLObject>, wireframe: boolean) {
    }
}

function run(fragSource) {
    const elCanvas = document.getElementById('canvas-element-id') as HTMLCanvasElement;
    const webgl = new WebGL(elCanvas, CameraType.TRACKING);
    const program = new Program(elCanvas, webgl.getContext(), fragSource);
    webgl.setGlProgram(program);
    webgl.run({
    }, (state) => {
        webgl.drawProgram();
    }, true);
}

// run(require('./ch02/hello.frag'));
// run(require('./ch03/uniforms.frag'));
run(require('./ch03/gl_FragCoord.frag'));
