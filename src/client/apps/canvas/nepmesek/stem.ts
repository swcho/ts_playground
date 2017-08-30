
import {Leaf} from './leaf';

export const DEFAULT_HUE = 100;

export class Stem {

    private x: number;
    private y: number;

    private angle: Ratio = Math.random();
    private angleChange: Ratio = 0.003 + Math.random() * 0.004;
    private angleChangeDest: Ratio = 0.003 + Math.random() * 0.004;
    private velocity = 5;

    private history = [];
    private leaves: Leaf[] = [];
    private step = 0;
    private sMax = 5;
    private maxHistory = 20;

    private decay = false;
    private hue = DEFAULT_HUE;

    constructor(private canvas: HTMLCanvasElement, private param: Param, private stems: Stem[], x?: number, y?: number, r?: number) {
        // this.x = x || Math.random() * canvas.width
        // this.y = y || Math.random() * canvas.height
        this.x = x || Math.random() * canvas.width;
        this.y = canvas.height;

        stems.push(this);
    }

    // getNewCenter() {
    //     // pick a new radius
    //     let r = Math.round(Math.random() * 70 + 10);

    //     let phase = this.phase / this.r1c;
    // };

    update() {
        const {
            param: { leaf_density },
        } = this;
        this.step = (this.step + 1) % leaf_density;

        this.hue = DEFAULT_HUE * 0.01 + this.hue * 0.99;

        this.angle += this.angleChange;

        this.angleChange = this.angleChangeDest * 0.0001 + this.angleChange * 0.9999;

        if (Math.random() > 0.96) {
            this.angleChange = -this.angleChange;
            this.angleChangeDest = -this.angleChangeDest;
            // this.angleChangeDest = (Math.random() - 0.5 ) * 0.03;
        }

        if (Math.random() > 0.95) {
            this.angleChangeDest = (Math.random() - 0.6) * 0.03;
        }

        if (this.decay) {
            this.history.pop();
            if (this.history.length === 0) {
                this.kill();
            }
            return null;
        }

        if (this.x < (0 + 30) || this.x > (this.canvas.width + 30) ||
            this.y < (0 + 30) || this.y > (this.canvas.height + 30)) {
            // start decay
            this.decay = true;

            // create new
            new Stem(this.canvas, this.param, this.stems);
            return;
        }

        let newx = this.x + Math.cos(this.angle * Math.PI * 2) * this.velocity;
        let newy = this.y + Math.sin(this.angle * Math.PI * 2) * this.velocity;

        if (this.step === 0) {
            // add leaf
            const root = {
                x: this.x,
                y: this.y,
            };
            this.leaves.unshift(new Leaf(this.param, root, newx, newy, 1));
            this.leaves.unshift(new Leaf(this.param, root, newx, newy, -1));
        }

        let xy = [
            this.x = newx,
            this.y = newy
        ];

        this.history.unshift(xy);

        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }

        if (this.leaves.length > this.maxHistory / leaf_density * 2) {
            this.leaves.pop();
        }

        // update leaves
        for (let i = this.leaves.length - 1; i >= 0; i--) {
            this.leaves[i].update();
        }
    }


    kill() {
        while (this.leaves.length > 0) {
            this.leaves.pop();
        }

        let i = this.stems.indexOf(this);
        this.stems.splice(i, 1);
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.update();

        if (this.history.length > 1) {
            ctx.beginPath();
            // ctx.strokeStyle = `hsla(${this.hue}, 100%, 50%, 0.5)`
            ctx.strokeStyle = this.param.color;
            ctx.lineCap = 'round';
            ctx.lineWidth = 3;
            ctx.moveTo(this.history[0][0], this.history[0][1]);
            ctx.lineTo(this.history[1][0], this.history[1][1]);
            // for (var i = 1; i < this.history.length; i ++) {
            //   ctx.lineTo(this.history[i][0], this.history[i][1])
            // }
            ctx.stroke();
        }

        // draw leaves
        for (let i = this.leaves.length - 1; i >= 0; i--) {
            this.leaves[i].draw(ctx);
        }
    }
}
