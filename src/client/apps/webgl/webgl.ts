
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

    setProgram(vertextSource: string, fragmentSource: string) {
        this.setVertexShader(vertextSource);
        this.setFragmentShader(fragmentSource);
        this.context.linkProgram(this.program);
        this.context.useProgram(this.program);
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

    setUniformValue(name: string, value) {
        const loc = this.context.getUniformLocation(this.program, name);
        const len = value['length'];
        console.log('setUniformValue', name, len);
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

    draw() {
        const {
            indexSupplied,
            length
        } = this.drawParam;
        if (indexSupplied) {
            this.context.drawElements(this.context.LINES, length, this.context.UNSIGNED_SHORT, 0);
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
