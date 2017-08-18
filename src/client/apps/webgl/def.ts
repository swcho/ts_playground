
import {mat4, vec3, vec4} from 'gl-matrix';

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
    ambiant?: number[];
    wireframe?: boolean;
    colors?: number[];
    position?: Pos3D;
    texture_coords?: number[];
}

export interface GLObject {
    readonly object: Object3D;
    vbo: WebGLBuffer;
    ibo: WebGLBuffer;
    iboLen: number;
    nbo?: WebGLBuffer;
    cbo?: WebGLBuffer;
    tbo?: WebGLBuffer;
    wireframe?: boolean;
    texture?: WebGLTexture;
}

export interface TransformMat {
    mvMatrix: mat4;
    pMatrix: mat4;
    nMatrix: mat4;
    cMatrix?: mat4;
}

export interface Light {
    position: vec3;
    ambient: vec4;
    diffuse: vec4;
    specular: vec4;
}

export function _vec3(x: number[]): vec3;
export function _vec3(x: number, y: number, z: number): vec3;
export function _vec3(x, y?, z?) {
    return x instanceof Array ? vec3.clone(x) : vec3.fromValues(x, y, z);
}

export function _vec4(x: number[]): vec4;
export function _vec4(x: number, y: number, z: number, w: number): vec4;
export function _vec4(x, y?, z?, w?): vec4 {
    return x instanceof Array ? vec4.clone(x) : vec4.fromValues(x, y, z, w);
}

export function _light(light?: Partial<Light>): Light  {
    return {
        position:   _vec3(0.0, 0.0, 0.0),
        ambient:    _vec4(0.0, 0.0, 0.0, 0.0),
        diffuse:    _vec4(0.0, 0.0, 0.0, 0.0),
        specular:   _vec4(0.0, 0.0, 0.0, 0.0),
        ...light,
    };
}
