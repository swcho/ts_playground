
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import * as Tone from 'tone';
import * as $ from 'jquery';

// https://github.com/Tonejs/Tone.js/blob/master/examples/oscillator.html

let osc = new Tone.Oscillator(
    300,
    'triangle'
).toMaster();

Tone.Transport.schedule(() => {
    Tone.Master.volume.value = -Infinity;
    osc.start();
    Tone.Master.volume.rampTo(-10, 0);

    // Tone.Master.volume.rampTo(0, 0.05);
    // Tone.Master.volume.rampTo(0, 0.05);
    // Tone.Master.volume.rampTo(-Infinity, 0.05);
}, 0);

Tone.Transport.schedule(() => {
    osc.frequency.value = 1000;
}, 1);

Tone.Transport.schedule(() => {
    osc.stop();
}, 2);

// https://github.com/Tonejs/Tone.js/blob/master/examples/envelope.html

const env = new Tone.AmplitudeEnvelope({
    attack: 0.11,
    decay: 0.21,
    sustain: 0.09,
    release: 1.2,
}).toMaster();

const osc2 = new Tone.Oscillator({
    partials: [3, 2, 1],
    type: 'custom',
    frequency: 'C#4',
    volume: -8,
}).connect(env);

Tone.Transport.schedule(() => {
    osc2.start();
    env.triggerAttack();
}, 3);

Tone.Transport.schedule(() => {
    env.triggerRelease();
    osc2.stop();
}, 4);

// https://github.com/Tonejs/Tone.js/blob/master/examples/noises.html

const noise = new Tone.Noise({
    volume: -10,
    type: 'brown',
}).toMaster();

Tone.Transport.schedule(() => {
    noise.start();
}, 5);

Tone.Transport.schedule(() => {
    noise.stop();
}, 6);

// https://github.com/Tonejs/Tone.js/blob/master/examples/player.html

const player = new Tone.Player({
    url: require('./FWDL.mp3'),
    loop: true,
}).toMaster();

Tone.Transport.schedule(() => {
    player.start();
}, 7);

Tone.Transport.schedule(() => {
    player.stop();
}, 8);

// https://github.com/Tonejs/Tone.js/blob/master/examples/mic.html

const mic = new Tone.UserMedia();
const analyzer = new Tone.Waveform(256);
mic.connect(analyzer);
mic.open();

Tone.Master.connect(analyzer);

const $canvas = $('<canvas/>').css({
    width: 400,
    height: 200,
});

$(document.body).append($canvas);
const elCanvas = $canvas.get(0) as HTMLCanvasElement;
const ctx = elCanvas.getContext('2d');

ctx.canvas.width = $canvas.width();
ctx.canvas.height = $canvas.height();

function drawLoop() {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    requestAnimationFrame(drawLoop);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const values = analyzer.getValue();
    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'black';
    ctx.moveTo(0, (values[0] + 1) / 2 * canvasHeight);
    const len = values.length;
    values.forEach((value, i) => {
        const val = (value + 1) / 2;
        const x = canvasWidth * (i / (len - 1));
        const y = val * canvasHeight;
        ctx.lineTo(x, y);
        ctx.stroke();
    });
}
drawLoop();

Tone.Transport.schedule(() => {
}, 9);

Tone.Transport.schedule(() => {
    mic.close();
}, 10);

// https://github.com/Tonejs/Tone.js/blob/master/examples/mixer.html

function makeFader(trackUrl: string) {
    const player = new Tone.Player({
        url: trackUrl,
        loop: true,
    });
    const solo = new Tone.Solo();
    const panVol = new Tone.PanVol();
    player.chain(panVol, solo, Tone.Master);
    // player.toMaster();
    return {
        player,
        solo,
        panVol,
    };
}

const bass = makeFader(require('../bass.mp3'));
const chords = makeFader(require('../chords.mp3'));
const drone = makeFader(require('../drone.mp3'));
let start = 11;
const units = 8;
Tone.Transport.schedule(() => {
    bass.player.start();
}, start);
start += units;
Tone.Transport.schedule(() => {
    chords.player.start();
}, start );
start += units;
Tone.Transport.schedule(() => {
    drone.player.start();
}, start);
start += units;

Tone.Transport.start();
