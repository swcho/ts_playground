
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

// https://codepen.io/zayncollege/pen/EvYzEw

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
let particles: Particle[] = [];
let math = Math;
let rnd = math.random;
let max = math.max;
let min = math.min;
let i = 0;

doc.bgColor = '#fff';

while (particles.length < max_particles) {
    particles.push({ x: (rnd() * width) | 0, y: (rnd() * height) | 0, vx: 0, vy: 0 });
}

function x_movement_fn(particle) {
    return math.sin(particle.y / 25) - 0.5;
}

function y_movement_fn(particle) {
    return math.sin(particle.x / 25) - 0.5;
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

        context.fillStyle = 'rgba(0,0,0,0.01)';
        context.fillRect(0, 0, width, height);
        for (i = 0; i < max_particles; i++) {
            update(i);
            draw(i);
        }
    },
    10
);

