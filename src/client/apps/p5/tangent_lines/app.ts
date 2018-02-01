
/// <reference path='../p5.global.d.ts'/>

import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import dat = require('dat-gui');
// p5 version 0.5.10
// https://p5js.org/reference/#/p5/bezierTangent

const settings = {
    steps: 36
};

let v1, v2, outlineA, outlineB;

const Canvas = {
    alive: false,
    w: window.innerWidth,
    h: window.innerHeight,
    middle: new p5.Vector(),
    fluid: function () {
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.middle.x = round(this.w / 2);
        this.middle.y = round(this.h / 2);
        if (this.alive) {
            resizeCanvas(this.w, this.h);
        } else {
            let density = displayDensity();
            pixelDensity(density);
            createCanvas(this.w, this.h);
            this.alive = true;
        }
    }
};


function setup() {
    console.log('setup');
    Canvas.fluid();
    initGui();
    background(51);
    v1 = createVector(320, 30);
    v2 = createVector(width - 120, height - 30);
    textFont('Source Code Pro', 10);
    // noLoop();
}

function draw() {
    background(51);
    noFill();
    const mid = v1.copy().lerp(v2, 0.5);
    bezier(v1.x, v1.y, v1.x, mid.y, v2.x, mid.y, v2.x, v2.y);
    stroke(255, 141);
    noFill();
    fill(255);
    for (let i = 0; i <= settings.steps; i++) {
        const t = i / settings.steps;

        const x = bezierPoint(v1.x, v1.x, v2.x, v2.x, t);
        const y = bezierPoint(v1.y, mid.y, mid.y, v2.y, t);

        const tx = bezierTangent(v1.x, v1.x, v2.x, v2.x, t);
        const ty = bezierTangent(v1.y, mid.y, mid.y, v2.y, t);

        let a = atan2(ty, tx);
        a += PI / 2;
        const weighted = map(a, 3.14, 2.0, 1, 70);


        strokeWeight(1);
        stroke(100, 100, 200);
        line(x, y, 230, 96 + i * 14);
        ellipse(230, 96 + i * 14, 10, 10);
        text('' + a, 100, 100 + i * 14);

        strokeWeight(map(a, 3.14, 2.5, 4, 8));
        line(x, y, cos(a) * weighted + x, sin(a) * weighted + y);
        line(x, y, cos(a) * -weighted + x, sin(a) * -weighted + y);

        stroke(255, 240);
        strokeWeight(map(a, 3.14, 2.0, 2, 4));
        line(x, y, cos(a) * weighted + x, sin(a) * weighted + y);
        line(x, y, cos(a) * -weighted + x, sin(a) * -weighted + y);

        stroke(100, 100, 200);
        const r = map(a, 3.14, 2.0, 6, 18);
        ellipse(x, y, r, r);
    }
}

function windowResized() {
    v1 = createVector(320, 30);
    v2 = createVector(width - 120, height - 30);
    Canvas.fluid();
    background(51);
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(settings, 'steps', 10, 90, 1);
}

window['setup'] = setup;
window['draw'] = draw;
window['resize'] = windowResized;
