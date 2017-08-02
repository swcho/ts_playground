
import {mat4, vec3, vec4} from 'gl-matrix';
import {Camera, CameraType} from './camera';
import {CameraInteractor} from './camerainteractor';
import {Scene, Object, GLObject} from './scene';
import {SceneTransform} from './scenetransform';

export {
    CameraType,
    Camera,
    Object,
};

interface DrawParam {
    indexSupplied: boolean;
    length: number;
}

interface AttributeMap {
    vbo: number;
    nbo?: number;
    cbo?: number;
}

type AttributeNameMap = {
    [P in keyof AttributeMap]: string;
}

const ROTATION_UNIT = Math.PI/80;

export class WebGL {

    private context: WebGLRenderingContext;
    private program: WebGLProgram;
    private vertexShader: WebGLShader;
    private fragmentShader: WebGLShader;
    private camera: Camera;
    private cameraInteractor: CameraInteractor;
    private scene: Scene;
    private sceneTransform: SceneTransform;

    constructor(
            private elCanvas: HTMLCanvasElement,
            cameraType: CameraType = CameraType.TRACKING) {
        elCanvas = elCanvas || document.createElement('canvas');
        this.context = elCanvas.getContext('webgl');
        const {
            clientWidth,
            clientHeight,
        } = this.elCanvas;
        this.context.viewport(0, 0, clientWidth, clientHeight);
        this.program = this.context.createProgram();
        this.camera = new Camera(cameraType);
        this.cameraInteractor = new CameraInteractor(this.camera, elCanvas);
        this.scene = new Scene(this.context);
        this.sceneTransform = new SceneTransform(this.elCanvas, this.context, this.program, this.camera);
    }

    private createShader(type: number, source: string) {
        const gl = this.context;
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
        const gl = this.context;
        const program = this.program;
        this.setVertexShader(vertextSource);
        this.setFragmentShader(fragmentSource);
        gl.linkProgram(program);
        gl.useProgram(program);
    }

    setDefaultProgram(cameraPosition: vec3) {
        this.camera.setPosition(cameraPosition);
        this.setProgram(require('./default.vert'), require('./default.frag'));
        this.setAttributeMap({
            vbo: 'aVertexPosition',
            nbo: 'aVertexNormal',
            cbo: 'aVertexColor',
        });
        this.sceneTransform.setUniformMap({
            mvMatrix: 'uMVMatrix',
            pMatrix: 'uPMatrix',
            nMatrix: 'uNMatrix',
        });
    }

    private attributeMap: AttributeMap;
    setAttributeMap(attrNameMap: AttributeNameMap) {
        const gl = this.context;
        const prog = this.program;
        const attributeMap: AttributeMap = {} as any;
        Object.keys(attrNameMap).forEach(type => {
            const attrName = attrNameMap[type];
            attributeMap[type] = gl.getAttribLocation(prog, attrName);
            if (attributeMap[type] === -1) {
                console.error(`attribute "${attrName}" not found for ${type}`)
            }
        });
        this.attributeMap = attributeMap;
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

    addObject(object: Object) {
        this.scene.addObject(object);
    }

    drawObjects(wireframe?: boolean) {
        const gl = this.context;
        const attrVbo = this.attributeMap.vbo;
        const attrNbo = this.attributeMap.nbo;
        const attrCbo = this.attributeMap.cbo;

        this.sceneTransform.updateUniforms();

        for (const glObject of this.scene.getGlObjects()) {
            gl.bindBuffer(gl.ARRAY_BUFFER, glObject.vbo);
            gl.vertexAttribPointer(attrVbo, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(attrVbo);

            if (attrNbo !== -1) {
                if (!glObject.wireframe && glObject.nbo) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, glObject.nbo);
                    gl.vertexAttribPointer(attrNbo, 3, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(attrNbo);
                } else {
                    gl.disableVertexAttribArray(attrNbo);
                }
            }

            if (attrCbo !== -1) {
                if (glObject.cbo) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, glObject.cbo);
                    gl.vertexAttribPointer(attrCbo, 4, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(attrCbo);
                } else {
                    gl.disableVertexAttribArray(attrCbo);
                }

                // TODO: Find a way to be configurable
                this.setUniformValue('uPerVertexColor', true);
            } else {
                this.setUniformValue('uPerVertexColor', false);
            }

            this.setUniformValue('uWireframe', !!glObject.object.wireframe);

            if (glObject.object.diffuse) {
                // TODO: Fix to be configurable
                this.setUniformValue('uMaterialDiffuse', glObject.object.diffuse);
            }

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glObject.ibo);
            gl.drawElements(wireframe || glObject.wireframe ? gl.LINES : gl.TRIANGLES, glObject.iboLen, gl.UNSIGNED_SHORT, 0);
        }
    }

    setUniformValue(name: string, value) {
        const gl = this.context;
        const loc = gl.getUniformLocation(this.program, name);
        const len = value['length'];
        if (!loc) {
            console.error(`uniform ${name} not found`);
            return;
        }
        if (typeof len === 'undefined') {
            gl.uniform1f(loc, value);
        } else {
            if (len === 2) {
                gl.uniform2fv(loc, value);
            } else if (len === 3) {
                gl.uniform3fv(loc, value);
            } else if (len === 4) {
                gl.uniform4fv(loc, value);
            } else if (len === 16) {
                gl.uniformMatrix4fv(loc, false, value);
            } else {
                console.error(`coundn't configure uniform ${name} with len ${len}`);
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
