
export interface Object {
    vertices: number[];
    indices: number[];
    diffuse?: number[];
    wireframe?: boolean;
    colors?: number[];
}

interface GLObject {
    vbo: WebGLBuffer;
    ibo: WebGLBuffer;
    iboLen: number;
    nbo?: WebGLBuffer;
    cbo?: WebGLBuffer;
    wireframe?: boolean;
}

interface DrawParam {
    indexSupplied: boolean;
    length: number;
}

export class WebGL {

    private context: WebGLRenderingContext;
    private program: WebGLProgram;
    private vertexShader: WebGLShader;
    private fragmentShader: WebGLShader;

    constructor(private elCanvas?: HTMLCanvasElement) {
        elCanvas = elCanvas || document.createElement('canvas');
        this.context = elCanvas.getContext('webgl');
        const {
            clientWidth,
            clientHeight,
        } = this.elCanvas;
        this.context.viewport(0, 0, clientWidth, clientHeight);
        this.program = this.context.createProgram();

    }

    private createShader(type: number, source: string) {
        const shader = this.context.createShader(type);
        this.context.shaderSource(shader, source);
        this.context.compileShader(shader);
        this.context.attachShader(this.program, shader);
        return shader;
    }

    private setVertexShader(source: string) {
        if (this.vertexShader) {
            this.context.detachShader(this.program, this.vertexShader);
        }
        this.vertexShader = this.createShader(this.context.VERTEX_SHADER, source);
    }

    private setFragmentShader(source: string) {
        if (this.fragmentShader) {
            this.context.detachShader(this.program, this.fragmentShader);
        }
        this.fragmentShader = this.createShader(this.context.FRAGMENT_SHADER, source);
    }

    setProgram<T>(vertextSource: string, fragmentSource: string) {
        const gl = this.context;
        this.setVertexShader(vertextSource);
        this.setFragmentShader(fragmentSource);
        gl.linkProgram(this.program);
        gl.useProgram(this.program);
    }

    private attrs: { [name: string]: number } = {};
    setAttributes(attrs: string[]) {
        const gl = this.context;
        for (const attr of attrs) {
            this.attrs[attr] = gl.getAttribLocation(this.program, attr);
        }
    }

    private drawParam: DrawParam;
    setVertexAttribute(name: string, vbo: number[], vio?: number[]) {
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.context.createBuffer());
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(vbo), this.context.STATIC_DRAW);
        var attr = this.context.getAttribLocation(this.program, name);
        this.context.enableVertexAttribArray(attr);
        this.context.vertexAttribPointer(attr, 3, this.context.FLOAT, false, 0, 0);
        const hasVio = !!vio;
        if (hasVio) {
            this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, this.context.createBuffer());
            this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER, new Uint16Array(vio), this.context.STATIC_DRAW);
            // this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, null);
        }
        this.drawParam = {
            indexSupplied: hasVio,
            length: hasVio ? vio.length : vbo.length / 3,
        }
    }

    setObject(name: string, object: number[][]) {
        this.setVertexAttribute(name, object[0], object[1]);
    }

    private glObjects: GLObject[] = [];
    addObject(object: Object) {
        const gl = this.context;
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.vertices), gl.STATIC_DRAW);

        const ibo  = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.indices), gl.STATIC_DRAW);

        const glObject: GLObject = {
            vbo,
            ibo,
            iboLen: object.indices.length,
            wireframe: object.wireframe,
        }

        if (object.colors) {
            const cbo = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.colors), gl.STATIC_DRAW);
            glObject.cbo = cbo;
        }

        this.glObjects.push(glObject);
    }

    drawObjects(attrName: {
        vbo: string;
        nbo?: string;
        cbo?: string;
    }) {
        const gl = this.context;
        const attrs = this.attrs;
        const attrVbo = attrs[attrName.vbo];
        const attrNbo = attrs[attrName.nbo];
        const attrCbo = attrs[attrName.cbo];

        for (const obj of this.glObjects) {
            // gl.enableVertexAttribArray(attrs[attrName.vbo]);
            // attrName.nbo && gl.disableVertexAttribArray(attrs[attrName.nbo]);
            // attrName.cbo && gl.disableVertexAttribArray(attrs[attrName.cbo]);

            gl.bindBuffer(gl.ARRAY_BUFFER, obj.vbo);
            gl.vertexAttribPointer(attrVbo, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(attrVbo);

            if (attrNbo) {
                if (!obj.wireframe && obj.nbo) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, obj.nbo);
                    gl.vertexAttribPointer(attrNbo, 3, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(attrNbo);
                } else {
                    gl.disableVertexAttribArray(attrNbo);
                }
            }

            if (attrCbo) {
                if (obj.cbo) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, obj.cbo);
                    gl.vertexAttribPointer(attrCbo, 4, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(attrCbo);
                } else {
                    gl.disableVertexAttribArray(attrCbo);
                }
            }

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibo);
            gl.drawElements(obj.wireframe ? gl.LINES : gl.TRIANGLES, obj.iboLen, gl.UNSIGNED_SHORT, 0);
        }
    }

    setUniformValue(name: string, value) {
        const loc = this.context.getUniformLocation(this.program, name);
        const len = value['length'];
        // console.log('setUniformValue', name, len);
        if (typeof len === 'undefined') {
            this.context.uniform1f(loc, value);
        } else {
            if (len === 2) {
                this.context.uniform2fv(loc, value);
            } else if (len === 16) {
                this.context.uniformMatrix4fv(loc, false, value);
            }
        }
    }

    setUniformValues(obj) {
        Object.keys(obj).forEach(key => this.setUniformValue(key, obj[key]));
    }

    drawLine() {
        const {
            indexSupplied,
            length
        } = this.drawParam;
        if (indexSupplied) {
            this.context.drawElements(this.context.LINE_LOOP, length, this.context.UNSIGNED_SHORT, 0);
        } else {
            this.context.drawArrays(this.context.TRIANGLES, 0, length);
        }
    }

    drawArea() {
        const {
            indexSupplied,
            length
        } = this.drawParam;
        if (indexSupplied) {
            this.context.drawElements(this.context.TRIANGLES, length, this.context.UNSIGNED_SHORT, 0);
        } else {
            this.context.drawArrays(this.context.TRIANGLES, 0, length);
        }
    }

    private canvasResize() {
        const canvas = this.elCanvas;
        // Lookup the size the browser is displaying the canvas.
        var displayWidth  = canvas.clientWidth;
        var displayHeight = canvas.clientHeight;

        // Check if the canvas is not the same size.
        if (canvas.width  != displayWidth ||
            canvas.height != displayHeight) {

            // Make the canvas the same size
            canvas.width  = displayWidth;
            canvas.height = displayHeight;
        }
    }

    run<T>(state: T, render: (this: WebGL, state: T) => void, loop: boolean = false) {
        const frame = () => {
            this.canvasResize();
            this.context.viewport(0, 0, this.elCanvas.clientWidth, this.elCanvas.clientHeight);
            render.call(this, state);
            if (loop) {
                requestAnimationFrame(frame);
            }
        }
        frame();
    }

}
