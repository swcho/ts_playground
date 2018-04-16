
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

// require('p5');
//

let scale = 8;

import dat = require('dat-gui');
const CONFIG = {
    friction: 0.75,
    speedLimit: 0.9 * scale,
    radius: 3,
};

let gui = new dat.GUI();
gui.add(CONFIG, 'friction', -1, 2).step(0.01);
gui.add(CONFIG, 'speedLimit', -1 * scale, 2 * scale).step(1);
gui.add(CONFIG, 'radius', 1, 8).step(1);

// start

let canvas: p5.Renderer2D;
let ctx: CanvasRenderingContext2D;

let speedLimit = 0.9 * scale;
// let friction = 0.75;
let roboto: p5.Font;
let particles: Particle[] = [];
let oldDate = '' as any;
let textBounds: p5.Bound = {} as any;
let points: {
    [char: string]: p5.Vector[];
} = {};
let textPoints: p5.Vector[] = [];
let order = [];

class Particle {
    private pos: p5.Vector;
    private vel: p5.Vector;
    private acc: p5.Vector;
    constructor() {
        this.pos = createVector();
        this.vel = createVector();
        this.acc = createVector();
    }

    // applyForce(x: number | p5.Vector, y?: number | p5.Vector, z?: number | p5.Vector);
    applyForce(x: number|p5.Vector|any[], y?: number, z?: number);
    applyForce(...args: (p5.Vector | number)[]) {
        this.acc.add(...args);
        return this;
    }
    attractTo(vec: p5.Vector) {
        if (vec === undefined) {
            return this;
        }
        let v = vec.copy()
            .sub(this.pos)
            .limit(speedLimit);
        this.applyForce(v);
        return this;
    }
    update() {
        let { pos, vel, acc } = this;
        vel.add(acc);
        acc.set(0, 0);
        vel.mult(CONFIG.friction);
        pos.add(vel);
        return this;
    }
    draw() {
        let { pos: { x, y } } = this;
        ctx.moveTo(x + CONFIG.radius, y);
        ctx.arc(x, y, CONFIG.radius, 0, TAU);
        return this;
    }
}
function preload() {
    roboto = loadFont('https://alca.tv/static/codepen/pens/common/RobotoMono-Bold.ttf');
}

function renderCharacter(c: string) {
    let pts = roboto.textToPoints(c + '', 0, 0, 2 * scale, { sampleFactor: 0.875 })
        .map(n => createVector(n.x, n.y)
            .add(-textBounds.w * 0.5, textBounds.h * 0.5)
            .sub(8 * textBounds.w * 0.5 + textBounds.advance * 7)
            .mult(scale)
        );
    pts[0].z = -1; // First
    pts[pts.length - 1].z = 1; // Last
    points[c] = pts;
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    ctx = canvas.drawingContext as any;

    for (let i = 0; i < 180 * scale; i++) {
        let p = new Particle();
        p.applyForce(p5.Vector.random2D().mult(random(1 * scale, 2 * scale)));
        particles.push(p);
    }

    textBounds = roboto.textBounds('0', 0, 0, 2 * scale);

    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ':'].forEach(renderCharacter);
}

function draw() {
    ctx.clearRect(0, 0, width, height);
    fill(255);
    translate(width / 2, height / 2);

    let changed = getDate();

    ctx.beginPath();

    // particles.forEach((particle, i) => {
    //     let index = floor(map(i, 0, particles.length, 0, textPoints.length));
    //     let textPoint = textPoints[index % textPoints.length];

    //     particle.draw()
    //         .attractTo(textPoint)
    //         .update();
    // });

    textPoints.forEach((point, i) => {
        const particle = particles[i];
        particle.draw()
            .attractTo(point)
            .update();
    });

    // console.log('draw particle.len =', particles.length);

    ctx.fillStyle = 'hsl(210, 100%, 50%)';
    ctx.fill();

    // if (changed) { // Rotate the particles
    //     for (let i = 0; i < particles.length * 0.333; i++) {
    //         let p = particles.pop();
    //         p.applyForce(-18 * scale, -10 * scale);
    //         particles.unshift(p);
    //     }
    // }
}

const timeStringParts = ['Hour', 'Minute', 'Second'].map(n => `get${n}s`);
function getDate() {
    let date = new Date();
    if (oldDate.toString() === date.toString()) {
        return false;
    }
    oldDate = date;
    const textString = timeStringParts
        .map(n => date[n]()) // getHour, getMinute, getSecond => number[]
        .map(n => `0${n}`.slice(-2)) // Padding 0
        .join(':')
        .split('');
    textPoints = [].concat(...textString.map((n, i) => {
        let offset = (i * textBounds.w * textBounds.advance) * scale;
        return points[n].map(p => p.copy().add(offset, 0));
    }));
    console.log('textPoints len = ', textPoints.length);
    return true;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

window['preload'] = preload;
window['setup'] = setup;
window['draw'] = draw;
window['resize'] = windowResized;
