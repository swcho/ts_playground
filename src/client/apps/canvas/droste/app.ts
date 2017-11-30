
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);
import * as States from 'stats.js';
import dat = require('dat-gui');
const CONFIG = {
    animation: false,
    transformX: 1,
    transformY: 1,
    arms: 1,
};

let gui = new dat.GUI();
gui.add(CONFIG, 'animation');
gui.add(CONFIG, 'transformX', -1, 1).step(0.1);
gui.add(CONFIG, 'transformY', -1, 1).step(0.1);
gui.add(CONFIG, 'arms');

import {doyle, Vector2} from './doyleSpirals';

const states = new States();
document.body.appendChild(states.domElement);

let c = document.getElementById('canv') as HTMLCanvasElement,
    $ = c.getContext('2d');
c.width = window.innerWidth / 1.5;
c.height = window.innerHeight / 1.5;

let fst;
let p = 18, q_numberOfArms = 24;
let root = doyle(q_numberOfArms, p);
console.log(p, q_numberOfArms, root);
let rep = 800;

// (x1 * x2 - y2 * y2, x1 * y2 + y1 * x2)
function cmul(v1: Vector2, v2: Vector2): Vector2 {
    return [
        v1[0] * v2[0] - v1[1] * v2[1],
        v1[0] * v2[1] + v1[1] * v2[0]
    ];
}

// sqrt(x^2 + y^2)
function modulus(p: Vector2) {
    return Math.sqrt(p[0] * p[0] + p[1] * p[1]);
}
function crecip(z): Vector2 {
    let d = z[0] * z[0] + z[1] * z[1];
    return [z[0] / d, -z[1] / d];
}

// Circle drawing
function circle(x, y, r) {
    $.beginPath();
    $.arc(x, y, r, 0, 7, false);
    // $.fill();
    $.lineWidth = r / 10;
    $.stroke();
}

function spiral(r: number, start_point: Vector2, delta: Vector2, gamma: Vector2, options) {
    let recip_delta = crecip(delta),
        mod_delta = modulus(delta),
        mod_recip_delta = 1 / mod_delta,
        color_index = options.i,
        colors = options.fill,
        min_d = options.min_d,
        max_d = options.max_d;
    let q, mod_q;
    console.log('spiral', r, start_point, 'delta', delta, gamma, mod_delta);

    // Spiral outwards
    for (q = start_point, mod_q = modulus(q);
        mod_q > min_d;
        q = cmul(q, recip_delta),
        mod_q *= mod_recip_delta) {
        // circle(q[0], q[1], mod_q * r);
        color_index = (color_index + colors.length - 1) % colors.length;
    }

    // Spiral inwards
    for (; mod_q < max_d; q = cmul(q, delta), mod_q *= mod_delta) {
        console.log(q, mod_q);
        $.fillStyle = colors[color_index];

        $.beginPath();
        $.moveTo.apply($, q);
        $.lineTo.apply($, cmul(q, delta));
        $.lineTo.apply($, cmul(q, gamma));
        $.closePath();
        $.fill();

        circle(q[0], q[1], mod_q * r);

        color_index = (color_index + 1) % colors.length;
    }
}

const ratio = 1;

function draw(time: number) {
    $.setTransform(CONFIG.transformX, 0, 0, CONFIG.transformY, 0, 0);
    $.clearRect(0, 0, c.width, c.height);
    $.translate(Math.round(c.width / 2),
        Math.round(c.height / 2));
    let sc = Math.pow(root.mod_a, time);
    if (CONFIG.animation) {
        $.scale(sc, sc);
        $.rotate(root.arg_a * time);
    }

    let min_d = 1 / sc,
        max_d = c.width * 2;
    let beg: Vector2 = root.a as any;

    const delta = [root.a[0] * ratio, root.a[1] * ratio] as Vector2;

    q_numberOfArms = CONFIG.arms;
    for (let i = 0; i < q_numberOfArms; i++) {
        spiral(
            root.r,
            beg,
            delta,
            root.b,
            {
                fill: ['#D43D2C',
                    '#333838',
                    '#2CC3D4'],
                i: i,
                min_d: min_d,
                max_d: max_d
            }
        );
        beg = cmul(beg, root.b as any);
    }
}

function anim(ts?: number) {
    if (!fst) fst = ts;
    draw(((ts - fst) % (rep * 3)) / rep);
    states.update();
    window.requestAnimationFrame(anim);
}
anim();
