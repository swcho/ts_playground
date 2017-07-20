
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

import {mat4} from 'gl-matrix';
import * as utils from './utils';

console.log(__filename);
console.log('WebGL Trials')

// ref: https://codepen.io/cantelope/pen/zzmORP

class WebGL {

    private context: WebGLRenderingContext;
    private program: WebGLProgram;
    private vertexShader: WebGLShader;
    private fragmentShader: WebGLShader;

    constructor(private elCanvas?: HTMLCanvasElement) {
        elCanvas = elCanvas || document.createElement('canvas');
        this.context = elCanvas.getContext('webgl');
        this.context.viewport(0, 0, elCanvas.width, elCanvas.height);
        this.program = this.context.createProgram();
    }

    private createShader(type: number, source: string) {
        const shader = this.context.createShader(type);
        this.context.shaderSource(shader, source);
        this.context.compileShader(shader);
        this.context.attachShader(this.program, shader);
        return shader;
    }

    private setVertexShader(source: string) {
        if (this.vertexShader) {
            this.context.detachShader(this.program, this.vertexShader);
        }
        this.vertexShader = this.createShader(this.context.VERTEX_SHADER, source);
    }

    private setFragmentShader(source: string) {
        if (this.fragmentShader) {
            this.context.detachShader(this.program, this.fragmentShader);
        }
        this.fragmentShader = this.createShader(this.context.FRAGMENT_SHADER, source);
    }

    setProgram(vertextSource: string, fragmentSource: string) {
        this.setVertexShader(vertextSource);
        this.setFragmentShader(fragmentSource);
        this.context.linkProgram(this.program);
        this.context.useProgram(this.program);
    }

    setFloatValue(attr_name: string, rsize: number, arr: number[]) {
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.context.createBuffer());
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(arr), this.context.STATIC_DRAW);
        var attr = this.context.getAttribLocation(this.program, attr_name);
        this.context.enableVertexAttribArray(attr);
        this.context.vertexAttribPointer(attr, rsize, this.context.FLOAT, false, 0, 0);
    }

    setUniformValue(name: string, value: number | number[]) {
        const loc = this.context.getUniformLocation(this.program, "time");
        if (Array.isArray(value)) {
            if (value.length === 2) {
                this.context.uniform2f(loc, value[0], value[1]);
            }
        } else {
            this.context.uniform1f(loc, value);
        }
    }

    setUniformValues(obj) {
        Object.keys(obj).forEach(key => this.setUniformValue(key, obj[key]));
    }

    drawArray() {
        this.context.drawArrays(this.context.TRIANGLES, 0, 6);
    }

    frame = () => {

    }

    run<T>(state: T, render: (this: WebGL, state: T) => void, loop: boolean = false) {
        const frame = () => {
            render.call(this, state);
            if (loop) {
                requestAnimationFrame(frame);
            }
        }
        frame();
    }

}

const webgl = new WebGL(document.getElementById('canvas-element-id') as HTMLCanvasElement);
webgl.setProgram(require('./vertex.glsl'), require('./fragment.glsl'));
// webgl.setFloatValue("rect", 3, [
//     -0.5,0.5,0.0, 	//Vertex 0
//     -0.5,-0.5,0.0, 	//Vertex 1
//     0.5,-0.5,0.0, 	//Vertex 2
//     0.5,0.5,0.0 	//Vertex 3
// ]);
webgl.setFloatValue("pos", 3, [
    -1, -1, 0,
    1, -1, 0,
    1, 1, 0,
    -1, -1, 0,
    -1, 1, 0,
    1, 1, 0,
]);

webgl.run({
    frameNo: 0,
    mouse: [0, 0],
}, (state) => {
    state.frameNo += 1;
    webgl.setUniformValues(state);
    webgl.drawArray();
}, true);
