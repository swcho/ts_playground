
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

// https://codepen.io/vladzholud/pen/amdNYP

import './style.scss';
import * as Hammer from 'hammerjs';

let canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
let ctx = canvas.getContext('2d');
let scaleFactor = backingScale(ctx);
if (scaleFactor > 1) {
    canvas.width = canvas.width * scaleFactor;
    canvas.height = canvas.height * scaleFactor;
    let ctx = canvas.getContext('2d');
}
let mouseIsDown = 0;
let touchActive = 1;

declare global {
    interface Window {
        requestAnimFrame;
        cancelRequestAnimFrame;
    }
}

window.requestAnimFrame = (function () {
    // @ts-ignore: TS2551
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window['mozRequestAnimationFrame'] ||
        window['oRequestAnimationFrame'] ||
        window['msRequestAnimationFrame'] ||
        function (/* function */ callback, /* DOMElement */ element) {
            return window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelRequestAnimFrame = (function () {
    return window.cancelAnimationFrame ||
        window['webkitCancelRequestAnimationFrame'] ||
        window['mozCancelRequestAnimationFrame'] ||
        window['oCancelRequestAnimationFrame'] ||
        window['msCancelRequestAnimationFrame'] ||
        clearTimeout;
})();


// Easings
let easeInCubic = function (pos) { return Math.pow(pos, 3); };
let strokeEase = function (pos) { return Math.pow(pos, 7); };
let dynamics = easeInCubic;

// Unchangeable vars
const quanX = 10; // 19
let numberOfSides = 30;
let nudgeKoef;
let nudgeAnim;
let downX, downDist, oldDist, bd;
let bMob = 2;
let bMobNew = bMob;
let newPinch;
let startPos: [number, number][] = [];
let allXY = [];
let newXY = [];
let Polygone: {
    calc?: number[];
    stroke?: number[];
} = {
};


// Changeable vars
let w, h, canX, canY, maxD, minWidth, maxWidth, r;

// Event listeners
window.addEventListener('resize', getReady, true);
canvas.addEventListener('mousemove', mouseXY, false);
document.body.addEventListener('mouseup', mouseUp, false);
canvas.addEventListener('mousedown', mouseDown, false);

canvas.addEventListener('touchstart', touchDown, false);
canvas.addEventListener('touchmove', touchXY, true);
canvas.addEventListener('touchend', touchUp, false);

// Hammer pinch
let hammer = new Hammer.Manager(canvas, {
    recognizers: [
        [Hammer.Pinch, { enable: true }],
    ]
});

hammer.on('pinch', function (ev) {
    touchActive = 0;
    canX = (ev.center.x - canvas.offsetLeft) * scaleFactor;
    canY = (ev.center.y - canvas.offsetTop) * scaleFactor;
    startBulgeMob(ev.scale);
});
// hammer.off("pinch", function(ev) {
//   touchActive = 0;
// });


// Pre-calculate
getReady();

// Action
start();

function start() {
    calcNew(allXY);
    getNewAttr(Polygone);
    drawCanvas();
    window.requestAnimFrame(start);
}


// Pre-calculate functions

function getStartCoords() {
    let x = w / (quanX + 1);
    for (let i = quanX * quanX; i--; ) {
        startPos[i] = [((i + 1) - Math.floor(i / quanX) * quanX) * x, Math.ceil((i + 1) / quanX) * x];
    }
}

function getAllPolygonesXY() {
    for (let i = quanX * quanX; i--; ) {
        allXY[i] = [];
        getPolygoneXY(allXY[i], startPos[i][0], startPos[i][1]);
    }

    function getPolygoneXY(arr, Xcenter, Ycenter) {
        for (let i = numberOfSides; i--; ) {
            arr[i] = [];
            arr[i][0] = Xcenter + r * Math.cos(i * 2 * Math.PI / numberOfSides);
            arr[i][1] = Ycenter + r * Math.sin(i * 2 * Math.PI / numberOfSides);
        }
    }

}

function copyArray(old, copy) {
    for (let i = old.length; i--; ) {
        copy[i] = [];
        copyPoly(old[i], i);
    }
    function copyPoly(arr, a) {
        for (let i = arr.length; i--; ) {
            copy[a][i] = old[a][i].slice(0);
        }
    }
}

// -------------




function calcNew(array) {
    for (let i = array.length; i--; ) {
        if (Polygone.calc[i] === 1) {
            recalcPoly(array[i], i);
        }
    }
    function recalcPoly(arr, a) {
        for (let i = arr.length; i--; ) {
            recalcXY(arr[i][0], arr[i][1], a, i);
        }
    }
    function recalcXY(x: number, y: number, a: number, b: number) {
        let distance = Math.sqrt((canX - x) * (canX - x) + (canY - y) * (canY - y));

        if (distance < maxD) {
            // newXY[a][b][0] = x + (canX - x) * dynamics(1 - distance / maxD) * nudgeKoef;
            // newXY[a][b][1] = y + (canY - y) * dynamics(1 - distance / maxD) * nudgeKoef;
        }
        else {
            newXY[a][b][0] = allXY[a][b][0];
            newXY[a][b][1] = allXY[a][b][1];
        }
    }
}

function drawAllPolygones(arr) {

    for (let i = arr.length; i--; ) {
        if (Polygone.calc[i] === 1) {
            drawPolygone(arr[i], i);
        }
        else {
            drawCircle(i);
        }
    }

    function drawCircle(num) {
        ctx.beginPath();
        ctx.arc(startPos[num][0], startPos[num][1], r, 0, Math.PI * 2, false);
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = Polygone.stroke[num];
        ctx.stroke();
    }

    function drawPolygone(pol, num) {
        ctx.beginPath();
        ctx.moveTo(pol[0][0], pol[0][1]);

        for (let i = pol.length; i--; ) {
            ctx.lineTo(pol[i][0], pol[i][1]);
        }
        ctx.closePath();
        // ctx.fillStyle = "#FFF";
        // ctx.fill();
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = Polygone.stroke[num];
        ctx.stroke();
    }

}

function getNewAttr(arr) {
    arr.stroke = [];
    arr.calc = [];
    for (let i = 0; i < startPos.length; i++) {
        let distance = Math.sqrt((canX - startPos[i][0]) * (canX - startPos[i][0]) + (canY - startPos[i][1]) * (canY - startPos[i][1]));
        if (distance < maxD) {
            let a = calcPercentage(0, maxD, distance, maxWidth, minWidth);
            arr.stroke[i] = minWidth + (strokeEase(calcPercentage(0, maxD, distance, maxWidth, minWidth) / maxWidth) * a);
        }
        else {
            arr.stroke[i] = minWidth;
        }

        if (distance < maxD + r) {
            arr.calc[i] = 1;
        }
        else { arr.calc[i] = 0; };
    }
}


function drawCanvas() {
    // ctx.save();
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, w, h);
    drawAllPolygones(newXY);
    // ctx.restore();
}


// Get ready

function getReady() {
    let newW = Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.85);
    canvas.width = newW * scaleFactor; // 800
    canvas.height = canvas.width;
    // set css
    document.getElementById('wrapper').style.height = window.innerHeight + 'px';
    canvas.style.width = newW + 'px';
    canvas.style.height = newW + 'px';
    canvas.style.margin = (0 - newW) * 0.5 + 'px 0 0 ' + (0 - newW) * 0.5 + 'px';
    // set vars
    w = canvas.width;
    h = canvas.height;
    canX = w / 2;
    canY = h / 2;
    minWidth = w / 500;
    maxWidth = w / 42; // 40
    r = w / 47; // w/39
    maxD = w / 2;
    downDist = w / 15;
    oldDist = downDist;
    bd = w / 8;
    nudgeKoef = calcPercentage(-1 * bd, bd, oldDist, 1, -3); ;
    // First pre-calculate
    getStartCoords();
    getAllPolygonesXY();
    copyArray(allXY, newXY);
    getNewAttr(Polygone);
    // First draw
    drawCanvas();
}

function startBulge() {
    downX = canX;
    bulge();

    function bulge() {
        nudgeAnim = window.requestAnimFrame(bulge);

        let newDist = oldDist + (canX - downX);

        if (newDist >= bd) {
            nudgeKoef = -3;
            downDist = bd;
        }
        else if (newDist <= -1 * bd) {
            nudgeKoef = 1;
            downDist = -1 * bd;
        }
        else {
            nudgeKoef = calcPercentage(-1 * bd, bd, newDist, 1, -3);
            downDist = newDist;
        }
    }
}

function startBulgeMob(s) {

    document.getElementById('pipiska').innerHTML = bMob + '   --   ' + bMobNew;

    newPinch = bMob * s;

    if (newPinch >= 3) {
        bMobNew = 3;
        nudgeKoef = -3;
    }
    else if (newPinch <= 0.2) {
        bMobNew = 0.2;
        nudgeKoef = 1;
    }
    else {
        nudgeKoef = calcPercentage(0.2, 3, newPinch, 1, -3);
        bMobNew = newPinch;
    }

}

function endBulge() {
    window.cancelRequestAnimFrame(nudgeAnim);
    oldDist = downDist;
}

// not visual

function calcPercentage(min, max, current, outMin, outMax) {
    return outMin + (((current - min) / (max - min)) * (outMax - outMin));
}

function mouseXY(e?) {
    e  = e || event;
    canX = (e.pageX - canvas.offsetLeft) * scaleFactor;
    canY = (e.pageY - canvas.offsetTop) * scaleFactor;
}

function mouseUp() {
    mouseIsDown = 0;
    mouseXY();
    endBulge();
}

function mouseDown() {
    mouseIsDown = 1;
    mouseXY();
    startBulge();
}

function touchXY(e?) {
    e = e || event;
    e.preventDefault();
    if (touchActive === 1) {
        canX = (e.targetTouches[0].pageX - canvas.offsetLeft) * scaleFactor;
        canY = (e.targetTouches[0].pageY - canvas.offsetTop) * scaleFactor;
    }
}

function touchDown() {
    mouseIsDown = 1;

    setTimeout(function () {
        touchXY();
    }, 5);
}
function touchUp() {
    mouseIsDown = 0;

    setTimeout(function () {
        touchActive = 1;
        bMob = bMobNew;
    }, 200);
}

function backingScale(context) {
    if ('devicePixelRatio' in window) {
        if (window.devicePixelRatio > 1) {
            return window.devicePixelRatio;
        }
    }
    return 1;
}

