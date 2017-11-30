
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);
import * as States from 'stats.js';

import {doyle} from './doyleSpirals';

const states = new States();
document.body.appendChild(states.domElement);

let c = document.getElementById('canv') as HTMLCanvasElement,
    $ = c.getContext('2d');
c.width = window.innerWidth / 1.5;
c.height = window.innerHeight / 1.5;

let fst;
let p = 18, q = 24;
let root = doyle(q, p);
let rep = 800;

function cmul(w, z) {
    return [
        w[0] * z[0] - w[1] * z[1],
        w[0] * z[1] + w[1] * z[0]
    ];
}
function modulus(p) {
    return Math.sqrt(p[0] * p[0] + p[1] * p[1]);
}
function crecip(z) {
    let d = z[0] * z[0] + z[1] * z[1];
    return [z[0] / d, -z[1] / d];
}

function spiral(r, st, delta, gamma, opts) {
    let rd = crecip(delta),
        md = modulus(delta),
        mrd = 1 / md,
        colidx = opts.i,
        cols = opts.fill,
        min_d = opts.min_d,
        max_d = opts.max_d;
    let q, modq;

    for (q = st, modq = modulus(q);
        modq > min_d;
        q = cmul(q, rd),
        modq *= mrd) {
        colidx = (colidx + cols.length - 1) %
            cols.length;
    }

    for (; modq < max_d; q = cmul(q, delta), modq *= md) {
        $.fillStyle = cols[colidx];
        $.beginPath();
        $.moveTo.apply($, q);
        $.lineTo.apply($, cmul(q, delta));
        $.lineTo.apply($, cmul(q, gamma));
        $.closePath();
        $.fill();
        colidx = (colidx + 1) % cols.length;
    }
}

function draw(t) {
    $.setTransform(1, 0, 0, 1, 0, 0);
    $.clearRect(0, 0, c.width, c.height);
    $.translate(Math.round(c.width / 2),
        Math.round(c.height / 2));
    let sc = Math.pow(root.mod_a, t);
    $.scale(sc, sc);
    $.rotate(root.arg_a * t);

    let min_d = 1 / sc,
        max_d = c.width * 2;
    let beg = root.a;

    for (let i = 0; i < q; i++) {
        spiral(root.r, beg, root.a, root.b, {
            fill: ['#D43D2C',
                '#333838',
                '#2CC3D4'],
            i: i,
            min_d: min_d,
            max_d: max_d
        });
        beg = cmul(beg, root.b);
    }
}

function anim(ts?: number) {
    if (!fst) fst = ts;
    draw(((ts - fst) % (rep * 3)) / rep);
    states.update();
    window.requestAnimationFrame(anim);
}
anim();
