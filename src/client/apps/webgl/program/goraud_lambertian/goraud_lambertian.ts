
import {vec3, vec4, mat4} from 'gl-matrix';
import {GLObject, TransformMat} from '../../def'
import {GLProgram} from '../program';

interface LambertainAttributeSpec {
    aVertexPosition: vec3;
    aVertexNormal: vec3;
    aVertexColor: vec4;
}

interface LambertainUniformSpec {
    uMVMatrix: mat4;
    uPMatrix: mat4;
    uNMatrix: mat4;

    uLightPosition: vec3 | number[];
    uLightDiffuse: vec4 | number[];

    uMaterialDiffuse: vec4 | number[];

    uWireframe: boolean;
    uPerVertexColor: boolean;
}

export class GoraudLambertian extends GLProgram<LambertainAttributeSpec, LambertainUniformSpec> {

    constructor(gl: WebGLRenderingContext) {
        super(gl, require('./goraud_lambertian.vert'), require('./goraud_lambertian.frag'));
    }

    drawStart(transformMat: Readonly<TransformMat>) {
        this.setUniformValue('uPMatrix', transformMat.pMatrix);
    }

    drawObject(transformMat: Readonly<TransformMat>, glObject: Readonly<GLObject>, wireframe: boolean = false) {
        const gl = this.gl;
        this.setAttributeBuffers({
            aVertexPosition: glObject.vbo,
            aVertexNormal: glObject.nbo,
            aVertexColor: glObject.cbo
        });

        const mvMatrix = mat4.create();
        const nMatrix = mat4.create();
        if (glObject.object.position) {
            const {x, y, z} = glObject.object.position;
            const pos = vec3.create();
            vec3.set(pos, x, y, z);
            mat4.translate(mvMatrix, transformMat.mvMatrix, pos);
        } else {
            mat4.copy(mvMatrix, transformMat.mvMatrix);
        }

        // TODO: Move to vertex shader
        mat4.invert(nMatrix, mvMatrix);
        mat4.transpose(nMatrix, nMatrix);

        this.setUniformValue('uMVMatrix', mvMatrix);
        this.setUniformValue('uNMatrix', nMatrix);
        this.setUniformValue('uPerVertexColor', !!glObject.cbo)
        this.setUniformValue('uWireframe', !!glObject.object.wireframe);
        this.setUniformValue('uMaterialDiffuse', glObject.object.diffuse || [1, 1, 1, 1]);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glObject.ibo);
        gl.drawElements(wireframe || glObject.wireframe ? gl.LINES : gl.TRIANGLES, glObject.iboLen, gl.UNSIGNED_SHORT, 0);
    }
}
