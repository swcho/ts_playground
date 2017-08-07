
import {vec3, vec4} from 'gl-matrix';
import {GLObject, TransformMat} from '../def'

type AttributeBuffers<A> = {
    [key in keyof A]: WebGLBuffer
};

type AttributeLocations<A> = {
    [key in keyof A]: number
};

type UniformLocations<U> = {
    [key in keyof U]: number
};

export abstract class GLProgram<A, U> {

    protected program: WebGLProgram;
    private vertexShader: WebGLShader;
    private fragmentShader: WebGLShader;

    constructor(protected gl: WebGLRenderingContext, vertextSource: string, fragmentSource: string) {
        this.program = gl.createProgram();
        this.setVertexShader(vertextSource);
        this.setFragmentShader(fragmentSource);

        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
    }

    private createShader(type: number, source: string) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            const compileLog = gl.getShaderInfoLog(shader);
            console.error('shader log', compileLog);
        }
        gl.attachShader(this.program, shader);
        return shader;
    }

    private setVertexShader(source: string) {
        const gl = this.gl;
        if (this.vertexShader) {
            gl.detachShader(this.program, this.vertexShader);
        }
        this.vertexShader = this.createShader(gl.VERTEX_SHADER, source);
    }

    private setFragmentShader(source: string) {
        const gl = this.gl;
        if (this.fragmentShader) {
            gl.detachShader(this.program, this.fragmentShader);
        }
        this.fragmentShader = this.createShader(gl.FRAGMENT_SHADER, source);
    }

    getProgram() {
        return this.program;
    }

    private attributeLocations: AttributeLocations<A>;
    setAttributeBuffers(buffers: AttributeBuffers<A>) {
        const gl = this.gl;
        const prog = this.program;
        if (!this.attributeLocations) {
            const locations = {};
            for (const key of Object.keys(buffers)) {
                locations[key] = gl.getAttribLocation(prog, key);
            }
            this.attributeLocations = locations as any;
        }
        const locations = this.attributeLocations;
        for (const key of Object.keys(locations)) {
            const loc = locations[key];
            if (loc !== -1) {
                const buffer = buffers[key];
                if (buffer) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(loc);
                } else {
                    gl.disableVertexAttribArray(loc);
                }
            }
        }
    }

    private uniformLocations: UniformLocations<U>;
    setUniformValue<K extends keyof U>(name: K, value: U[K]) {
        const gl = this.gl;
        const loc = gl.getUniformLocation(this.program, name);
        const len = value['length'];
        if (!loc) {
            console.error(`uniform ${name} not found`);
            return;
        }
        if (typeof len === 'undefined') {
            gl.uniform1f(loc, value as any);
        } else {
            if (len === 2) {
                gl.uniform2fv(loc, value as any);
            } else if (len === 3) {
                gl.uniform3fv(loc, value as any);
            } else if (len === 4) {
                gl.uniform4fv(loc, value as any);
            } else if (len === 16) {
                gl.uniformMatrix4fv(loc, false, value as any);
            } else {
                console.error(`coundn't configure uniform ${name} with len ${len}`);
            }
        }
    }


    abstract drawStart(transformMat: Readonly<TransformMat>);

    abstract drawObject(transformMat: Readonly<TransformMat>, glObject: Readonly<GLObject>, wireframe: boolean);
}
