
import {mat4, vec3, vec4} from 'gl-matrix';

export enum CameraType {
    ORBIT,
    TRACKING,
};

const ROTATE_UNIT = Math.PI / 180;

export class Camera {

    private matrix      = mat4.create();
    private up          = vec4.create();
    private right       = vec4.create();
    private normal      = vec4.create();
    private position    = vec3.create();
    private home        = vec3.create();
    private azimuth     = 0.0;
    private elevation   = 0.0;
    private steps       = 0;

    private hookRenderer;
    private hookGUIUpdate;

    constructor(private type: CameraType) {

    }

    setType(type: CameraType) {
        this.type = type;
    }

    update() {
        const m = this.matrix;
        if (this.type === CameraType.TRACKING) {
            mat4.identity(m);
            mat4.translate(m, m, this.position);
            mat4.rotateY(m, m, this.azimuth * ROTATE_UNIT);
            mat4.rotateX(m, m, this.elevation * ROTATE_UNIT);
        } else {
            mat4.identity(m);
            mat4.rotateY(m, m, this.azimuth * ROTATE_UNIT);
            mat4.rotateX(m, m, this.elevation * ROTATE_UNIT);
            mat4.translate(m, m, this.position);
        }
        vec4.transformMat4(this.right,  [1, 0, 0, 0], m);
        vec4.transformMat4(this.up,     [0, 1, 0, 0], m);
        vec4.transformMat4(this.normal, [0, 0, 1, 0], m);
    }

    changeX(posX: number) {
        this.position[0] += posX;
        this.update();
    }

    changeY(posY: number) {
        this.position[1] += posY;
        this.update();
    }

    changeZ(posZ: number) {
        this.position[2] += posZ;
        this.update();
    }

    setPosition(pos: vec3) {
        vec3.copy(this.position, pos);
        this.update();
    }

    getPosition() {
        return this.position;
    }

    changeAzimuth(azimuth: number) {
        this.azimuth += azimuth;
        if (this.azimuth > 360 || this.azimuth < -360) {
            this.azimuth %= 360;
        }
        this.update();
    }

    setAzimuth(azimuth: number) {
        this.changeAzimuth(azimuth - this.azimuth);
    }

    changeElevation(elevation: number) {
        this.elevation += elevation;
        if (this.elevation > 360 || this.elevation < -360) {
            this.elevation %= 360;
        }
        this.update();
    }

    setElevation(elevation: number) {
        this.changeElevation(elevation - this.elevation);
    }

    goHome(newHome?: vec3) {
        if (newHome) {
            this.home = newHome;
        }
        this.setPosition(this.home);
        this.setAzimuth(0);
        this.setElevation(0);
        this.steps = 0;
    }

    setFromMVMatrix(mvMatrix: mat4) {
        this.matrix= mat4.create();
        mat4.identity(this.matrix);
        mat4.invert(this.matrix, mvMatrix);
        mat4.getTranslation(this.position, this.matrix);
    }

    getMVTransform(): mat4 {
        const ret = mat4.create();
        mat4.invert(ret, this.matrix);
        return ret;
    }

    dolly(aSteps: number) {
        const position = vec3.create();
        vec3.copy(position, this.position);

        const normal = vec3.create();
        vec3.normalize(normal, this.normal as any);

        const steps = aSteps; // - this.steps;

        const newPosition = vec3.create();

        if (this.type === CameraType.TRACKING) {
            newPosition[0] = position[0] - steps * normal[0];
            newPosition[1] = position[1] - steps * normal[1];
            newPosition[2] = position[2] - steps * normal[2];
        } else {
            newPosition[0] = position[0];
            newPosition[1] = position[1];
            newPosition[2] = position[2] - steps;
        }
        this.setPosition(newPosition);
        this.steps = steps;
    }

    panHorizontal(aSteps: number) {
        const position = vec3.create();
        vec3.copy(position, this.position);

        const normal = vec3.create();
        vec3.normalize(normal, this.right as any);

        const steps = aSteps; // - this.steps;

        const newPosition = vec3.create();

        if (this.type === CameraType.TRACKING) {
            newPosition[0] = position[0] - steps * normal[0];
            newPosition[1] = position[1] - steps * normal[1];
            newPosition[2] = position[2] - steps * normal[2];
        } else {
            newPosition[0] = position[0];
            newPosition[1] = position[1];
            newPosition[2] = position[2] - steps;
        }
        this.setPosition(newPosition);
        this.steps = steps;
    }
}
