
import {mat4, vec3, vec4} from 'gl-matrix';
import {Object3D, GLObject} from './def';
import {Camera, CameraType} from './camera';
import {CameraInteractor} from './camerainteractor';
import {Scene} from './scene';
import {SceneTransform} from './scenetransform';
import {GLProgram} from './program';

export * from './def';
export * from './program';
export {
    CameraType,
    Camera,
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
        this.camera = new Camera(cameraType);
        this.cameraInteractor = new CameraInteractor(this.camera, elCanvas);
        this.scene = new Scene(this.context);
        this.sceneTransform = new SceneTransform(this.elCanvas, this.context, this.camera);
    }

    getContext() {
        return this.context;
    }

    private glProgram: GLProgram<any, any>;
    setGlProgram(glProgram: GLProgram<any, any>) {
        const gl = this.context;
        const prog = glProgram.getProgram();
        gl.linkProgram(prog);
        gl.useProgram(prog);
        this.glProgram = glProgram;
    }

    setCamera(cameraPosition: vec3, azimuth: number, elevation: number) {
        this.camera.setPosition(cameraPosition);
        this.camera.setAzimuth(azimuth);
        this.camera.setElevation(elevation);
    }

    addObject(object: Object3D): GLObject {
        return this.scene.addObject(object);
    }

    drawProgram(wireframe: boolean = false) {
        const transformMat = this.sceneTransform.getTransformMat();
        this.glProgram.drawStart(transformMat);
        for (const glObject of this.scene.getGlObjects()) {
            this.glProgram.drawObject(transformMat, glObject, wireframe);
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
