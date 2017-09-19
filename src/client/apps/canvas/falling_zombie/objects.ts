
/// <reference path="def.d.ts"/>

export abstract class CObject {
    x: number;
    y: number;
    w: number;
    h: number;
    r: number;
    vx: number;
    vy: number;
    shape: HTMLImageElement | HTMLCanvasElement;
    abstract anim(drawArea: DrawArea, ctx: CanvasRenderingContext2D): void;
}

export class Aargh extends CObject {

    a: number;
    private s: number;
    private loaded: boolean;
    shape: HTMLImageElement;

    constructor(srcimg: string, size: number) {
        super();
        this.x = -10000.0;
        this.y = 0.0;
        this.w = 0.0;
        this.h = 0.0;
        this.vx = 0.0;
        this.vy = 0.0;
        this.a = 0;
        this.s = size;
        this.shape = new Image();
        this.loaded = false;
        this.shape.src = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/222599/${srcimg}.png`;
    }

    anim(drawArea: DrawArea, ctx: CanvasRenderingContext2D) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.loaded) {
            const tx = this.x + drawArea.x + drawArea.width * 0.5;
            const ty = this.y + drawArea.y + drawArea.height * 0.5;
            ctx.translate(tx, ty);
            ctx.rotate(this.a);
            ctx.drawImage(
                this.shape,
                -this.w * 0.5,
                -this.h * 0.5,
                this.w,
                this.h
            );
            ctx.rotate(-this.a);
            ctx.translate(-tx, -ty);
        } else {
            if (this.shape.complete && this.shape.width) {
                this.w = this.shape.width * this.s / 40;
                this.h = this.shape.height * this.s / 40;
                this.loaded = true;
            }
        }
    }
};

export class Particle extends CObject {
    constructor() {
        super();
        this.x = 0.0;
        this.y = 0.0;
        this.r = 0.0;
        this.vx = 0.0;
        this.vy = 0.0;
        this.shape = Particle.shape('rgba(255,164,0,1)');
    }

    anim(drawArea: DrawArea, ctx: CanvasRenderingContext2D) {
        if (this.r > 0) {
            this.r *= 0.99;
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.1;
            ctx.drawImage(
                this.shape,
                this.x - this.r + drawArea.x + drawArea.width * 0.5,
                this.y - this.r + drawArea.y + drawArea.height * 0.5,
                2 * this.r,
                2 * this.r
            );
        }
    }

    static shape(color) {
        const shape = document.createElement('canvas');
        shape.width = 128;
        shape.height = 128;
        const ctx = shape.getContext('2d');
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(64, 64, 63, 0, 2 * Math.PI);
        ctx.fill();
        return shape;
    }
}

export class Disk extends CObject {

    aargh: boolean;
    sat: number;

    constructor(private size: number) {
        super();
        this.x = 0;
        this.y = -10000;
        this.vx = 3 * Math.random() - 1.5;
        this.vy = 3 * Math.random() - 1.5;
        this.r = 0;
        this.shape = Particle.shape('rgba(255,128,64,0.5)');
        this.aargh = true;
    }

    anim(drawArea: DrawArea, ctx: CanvasRenderingContext2D) {
        this.x += this.vx;
        this.y += this.vy;
        ctx.drawImage(
            this.shape,
            this.x - this.r + drawArea.x + drawArea.width * 0.5,
            this.y - this.r + drawArea.y + drawArea.height * 0.5,
            2 * this.r,
            2 * this.r
        );
        if (this.y < -drawArea.y - drawArea.height) {
            this.r = this.size * 4 + Math.random() * this.size * 3;
            this.y =
                this.r + drawArea.height * 0.5 - drawArea.y + Math.random() * drawArea.height;
            this.x = -drawArea.x + Math.random() * drawArea.width - drawArea.width * 0.5;
            this.sat = 0;
            this.aargh = true;
        }
    }
}
