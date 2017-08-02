
import {mat4} from 'gl-matrix';
import {Camera} from './camera';

export interface UniformMap {
    mvMatrix: string;
    pMatrix: string;
    nMatrix: string;
    cMatrix?: string;
}

type UniformLocationMap = { [prop in keyof UniformMap]: WebGLUniformLocation };

export class SceneTransform {

    private stack: mat4[] = [];
    private mvMatrix    = mat4.create();
    private pMatrix     = mat4.create();
    private nMatrix     = mat4.create();
    private cMatrix     = mat4.create();

    constructor(
        private elCanvas: HTMLCanvasElement,
        private context: WebGLRenderingContext,
        private program: WebGLProgram,
        private camera: Camera) {
    }

    private calculateModelView() {
        this.mvMatrix = this.camera.getMVTransform();
    }

    private calculateNormal() {
        mat4.identity(this.nMatrix);
        mat4.copy(this.nMatrix, this.mvMatrix);
        mat4.invert(this.nMatrix, this.nMatrix);
        mat4.transpose(this.nMatrix, this.nMatrix);
    }

    private calculatePerspective() {
        mat4.identity(this.pMatrix);
        mat4.perspective(this.pMatrix, 45, this.elCanvas.clientWidth / this.elCanvas.clientHeight, 0.1, 1000.0);
    }

    private update() {
        this.calculateModelView();
        this.calculatePerspective();
        this.calculateNormal();
    }

    private uniformLocationMap: UniformLocationMap;
    setUniformMap(uniformMap: UniformMap) {
        const gl = this.context;
        const program = this.program;
        this.uniformLocationMap = {} as any;
        for (const key of Object.keys(uniformMap)) {
            const name = uniformMap[key];
            const loc = gl.getUniformLocation(program, name);
            if (!loc) {
                console.error(`uniform ${name} not found`);
                return;
            }
            this.uniformLocationMap[key] = loc;
        }
    }

    updateUniforms() {
        this.update();
        const gl = this.context;
        const {
            mvMatrix,
            pMatrix,
            nMatrix,
            cMatrix,
        } = this.uniformLocationMap;
        gl.uniformMatrix4fv(mvMatrix, false, this.mvMatrix);
        gl.uniformMatrix4fv(pMatrix, false, this.pMatrix);
        gl.uniformMatrix4fv(nMatrix, false, this.nMatrix);
        if (cMatrix) {
            gl.uniformMatrix4fv(cMatrix, false, this.cMatrix);
        }
    }

    push() {
        const mvMatrix = mat4.create();
        mat4.copy(mvMatrix, this.mvMatrix);
        this.stack.push(mvMatrix);
    }

    pop() {
        if (this.stack.length === 0) return;
        this.mvMatrix = this.stack.pop();
    }
}
