
import {vec3, vec4, mat4} from 'gl-matrix';
import {GLObject, TransformMat, _vec4, Light} from '../../def'
import {GLProgram} from '../program';

interface AttributeSpec {
    aVertexPosition: vec3;
    aVertexNormal: vec3;
    aVertexColor: vec4;
}

interface UniformSpec {
    uMVMatrix: mat4;
    uPMatrix: mat4;
    uNMatrix: mat4;

    uLightSource: boolean;
    uLightAmbient: vec4;
    uLightPosition: vec3[];
    uLightDiffuse: vec4[];
    uCutoff: number;

    uMaterialDiffuse: vec4;
    uMaterialAmbient: vec4;

    uWireframe: boolean;

    uPerVertexColor: boolean;
}

interface ShaderParam {
    lenLights: number;
}

interface ShaderTemplateFunc<P> {
    (param: P):string;
}

type PhongShaderTempalte = ShaderTemplateFunc<ShaderParam>;

const parse = ({lenLights}: ShaderParam, source: string) => eval('`' + source + '`');

export class PhongProgram extends GLProgram<AttributeSpec, UniformSpec> {

    constructor(gl: WebGLRenderingContext, private lights: Light[]) {
        super(gl,
            parse({lenLights: lights.length}, require('./phong.vert')),
            parse({lenLights: lights.length}, require('./phong.frag')));
    }

    drawStart(transformMat: Readonly<TransformMat>) {
        if (transformMat.pMatrix) {
            this.setUniformValue('uPMatrix', transformMat.pMatrix);
        }
        this.setUniformValue('uLightPosition', this.lights.map(l => l.position));
        this.setUniformValue('uLightDiffuse', this.lights.map(l => l.diffuse));
    }

    drawObject(transformMat: Readonly<TransformMat>, glObject: Readonly<GLObject>, wireframe: boolean = false) {
        const gl = this.gl;
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
        // mat4.transpose(nMatrix, mvMatrix);
        mat4.transpose(nMatrix, nMatrix);

        this.setUniformValue('uLightSource', false);

        this.setUniformValue('uMVMatrix', mvMatrix);
        this.setUniformValue('uNMatrix', nMatrix);
        this.setUniformValue('uWireframe', !!glObject.object.wireframe);
        this.setUniformValue('uMaterialDiffuse', _vec4(glObject.object.diffuse || [1, 1, 1, 1]));
        this.setUniformValue('uMaterialAmbient', _vec4(glObject.object.ambiant || [1, 1, 1, 1]));

        this.setAttributeBuffers({
            aVertexPosition: glObject.vbo,
            aVertexNormal: glObject.nbo,
            aVertexColor: glObject.cbo
        });

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glObject.ibo);
        gl.drawElements(wireframe || glObject.wireframe ? gl.LINES : gl.TRIANGLES, glObject.iboLen, gl.UNSIGNED_SHORT, 0);
    }
}
