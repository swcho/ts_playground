
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

// https://codepen.io/scorch/pen/owmzRj

console.log(__filename);
console.log('hi');

/// <reference path='def.d.ts'/>
import * as dat from 'dat-gui';
import {Stem} from './stem';

let canvas: HTMLCanvasElement, bg, wh, ctx: CanvasRenderingContext2D;

const param: Param = {
    leaf_thickness: 10,
    leaf_length: 40,
    leaf_density: 10,
    leaf_drawcnt: 20,
    color: '#FF0000',
};

const gui = new dat.GUI();
gui.addColor(param, 'color');
gui.add(param, 'leaf_thickness', 5, 14).step(1);
gui.add(param, 'leaf_length', 20, 60).step(1);
gui.add(param, 'leaf_density', 3, 20).step(2);
gui.add(param, 'leaf_drawcnt', 18, 30).step(1);

let CENTER_CANVAS = false;


let stems: Stem[] = [];

/**
 * 0 ~ 1 float value
 */
type Ratio = number;


/**
 *
 * 줄기
 *
 * @class Stem
 */

window.onload = init;

function init() {
    // create a canvas element
    canvas = document.createElement('canvas');

    // attach element to DOM
    document.body.appendChild(canvas);

    // background color (hsl)
    bg = { h: 320, s: 10, l: 100 };

    wh = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;

    ctx = canvas.getContext('2d');

    resizeCanvas();

    new Stem(canvas, param, stems);
    new Stem(canvas, param, stems);
    new Stem(canvas, param, stems);

    onUpdate();
}

function resizeCanvas() {
    // setup the canvas size to match the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    wh = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;

    // set the 0,0 point to the middle of the canvas, this is not necessary but it can be handy
    if (CENTER_CANVAS) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
    }

    fill(bg, 1);
}

// re-setup canvas when the size of the window changes
window.addEventListener('resize', resizeCanvas);

let s = 0;
function onUpdate() {
    window.requestAnimationFrame(function () { onUpdate(); });
    s = (s + 1) % 800;
    fill(bg, 0.002 + Math.sin(Math.pow(s / 800, 12) * 3.14) * 0.07);

    for (let i = 0; i < stems.length; i++) {
        stems[i].draw(ctx);
    }
}

// fill entire canvas with a preset color
function fill(hsl, amt) {
    ctx.beginPath(); // start path
    if (CENTER_CANVAS) {
        ctx.rect(- canvas.width / 2, - canvas.height / 2, canvas.width, canvas.height); // set rectangle to be the same size as the window
    } else {
        ctx.rect(0, 0, canvas.width, canvas.height); // set rectangle to be the same size as the window
    }
    ctx.fillStyle = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${amt})`; // use the rgb array/color for fill, and amt for opacity
    ctx.fill(); // do the drawing
}

