
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

const elCanvas = document.getElementById('canv') as HTMLCanvasElement;
const ctx = elCanvas.getContext('2d');
let width: number, height: number;
elCanvas.width = width = window.innerWidth;
elCanvas.height = height = window.innerHeight;
ctx.fillStyle = 'hsla(0,0%,0%,1)';
ctx.fillRect(0, 0, width, height);
const BUBBLE_COUNT = 300;
const CELLS_COUNT = 50;

class Part {
    x: number;
    y: number;
    vx: number;
    vy: number;
    mx: number;
    my: number;
    mouse: boolean;
    constructor(px: number, py: number) {
        this.x = px;
        this.y = py;
        this.vx = 0;
        this.vy = 0;
        this.mx = 0;
        this.my = 0;
    }
    anim() {
        const DAMPER = 0.98;
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= DAMPER;
        this.vy *= DAMPER;
    }
}

function Cell(p1: Part, p2: Part, p3: Part, p4: Part) {
    this.draw = (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = 'hsla(255,255%,255%,.2)';
        ctx.fillStyle = 'hsla(255,255%,255%,1)';
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 5, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.moveTo(p1.x + 0.5, p1.y + 0.5);
        ctx.lineTo(p2.x - 0.5, p2.y + 0.5);
        ctx.lineTo(p3.x - 0.5, p3.y - 0.5);
        ctx.lineTo(p4.x + 0.5, p4.y - 0.5);
        ctx.closePath();
        ctx.stroke();

        ctx.save();
        // ctx.moveTo(0, 0);
        ctx.translate(p1.x, p1.y);
        ctx.rotate(Math.PI / 4);
        ctx.textAlign = 'left';
        if (p1.mouse) {
            ctx.fillStyle = '#ff0000';
        }
        // ctx.font = '14px Monospace';
        ctx.fillText(`${p1.vx.toFixed(1)}, ${p1.vy.toFixed(1)}`, 0, 0),
        ctx.fillText(`${p1.mx.toFixed(1)}, ${p1.my.toFixed(1)}`, 0, 10),
        ctx.restore();

    };
}

function Grid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ms = null;

    let col = ((width - 1) / CELLS_COUNT | 0) + 1;
    let row = ((height - 1) / CELLS_COUNT | 0) + 1;
    let bubbleXL = 1 / (BUBBLE_COUNT * BUBBLE_COUNT);
    // let bubbleXL = 1 / 20000;
    let diam = [{
        x: -1,
        y: 0
    }, {
        x: 0,
        y: -1
    }, {
        x: 1,
        y: 0
    }, {
        x: 0,
        y: 1
    }];

    // parts/points
    let pts = [];
    // squears
    let sqs = [];

    // part index
    let pindx = function (x, y) {
        if (0 <= x && x < col + 1 && 0 <= y && y < row + 1) {
            return x + y * (col + 1);
        } else {
            return null;
        }
    };

    // cell index
    let cindx = function (x, y) {
        if (0 <= x && x < col && 0 <= y && y < row) {
            return x + y * col;
        } else {
            return null;
        }
    };

    // initialize parts and cells
    for (let x = 0; x < col + 1; x++) {
        for (let y = 0; y < row + 1; y++) {
            let px = x * CELLS_COUNT;
            let py = y * CELLS_COUNT;
            pts[pindx(x, y)] = new Part(px, py);

            if (x > 0 && y > 0) {
                let idxc = cindx(x - 1, y - 1);
                let p1 = pts[pindx(x - 1, y - 1)];
                let p2 = pts[pindx(x, y - 1)];
                let p3 = pts[pindx(x, y)];
                let p4 = pts[pindx(x - 1, y)];
                let cell = new Cell(p1, p2, p3, p4);
                sqs[idxc] = cell;
            }
        }
    }

    this.struct = () => {
        for (let x = 0; x < col + 1; x++) {
            for (let y = 0; y < row + 1; y++) {
                let p = pts[pindx(x, y)];

                let cnt = 1;
                let msX = x * CELLS_COUNT;
                let msY = y * CELLS_COUNT;
                for (let i = 0; i < diam.length; i++) {
                    let dp = diam[i];
                    let cp = pts[pindx(x + dp.x, y + dp.y)];
                    if (cp != null) {
                        msX += cp.x - dp.x * CELLS_COUNT;
                        msY += cp.y - dp.y * CELLS_COUNT;
                        cnt++;
                    }
                }
                const FORCE_TO_RETURN = 0.6;
                p.vx += (msX / cnt - p.x) * FORCE_TO_RETURN;
                p.vy += (msY / cnt - p.y) * FORCE_TO_RETURN;
                p.mouse = false;
                p.mx = msX / cnt;
                p.my = msY / cnt;
                // p.vx *= FORCE_TO_RETURN;
                // p.vy *= FORCE_TO_RETURN;
                // p.vx = x * CELLS_COUNT - p.x;
                // p.vy = y * CELLS_COUNT - p.y;

                if (this.ms != null) {
                    const FORCE_TO_AWAY = 0.06;
                    let d2 = (this.ms.x - p.x) *
                        (this.ms.x - p.x) +
                        (this.ms.y - p.y) *
                        (this.ms.y - p.y);
                    if (d2 * bubbleXL < 1.0) {
                        let t = 1.0 - (d2 * bubbleXL);
                        p.vx -= (this.ms.x - p.x) * t * FORCE_TO_AWAY;
                        p.vy -= (this.ms.y - p.y) * t * FORCE_TO_AWAY;
                        p.mouse = true;
                    }
                    // this.ms = null;
                }
            }
        }

        for (let x = 0; x < col + 1; x++) {
            for (let y = 0; y < row + 1; y++) {
                let p = pts[pindx(x, y)];
                p.anim();
            }
        }
    };

    this.draw = ($) => {
        $.clearRect(0, 0, width, height);
        for (let i = 0; i < sqs.length; i++) {
            sqs[i].draw($);
        }
    };
}

let grid = new Grid(ctx, width, height);

window.addEventListener('mousemove', function (e) {
    grid.ms = {
        x: e.clientX,
        y: e.clientY,
    };
}, false);

window.addEventListener('mouseout', function (e) {
    grid.ms = null;
}, false);

window.addEventListener('touchmove', function (e) {
    e.preventDefault();
    grid.ms = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
    };
}, false);

function load() {
    grid.struct();
    grid.draw(ctx);
    window.requestAnimationFrame(load);
};
load();

console.log('Code With ❤ Always, @tmrDevelops');
