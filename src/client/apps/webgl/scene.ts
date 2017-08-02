
import {calculateNormals} from './utils';

export interface Position {
    x: number;
    y: number;
    z: number;
}

export interface Object {
    vertices: number[];
    normals?: number[];
    indices: number[];
    diffuse?: number[];
    wireframe?: boolean;
    colors?: number[];
    position?: Position;
}

export interface GLObject {
    object: Object;
    vbo: WebGLBuffer;
    ibo: WebGLBuffer;
    iboLen: number;
    nbo?: WebGLBuffer;
    cbo?: WebGLBuffer;
    wireframe?: boolean;
}

export class Scene {

    private glObjects: GLObject[] = [];

    constructor(private context: WebGLRenderingContext) {
    }

    addObject(object: Object) {
        const gl = this.context;

        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.vertices), gl.STATIC_DRAW);

        const nbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(calculateNormals(object.vertices, object.indices)), gl.STATIC_DRAW);

        const ibo  = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.indices), gl.STATIC_DRAW);

        const glObject: GLObject = {
            object,
            vbo,
            nbo,
            ibo,
            iboLen: object.indices.length,
            wireframe: object.wireframe,
        };

        if (object.colors) {
            const cbo = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.colors), gl.STATIC_DRAW);
            glObject.cbo = cbo;
        }

        this.glObjects.push(glObject);
    }

    getGlObjects() {
        return this.glObjects;
    }

}
