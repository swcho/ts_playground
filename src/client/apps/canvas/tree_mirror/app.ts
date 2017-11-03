
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

//

import './style.scss';

const canvas = document.querySelector('.js-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const canvas2 = document.querySelector('.js-duplicate') as HTMLCanvasElement;
const ctx2 = canvas2.getContext('2d');

const dim = Math.min(window.innerWidth, window.innerHeight) * 0.95;
const w = dim;
const h = dim;
const midX = w >> 1;
const midY = h >> 1;

const PI = Math.PI;
const TO_RADIAN = PI / 180;

const maxDepth = 5;
const maxSpread = 90 * TO_RADIAN;

let autoAnimate = true;
let divergeAt = 0.5;
let spread = 45 * TO_RADIAN;
let tick = 0;

let autoSpeed = 0.004;
let autoTick = 0;

canvas.width = canvas2.width = w;
canvas.height = canvas2.height = h;

class Branch {

    position;
    length;
    divergeAt;
    angle;
    depth;

    color;
    spread;
    branches;
    constructor(position = { x: 0, y: 0 }, length = 100, divergeAt = 0.5, angle = 0, depth = 0, spread = 45 * TO_RADIAN) {
        this.position = position;
        this.length = length;
        this.divergeAt = divergeAt;
        this.angle = angle;
        this.depth = depth;

        this.color = '#000';
        this.spread = spread;
        this.branches = [];

        this.grow();
    }

    grow() {
        if (!this.canBranch) {
            return;
        }

        this.branches = [];

        const nextLength = this.length * 0.75;
        const nextDepth = this.depth + 1;

        this.branches.push(
            new Branch(
                this.growPosition,
                nextLength,
                this.divergeAt,
                // spread for newly created branches angles
                this.angle + this.spread,
                nextDepth,
                this.spread
            ),
            new Branch(
                this.growPosition,
                nextLength,
                this.divergeAt,
                // spread for newly created branches angles
                this.angle - this.spread,
                nextDepth,
                this.spread
            )
        );
    }

    update(spread, divergeAt) {
        this.spread = spread;
        this.divergeAt = divergeAt;

        this.grow();
    }

    get growPosition() {
        // divergeAt used for cacluating position of newly created branches.
        const dl = this.length * this.divergeAt;

        return {
            x: this.position.x + (Math.cos(this.angle) * dl),
            y: this.position.y + (Math.sin(this.angle) * dl),
        };
    }

    get canBranch() {
        return this.depth < maxDepth;
    }
}

const rootBranch = new Branch(
    { x: midX, y: midY },
    midY * 0.5,
    divergeAt,
    -90 * TO_RADIAN,
    0,
    spread
);

const drawBranch = (branch, phase) => {
    const h = ~~(200 + (160 * phase));
    const l = 50 + ~~(((branch.depth / (maxDepth + 1))) * 50);

    const endX = branch.length;
    const endY = 0;
    const r = 2;

    ctx.save();

    ctx.strokeStyle = `hsl(${h}, 100%, ${l}%)`;
    ctx.translate(branch.position.x, branch.position.y);
    ctx.rotate(branch.angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = `hsl(${h}, 100%, 50%)`;
    ctx.arc(endX, endY, r, 0, PI * 2, false);
    ctx.fill();
    ctx.closePath();

    ctx.restore();

    branch.branches.forEach((b) => {
        drawBranch(b, phase);
    });
};

// map start1 < value < stop1 to start2 < ? < stop2
const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

const clear = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
};

const loop = () => {
    let phase = rootBranch.spread / maxSpread;

    clear();

    if (autoAnimate) {
        phase = map(Math.sin(autoTick), -1, 1, 0, 1);

        spread = phase * maxSpread;
        divergeAt = map(Math.sin(autoTick), -1, 1, 0, 0.5);

        autoTick += autoSpeed;
    }

    rootBranch.update(spread, divergeAt);

    drawBranch(rootBranch, phase);

    const numSegments = 12;
    const angleInc = PI * 2 / numSegments;
    let angle = tick;

    for (let i = 0; i < numSegments; i++) {
        ctx2.save();
        ctx2.translate(midX, midY);
        ctx2.rotate(angle);
        ctx2.drawImage(canvas, -w / 2, -h / 2);
        ctx2.restore();
        angle += angleInc;
    }

    tick += 0.002;

    requestAnimationFrame(loop);
};

const onPointerMove = (e) => {
    if (autoAnimate) {
        return;
    }

    const target = (e.touches && e.touches.length) ? e.touches[0] : e;
    const { clientX: x, clientY: y } = target;

    const width = window.innerWidth;
    const height = window.innerHeight;

    spread = (x / width) * maxSpread;
    divergeAt = y / height;
};

document.body.addEventListener('mousemove', onPointerMove);
document.body.addEventListener('touchmove', onPointerMove);

document.addEventListener('mouseenter', () => {
    autoAnimate = false;
});

document.addEventListener('mouseleave', () => {
    autoAnimate = true;
});

loop();
