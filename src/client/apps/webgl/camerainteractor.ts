
import {Camera} from './camera';

const MOTION_FACTOR = 10.0;

export class CameraInteractor {

    private dragging: boolean;
    private x: number;
    private y: number;
    private lastX: number;
    private lastY: number;
    private button: number;
    private ctrl: boolean;
    private alt: boolean;
    private key: number;
    private dloc = 0;
    private dstep = 0;

    constructor(private camera: Camera, private elCanvas: HTMLCanvasElement) {
        this.elCanvas.onmousedown = (ev) => this.onMouseDown(ev);
        this.elCanvas.onmouseup = (ev) => this.onMouseUp(ev);
        this.elCanvas.onmousemove = (ev) => this.onMouseMove(ev);
        this.elCanvas.onkeydown = (ev) => this.onKeyDown(ev);
        this.elCanvas.onkeyup = (ev) => this.onKeyUp(ev);
    }

    private translate(value: number) {
        const dv = 2 * MOTION_FACTOR * value / this.elCanvas.height;
        // this.camera.dolly(Math.pow(1.1, dv) * (value > 0 ? 1 : -1));
        this.camera.dolly(dv);
    }

    private rotate(dx: number, dy: number) {
        const delta_elevation   = -20.0 / this.elCanvas.height;
        const delta_azimuth     = -20.0 / this.elCanvas.width;

        const nAzimuth  = dx * delta_azimuth * MOTION_FACTOR;
        const nElevation = dy * delta_elevation * MOTION_FACTOR;

        this.camera.changeAzimuth(nAzimuth);
        this.camera.changeElevation(nElevation);
    }

    private onMouseDown(ev: MouseEvent) {
        this.dragging = true;
        this.x = ev.clientX;
        this.y = ev.clientY;
        this.button = ev.button;
        const position = this.camera.getPosition();
        this.dstep = Math.max(position[0], position[1], position[2]) / 100;
    }

    private onMouseUp(ev: MouseEvent) {
        this.dragging = false;
    }

    private onMouseMove(ev: MouseEvent) {
        this.lastX = this.x;
        this.lastY = this.y;
        this.x = ev.clientX;
        this.y = ev.clientY;

        if (!this.dragging) return;

        this.ctrl = ev.ctrlKey;
        this.alt = ev.altKey;
        const dx = this.x - this.lastX;
        const dy = this.y - this.lastY;

        if (this.button === 0) {
            if (this.alt) {
                // this.translate(dy);
                this.dolly(dy);
            } else {
                this.rotate(dx, dy);
            }
        }

    }

    private onKeyDown(ev: KeyboardEvent) {
        this.key = ev.keyCode;
        this.ctrl = ev.ctrlKey;

        const handlers = {
            38: () => this.camera.changeElevation(10), // up
            40: () => this.camera.changeElevation(-10), // down
            37: () => this.camera.changeAzimuth(-10), // left
            39: () => this.camera.changeAzimuth(10), // right
            // 87: () => this.camera.changeZ(-10), // w
            // 83: () => this.camera.changeZ(10), // s
            // 65: () => this.camera.changeX(-10), // a
            // 68: () => this.camera.changeX(10), // d
            87: () => this.camera.dolly(0.5), // w
            83: () => this.camera.dolly(-0.5), // s
            65: () => this.camera.panHorizontal(0.5), // a
            68: () => this.camera.panHorizontal(-0.5), // d
        };

        const handler = handlers[this.key];

        if (handler) {
            handler();
        } else {
            console.log(this.key);
        }
    }

    private onKeyUp(ev: KeyboardEvent) {
        if (ev.keyCode === 17) {
            this.ctrl = false;
        }
    }

    private dolly(value: number) {
        this.dloc += (0 < value ? this.dstep : -this.dstep);
        this.camera.dolly(this.dloc);
    }
}
