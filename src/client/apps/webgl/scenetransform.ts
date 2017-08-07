
import {TransformMat} from './def';
import {mat4, vec3} from 'gl-matrix';
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

    private transformMat: TransformMat = {
        mvMatrix: mat4.create(),
        nMatrix: mat4.create(),
        pMatrix: mat4.create(),
    };

    constructor(
        private elCanvas: HTMLCanvasElement,
        private context: WebGLRenderingContext,
        private camera: Camera) {
    }

    getTransformMat(): Readonly<TransformMat> {
        const {
            mvMatrix,
            nMatrix,
            pMatrix,
        } = this.transformMat;
        const cameraMetrix = this.camera.getMatrix();
        mat4.invert(mvMatrix, cameraMetrix);
        mat4.transpose(nMatrix, cameraMetrix);
        mat4.perspective(pMatrix, 45, this.elCanvas.clientWidth / this.elCanvas.clientHeight, 0.1, 1000.0);
        return this.transformMat;
    }

}
