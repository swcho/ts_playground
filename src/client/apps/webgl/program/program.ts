
import {GLObject, TransformMat} from '../def';

type AttributeBuffers<A> = {
    [key in keyof A]: WebGLBuffer
};

type AttributeSize<A> = {
    [key in keyof A]: number
};

type AttributeLocations<A> = {
    [key in keyof A]: number
};

type UniformLocations<U> = {
    [key in keyof U]: number
};

const DEFAULT_VERTEX_SHADER = `
void main(void) {
    gl_Position = vec4(position, 1.0);
}
`;

export abstract class GLProgram<A, U> {

    protected program: WebGLProgram;
    private vertexShader: WebGLShader;
    private fragmentShader: WebGLShader;

    constructor(protected gl: WebGLRenderingContext, vertextSource: string, fragmentSource: string, private attributeSizes: AttributeSize<A>) {
        this.program = gl.createProgram();
        this.setVertexShader(vertextSource || DEFAULT_VERTEX_SHADER);
        this.setFragmentShader(fragmentSource);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
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
        const sizes = this.attributeSizes;
        const locations = this.attributeLocations;
        for (const key of Object.keys(locations)) {
            const loc = locations[key];
            const size = sizes[key];
            if (loc !== -1) {
                const buffer = buffers[key];
                if (buffer) {
                    if (buffer instanceof WebGLBuffer) {
                        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    } else {
                        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);
                    }
                    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(loc);
                } else {
                    gl.disableVertexAttribArray(loc);
                }
            }
        }
    }

    private uniformLocations: UniformLocations<U>;
    setUniformValue<K extends keyof U>(name: K, value: U[K], integer: boolean = false) {
        const gl = this.gl;
        const loc = gl.getUniformLocation(this.program, name as string);
        let len = value['length'];
        if (!loc) {
            console.error(`uniform ${name} not found`);
            return;
        }
        if (typeof len === 'undefined') {
            if (integer) {
                gl.uniform1i(loc, value as any);
            } else {
                gl.uniform1f(loc, value as any);
            }
        } else {
            if (value[0] && value[0].length) {
                const innerArrayLen = value[0].length;
                const floatArrayValue = new Float32Array(len * innerArrayLen);
                const arrayValue: Array<Float32Array> = value as any;
                for (let i = 0; i < len; i += 1) {
                    floatArrayValue.set(arrayValue[i], innerArrayLen * i);
                }
                len = value[0].length;
                value = floatArrayValue as any;
                // console.log('setUniformValue', name, len, floatArrayValue);
            }
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
