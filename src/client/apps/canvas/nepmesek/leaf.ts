
import {drawCircle} from './utils';

interface CircleInfo {
    center: Pos;
    radius: number;
}

export class Leaf {

    private angle: number;
    private drawCount: number;
    private leafThickness: number;
    private leafLength: number;
    private leafDrawCnt: number;
    private history: CircleInfo[] = [];

    constructor(private param: Param, private root: Pos, private vx: number, private vy: number, private direction: number) {
        this.angle = Math.atan2(vy - root.y, vx - root.x);
        this.drawCount = 0;
        this.leafThickness = param.leaf_thickness;
        this.leafLength = param.leaf_length;
        this.leafDrawCnt = param.leaf_drawcnt;
        this.history = [];
    }

    update() {
        this.drawCount++;

        const {
            drawCount,
            leafDrawCnt,
        } = this;

        if (drawCount < leafDrawCnt) {
            const {
                leafLength,
                leafThickness,
                root: {x, y},
                angle,
                direction,
            } = this;

            const step = drawCount / leafDrawCnt;

            this.history.unshift({
                center: {
                    x: x + step * leafLength * Math.cos(angle),
                    y: y + step * leafLength * Math.sin(angle),
                },
                radius: 0.1 + step * leafThickness,
            });

            this.angle += direction / leafDrawCnt;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        const h = this.history[0];
        drawCircle(ctx, h.center, h.radius, this.param.color);
        // for (var i = this.history.length - 1; i >= 0; i--) {
        //   h = this.history[i]
        //   drawCircle(h[0], h[1], h[2], 'red')
        // };
    }
}
