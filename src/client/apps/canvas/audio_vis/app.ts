
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

import dat = require('dat-gui');
const CONFIG = {
    R: 150,
    r: 80,
    da: 2,
};

let gui = new dat.GUI();
gui.add(CONFIG, 'R', 100, 200).step(1);
gui.add(CONFIG, 'r', 10, 100).step(1);
// gui.add(CONFIG, 'da', 0, 360).step(1);

//
// audio vars
let URL = require('./Kevin_MacLeod_-_Camille_Saint-Sans_Danse_Macabre_-_Finale.mp3');
    // 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/222579/Kevin_MacLeod_-_Camille_Saint-Sans_Danse_Macabre_-_Finale.mp3';
let audioCtx = new AudioContext();
let nodeAnalyzer = audioCtx.createAnalyser();
nodeAnalyzer.fftSize = 1024; // [32, 64, 128, 256, 512, 1024, 2048]
console.log(nodeAnalyzer.frequencyBinCount);
let dataArray = new Uint8Array(nodeAnalyzer.frequencyBinCount);
let audioBuffer: AudioBuffer, nodeSourceBuffer: AudioBufferSourceNode;
let stop = true;
let tiempo = 0,
    progress = 0;
// let progress = 0;

// canvas vars
let canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let cw = (canvas.width = window.innerWidth),
    cx = cw / 2;
let ch = (canvas.height = window.innerHeight),
    cy = ch / 2;
// let R = 150;
// let r = 80;
// let da = 2; // delta angle
let cos = Math.cos(CONFIG.da * Math.PI / 180);
let sin = Math.sin(CONFIG.da * Math.PI / 180);
let requestId = null;

// A U D I O
const boton = document.getElementById('boton');

function loadAudio(url) {
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
        boton.style.display = 'block';
        audioCtx.decodeAudioData(request.response, function (buffer) {
            audioBuffer = buffer;
        });
    };
    request.send();
}

function playAudio() {
    nodeSourceBuffer = audioCtx.createBufferSource();
    nodeSourceBuffer.buffer = audioBuffer;
    nodeSourceBuffer.connect(nodeAnalyzer);
    nodeAnalyzer.connect(audioCtx.destination);
    nodeSourceBuffer.start(audioCtx.currentTime, progress);
}

function stopAudio() {
    nodeSourceBuffer.stop();
}

function audio() {
    if (stop) {
        // si el audio está parado
        tiempo = audioCtx.currentTime - progress;

        stop = false;
        boton.innerHTML = 'Stop';
        playAudio();
    } else {
        // de lo contrario
        stop = true;
        boton.innerHTML = 'Click';
        stopAudio();
    }
}

loadAudio(URL);

// Utiliza el evento click para iniciar o detener la reproducción
boton.addEventListener('click', audio, false);

// C A N V A S
function lGrd(x, y, x1, y1, color) {
    let grd = ctx.createLinearGradient(x, y, x1, y1);
    grd.addColorStop(0, 'black');
    grd.addColorStop(0.5, color);
    grd.addColorStop(1, 'black');
    return grd;
}

class Barr {

    private a: number;
    // private dr: number;
    private cos: number;
    private sin: number;

    constructor(a: number) {
        this.a = a * Math.PI / 180; // angulo
        // this.dr = 0;
        this.cos = Math.cos(this.a);
        this.sin = Math.sin(this.a);
    }

    draw(radius: number, color: string, dr) {
        const x0 = (radius + dr) * this.cos;
        const y0 = (radius + dr) * this.sin;
        const x1 = x0 * cos - y0 * sin;
        const y1 = x0 * sin + y0 * cos;
        const x3 = (radius - dr) * this.cos;
        const y3 = (radius - dr) * this.sin;
        const x2 = x3 * cos - y3 * sin;
        const y2 = x3 * sin + y3 * cos;

        ctx.fillStyle = lGrd(x1, y1, x2, y2, color);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();
        ctx.fill();
    };
}

// bars
let barsRight: Barr[] = [];
let barsLeft: Barr[] = [];

for (let angle = 0; angle < 180; angle += 2 * CONFIG.da) {
    let b = new Barr(angle);
    barsRight.push(b);
}

// reflected parts
for (let angle = -2 * CONFIG.da; angle > -(180 + 2 * CONFIG.da); angle -= 2 * CONFIG.da) {
    let b = new Barr(angle);
    barsLeft.push(b);
}

function update(Ry: Barr[], radius: number, divisor: number, indexUnit: number, color: string) {
    for (let i = 0; i < Ry.length; i++) {
        let dr = dataArray[i * indexUnit];
        Ry[i].draw(radius, color, dr * dr * dr / divisor);
    }
}

// ctx.translate(cx, cy);
// ctx.rotate(-Math.PI / 2);

let n = ~~(nodeAnalyzer.frequencyBinCount / barsRight.length);
console.log('frequencyBinCount', nodeAnalyzer.frequencyBinCount, barsRight.length, n);

function animation() {
    requestId = window.requestAnimationFrame(animation);
    nodeAnalyzer.getByteFrequencyData(dataArray);
    ctx.clearRect(-cw, -ch, 2 * cw, 2 * ch);

    update(barsRight, CONFIG.R, 25000, n, 'hsla(178,96%,10%,1)');
    update(barsLeft, CONFIG.R, 25000, n, 'hsla(178,96%,10%,1)');

    update(barsRight, CONFIG.r, 200000, n, '#039691');
    update(barsLeft, CONFIG.r, 200000, n, '#039691');
}

function init() {
    if (requestId) {
        window.cancelAnimationFrame(requestId);
        requestId = null;
    }
    (cw = canvas.width = window.innerWidth), (cx = cw / 2);
    (ch = canvas.height = window.innerHeight), (cy = ch / 2);

    ctx.translate(cx, cy);
    ctx.rotate(-Math.PI / 2);

    // llama la función fotograma para iniciar la animación
    animation();
}

window.setInterval(function () {
    init();

    window.addEventListener('resize', init, false);

    // si el audio se está reproduciendo
    if (stop === false) {
        // calcula el progreso del audio en segundos
        progress = audioCtx.currentTime - tiempo;
    }

    if (audioBuffer && audioCtx.currentTime - tiempo >= audioBuffer.duration) {
        stop = true;
        boton.innerHTML = 'Click';
        progress = 0;
    }
}, 1000 / 30);
