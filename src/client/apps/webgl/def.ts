
import {mat4} from 'gl-matrix';

export interface Pos3D {
    x: number;
    y: number;
    z: number;
}

export interface Object3D {
    vertices: number[];
    normals?: number[];
    indices: number[];
    diffuse?: number[];
    wireframe?: boolean;
    colors?: number[];
    position?: Pos3D;
}

export interface GLObject {
    readonly object: Object3D;
    vbo: WebGLBuffer;
    ibo: WebGLBuffer;
    iboLen: number;
    nbo?: WebGLBuffer;
    cbo?: WebGLBuffer;
    wireframe?: boolean;
}

export interface TransformMat {
    mvMatrix: mat4;
    pMatrix: mat4;
    nMatrix: mat4;
    cMatrix?: mat4;
}
