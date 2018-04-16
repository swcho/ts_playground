
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
import * as States from 'stats.js';

console.log(__filename);

//

import dat = require('dat-gui');
// const CONFIG = {
//     division: 25,
//     add: 0.1,
//     usePrev: false,
//     noFade: false,
// };

// let gui = new dat.GUI();
// gui.add(CONFIG, 'division', 0.01, 50).step(0.01);
// gui.add(CONFIG, 'add', -1, 1).step(0.1);
// gui.add(CONFIG, 'usePrev');
// gui.add(CONFIG, 'noFade');

/* my editor width                                                           */
/*	if( you.read(code.bellow) && you.strenght != strong )
				you.eye.setStatus(bleeding);
		==== let's begin. ==== */
console.clear();

// classes
// end classes

let canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, w, h, vmin, vr, gui, stats; // template variables
const opts: {
    grid?: number;
    size?: number;
} = {
    size: 4,
};
let loop: () => void;

function opt(name, value, min?, max?) {
    opts[name] = value;
    return gui.add(opts, name, min, max);
}

function initGui() {
    stats = new States();
    stats.showPanel(0);
    stats.domElement.style.position = 'absolute';
    document.body.appendChild(stats.domElement);
    // let panel = stats.addPanel( new Stats.Panel( 'caption', '#ff8', '#221' ) );
    // panel.update(value, maxValue);
    /* i love bad short opts ^__^ like q or qwe */
    gui = new dat.GUI();
}

function initCanvas() {
    /* i love DOM */
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    document.body.style.padding = '0px';
    document.body.style.margin = '0px';
    document.body.style.overflow = 'hidden';
    ctx = canvas.getContext('2d');
}

let frame, cam, n: number, c: number;
function start() { // objects generation and initialization
    cam = { pos: [0, 0], };
    frame = 0;
    n = 1;
    c = 0;
}

let prevFrameForColor = 0;

loop = () => {
    stats.begin();
    // ctx.fillStyle = `rgba(0,0,0, ${Math.pow(opts.clear, 2)})`;
    // ctx.fillRect(0,0, w,h);
    ctx.save();

    // drawGrid();
    // ctx.translate((w / 2 | 0) - cam.pos[0], (h / 2 | 0) - cam.pos[1]);

    // ctx.beginPath();
    // ctx.strokeStyle = '#fff';
    // ctx.moveTo(0, 0);
    // ctx.arc(0, 0, vr, 0, Math.PI * 2, false);
    // ctx.stroke();

    for (let i = 0; i < 512; ++i) {
        if (n === 1) {
            c += 130;
            console.log('color changed', prevFrameForColor, frame, frame - prevFrameForColor);
            prevFrameForColor = frame;
        }
        ctx.fillStyle = `hsl(${c}, 50%, 50%)`;
        ctx.fillRect(
            opts.size * ((n & (0x7f)) - 1),
            opts.size * ((n >> 7) & 0x7f),
            // opts.size * ((n & (0xff))),
            // opts.size * ((n >> 8) & 0xff),
            opts.size, opts.size
        );
        // let l = (n & 1) ^ ((n >> 3) & 1);
        let l = (n & 1) ^ ((n >> 3) & 1);
        // console.log(l);
        n = n >> 1;
        n = n ^ (l << 15);
        // n = n | (l << 15);
    }

    ++frame;

    ctx.restore();
    requestAnimationFrame(loop);
    stats.end();
};

/* i love full screen */
function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    vmin = Math.min(w, h);
    vr = vmin / 2;
}

function init() { // controls and template initialization
    initGui();
    initCanvas();
    resize();
    window.addEventListener('resize', resize, false);

    // aspect ratio warning
    if (w / h > 2.5) { let t; document.body.appendChild(t = document.createElement('div')); t.textContent = 'Pen don\'t optimized for toooooo wide screens'; t.setAttribute('style', 'color: #fff; position: absolute; left: 0px; bottom: 0px; font-size: 10vh'); setTimeout(() => t.style.display = 'none', 2000); }

    ctx.translate(0.5, 0.5); // make lines crisp

    opt('halt!', () => loop = () => { });
    opt('reset', start);
    opt('size', 4, 1, 10).step(1);
    // opt('test', 5, 0, 10).step(2).listen().onChange(console.log);

    start(); // init/reset pen content
    loop();
}

init(); // i make it for you...

function drawGrid() {
    if (!opts.grid)
        return;
    let gridSize = 1 << (opts.grid - 1);
    ctx.beginPath();
    for (let i = ((w / 2 | 0) - cam.pos[0]) % gridSize; i < w; i += gridSize) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
    }
    for (let i = ((h / 2 | 0) - cam.pos[1]) % gridSize; i < h; i += gridSize) {
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
    }
    ctx.strokeStyle = 'rgba(0,255,0,0.25)';
    ctx.stroke();
}
