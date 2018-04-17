
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

//
import {TimelineLite} from 'gsap';
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

const NS = 'http://www.w3.org/2000/svg';
const CW = 800;
const CH = 400;
const CW_H = CW * .5;
const CH_H = CH * .5;
const WW = 4;
const WH = 8;
const ROWS = Math.ceil(CH / WH);
const COLS = Math.ceil(CW / WW);

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = CW;
canvas.height = CH;

const ctx = canvas.getContext('2d');
ctx.font = '150px monospace';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

const waves = document.getElementById('waves');
waves.setAttribute('viewPort', `0 0 ${CW} ${CH}`);
const paths = [];

for (let i = 0; i < ROWS; i++) {
    paths.push({
        el: document.createElementNS(NS, 'path'),
        yPos: i,
        pts: Array(COLS).fill(0)
    });
    waves.appendChild(paths[i].el);
}

setInterval(updateTime, 1000);

function updateTime() {
    const now = new Date();
    const h = padZero(now.getHours());
    const m = padZero(now.getMinutes());
    const s = padZero(now.getSeconds());
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = '#000';
    ctx.fillText(`${h}:${m}:${s}`, CW_H, CH_H);

    const imgData = [];
    for (let i = 0; i < ROWS; i++) {
        const waveData = [];
        for (let j = 0; j < COLS; j++) {
            const pxData = ctx.getImageData(j * WW, i * WH, WW, WH).data;
            const amp = (1 - getAverage(pxData) / 255) * WH;
            waveData.push(amp);
        }

        tweenWave(waveData, i);
    }
}

function getAverage(data) {
    let res = 0;
    let c = 0;
    for (let i = 0; i < data.length; i += 4) {
        res += (data[i] + data[i + 1] + data[i + 2]) / 3;
        c++;
    }
    return res / c;
}

function padZero(str) {
    return `0${str}`.slice(-2);
}

function tweenWave(data, id) {
    const tl = new TimelineLite({
        onUpdate: () => {
            const d = `M0 ${paths[id].yPos * WH + WH * .5}${paths[id].pts.map((amp, i) => `q${WW * .5} ${amp * (1 - 2 * (i % 2))}, ${WW} 0`).join('')}`;

            paths[id].el.setAttribute('d', d);
        }
    });
    tl.to(paths[id].pts, .5, data);
}
