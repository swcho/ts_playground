
import {calculateNormals} from './utils';
import {Object3D, GLObject} from './def';

export class Scene {

    private glObjects: GLObject[] = [];

    constructor(private context: WebGLRenderingContext) {
    }

    addObject(object: Object3D): GLObject {
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

        if (object.texture_coords) {
            const tbo = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, tbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.texture_coords), gl.STATIC_DRAW);
            glObject.tbo = tbo;
        }

        this.glObjects.push(glObject);
        return glObject;
    }

    getGlObjects() {
        return this.glObjects;
    }

}
