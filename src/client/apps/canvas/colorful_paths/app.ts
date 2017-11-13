
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

// https://codepen.io/zayncollege/pen/EvYzEw

import dat = require('dat-gui');
const CONFIG = {
    division: 25,
    add: 0.1,
    usePrev: false,
    noFade: false,
};

let gui = new dat.GUI();
gui.add(CONFIG, 'division', 0.01, 50).step(0.01);
gui.add(CONFIG, 'add', -1, 1).step(0.1);
gui.add(CONFIG, 'usePrev');
gui.add(CONFIG, 'noFade');

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

let doc = document;
let canvas = doc.getElementById('c') as HTMLCanvasElement;
let context = canvas.getContext('2d');
let width = canvas.width = window.innerWidth - 21;
let height = canvas.height = window.innerHeight - 21;
let max_particles = width * height / 810;
// let max_particles = 1; // width * height / 810;
let particles: Particle[] = [];
let math = Math;
let rnd = math.random;
let max = math.max;
let min = math.min;
let i = 0;

doc.bgColor = '#fff';

while (particles.length < max_particles) {
    particles.push({
        x: (rnd() * width) | 0,
        y: (rnd() * height) | 0,
        vx: 0,
        vy: 0
    });
}

function x_movement_fn(particle) {
    const prev = CONFIG.usePrev ? particle.x : particle.y;
    const ret = math.sin(prev / CONFIG.division) + CONFIG.add;
    return ret;
}

function y_movement_fn(particle) {
    const prev = CONFIG.usePrev ? particle.y : particle.x;
    return math.cos(prev / CONFIG.division) + CONFIG.add;
}

function update(index) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) {
        p.x = width + p.x;
    }
    else if (p.x >= width) {
        p.x -= width;
    }

    if (p.y < 0) {
        p.y = height + p.y;
    }
    else if (p.y >= height) {
        p.y -= height;
    }

    p.vy = y_movement_fn(p);
    p.vx = x_movement_fn(p);
}

function clamp_str(v) {
    return (min(max(v, 0), 1) * 255) | 0;
}

function draw(index) {

    let p = particles[i];
    let c = 'rgb(' + clamp_str(p.x / width) + ',' + clamp_str(p.vx * p.vx + p.vy * p.vy) + ',' + clamp_str(p.y / height) + ')';
    context.fillStyle = c;

    context.beginPath();
    context.arc(p.x, p.y, 5 / max((p.vx * p.vx + p.vy * p.vy), 0.5), 0, 2 * math.PI, false);
    context.closePath();
    context.fill();
}

setInterval(
    function () {

        context.fillStyle = CONFIG.noFade ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0.01)';
        context.fillRect(0, 0, width, height);
        for (i = 0; i < max_particles; i++) {
            update(i);
            draw(i);
        }
    },
    10
);

