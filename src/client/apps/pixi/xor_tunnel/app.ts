
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import * as PIXI from 'pixi.js';
import './style.scss';

console.clear();

let rootEl = document.body;
let app = new PIXI.Application(
    window.innerWidth,
    window.innerHeight,
    {
        backgroundColor: 0x222222,
        antialias: false,
        preserveDrawingBufferboolean: false,
        clearBeforeRender: true
    } as any,
    true,
);

rootEl.appendChild(app.view);
app.view.classList.add('canvas_fx');
app['autoResize'] = true;

let vw = app.view.width;
let vh = app.view.height;
window.addEventListener('resize', handleResize);
function handleResize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    vw = app.view.width;
    vh = app.view.height;
}
let mx = 0;
let my = 0;
window.addEventListener('mousemove', handleMouseMove);
function handleMouseMove(event) {
    mx = event.clientX;
    my = event.clientY;
}

let stage = new PIXI.Container();

let FONT = {
    'e': [
        [1.01, 0], [1, 0], [0, 0], [0, 0.5], [1, 0.5], [0, 0.5], [0, 1], [1, 1]
    ],
    'm': [
        [0, 1.01], [0, 1], [0, 0], [0.5, 0], [0.5, 1], [0.5, 0], [1, 0], [1, 1]
    ],
    's': [
        [1.01, 0], [1, 0], [0, 0], [0, 0.5], [1, 0.5], [1, 1], [0, 1]
    ]
};

function makeLetter(character, size, color) {
    let letter = new PIXI.Graphics();
    letter['lineCap'] = 'round';
    letter.lineStyle(4, color, 1);
    drawLetter(letter, FONT[character], size);
    stage.addChild(letter);
    return letter;
}

function drawLetter(context: PIXI.Graphics, letter, size) {
    context.moveTo(
        letter[0][0] * size, // line drawing is buggy…
        letter[0][1] * size
    );
    letter.forEach(function (e, i) {
        context.lineTo(
            e[0] * size,
            e[1] * size
        );
    });
}

function drawWord(word, x, y, size, kerning) {
    let wordGfx = new PIXI.Graphics();
    let chars = word.split('');

    chars.forEach(function (e, i) {
        let letter = makeLetter(e, size, 0xffffff);
        let xpos = (size * i) + (kerning * i);
        let ypos = 0;
        letter.pivot.x = size * 0.5;
        letter.pivot.y = size * 0.5;
        letter.position.set(xpos, ypos);
        wordGfx.addChild(letter);
    });

    wordGfx.pivot.x = (
        ((word.length - 1) * size) + ((word.length - 1) * kerning)
    ) * 0.5;
    wordGfx.pivot.y = 0;
    wordGfx.position.x = x;
    wordGfx.position.y = y;
    app.stage.addChild(wordGfx);
    return wordGfx;
}

let esmes = drawWord(
  'esmes',
  vw * 0.5,
  vh * 0.5,
  vw * 0.15,
  vw * 0.0125
);

app.ticker.add(function (delta) {
    // text anim00tz
    let t = performance.now();
    esmes.position.set(vw * 0.5, vh * 0.5);
    esmes.position.x = (vw * 0.5) + (Math.sin(t / 750) * vw * 0.1);
    esmes.children.forEach(function (e, i, a) {
        e.position.y = (Math.sin((t / 250) + (i / a.length)) * vh * 0.1);
    });
});

// let basicText = new PIXI.Text('하정아 어지러워 ~~');
// basicText.x = app.renderer.width / 2;
// basicText.y = app.renderer.height / 2;
// basicText.anchor.set(0.5);
// app.stage.addChild(basicText);

let tunnel = new PIXI.Container();
app.stage.addChild(tunnel);
tunnel.x = vw * 0.5;
tunnel.y = vh * 0.5;
let circleCount = Math.round(Math.min(vw, vh) * 0.06125);

let circles = new Array(circleCount).fill(0).map(function (e, i) {
    let vmax = Math.max(vw, vh) * 1.5;
    let g = new PIXI.Graphics();
    g.beginFill(i % 2 === 1 ? 0xffffff : 0x000000);
    g.drawCircle(0, 0, (vmax * 0.5) - (i * (vmax / (circleCount * 2))));
    tunnel.addChild(g);
    return g;
});

app.ticker.add(function () {
    /* tunnel anim00tz */
    let t = performance.now();
    tunnel.position.set(vw * 0.5, vh * 0.5);
    tunnel.children.forEach(function (e, i, a) {
        // *
        e.x = Math.sin(t / 250 + (i / a.length) * Math.PI * 2) * vw * 0.05;
        e.y = Math.cos(t / 250 + (i / a.length) * Math.PI * 2) * vh * 0.05;
        // */
        let scale = (1 + Math.sin(t / 1000 + (i / a.length) * Math.PI * 2) * 0.125);
        e.scale = new PIXI.Point(scale, scale);
    });
});

// (app as any).render(stage);
app.render();
