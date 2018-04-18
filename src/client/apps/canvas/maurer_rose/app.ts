
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

//
import dat = require('dat-gui');

// INITIAL SETUP

const canvas = document.getElementById('rose') as HTMLCanvasElement;
const cx = canvas.getContext('2d');

let settings = {
    n: 2,
    d: 20,
    maurer: 71,
    size: 400,
    rotate: 0,
    gg: 0,
    drawMaurer: true,
    colorize: false,
    drawRose: true,
};

let xStart, yStart;

const datgui = () => {
    const gui = new dat.GUI();

    let guiSettings = gui.addFolder('Settings');

    guiSettings
        .add(settings, 'n', 0, 20)
        .step(0.01)
        .onChange(draw);
    guiSettings
        .add(settings, 'd', 0, 30)
        .step(0.01)
        .onChange(draw);
    guiSettings
        .add(settings, 'maurer', 0, 360)
        .step(1)
        .onChange(draw);
    guiSettings
        .add(settings, 'size', 50, 1000)
        .step(5)
        .onChange(draw);
    guiSettings
        .add(settings, 'rotate', 0, 6.3)
        .step(1)
        .onChange(draw);
    guiSettings
        .add(settings, 'gg', 0, 500)
        .step(1)
        .onChange(draw);

    guiSettings.add(settings, 'drawMaurer', true).onChange(draw);
    guiSettings.add(settings, 'colorize', false).onChange(draw);
    guiSettings.add(settings, 'drawRose', true).onChange(draw);

    guiSettings.open();

    let guiRandomize = {
        randomize() {
            randomize();
        }
    };
    let guiSave = {
        save() {
            save();
        }
    };
    gui.add(guiRandomize, 'randomize');
    gui.add(guiSave, 'save');

    return gui;
};

window.addEventListener('resize', () => {
    canvas.width = document.body.offsetWidth;
    canvas.height = document.body.offsetHeight;

    xStart = canvas.width / 2;
    yStart = canvas.height / 2;

    draw();
});

canvas.width = document.body.offsetWidth;
canvas.height = document.body.offsetHeight;
xStart = canvas.width / 2;
yStart = canvas.height / 2;

cx.lineCap = 'round';

const deg2Rad = deg => (deg * Math.PI / 180);

let xPrev;
let yPrev;
function draw() {
    const {
        n,
        d,
        maurer,
        size,
        rotate,
        gg,
        drawMaurer,
        colorize,
        drawRose
    } = settings;

    let k = n / d;
    cx.clearRect(0, 0, canvas.width, canvas.height);
    // connecting rose on angle "Maurer"
    if (drawMaurer) {
        for (let i = 0; i <= 3600; i++) {
            if (colorize) {
                cx.strokeStyle = `hsl(${i / 10}, 100%, 50%)`;
            } else {
                cx.strokeStyle = 'white';
            }
            cx.lineWidth = 0.5;
            cx.beginPath();
            const rad = deg2Rad(maurer * i);
            const r = Math.sin(-k * rad - rotate) * size + Math.round(gg);
            const x = xStart + r * Math.cos(rad);
            const y = yStart + r * Math.sin(rad);
            if (i === 0) {
                cx.moveTo(x, y);
            } else {
                cx.moveTo(xPrev, yPrev);
            }
            xPrev = x;
            yPrev = y;
            cx.lineTo(x, y);
            cx.stroke();
        }
    }
    // drawing rose
    if (drawRose) {
        cx.beginPath();
        cx.strokeStyle = 'red';
        cx.lineWidth = 0.1;
        for (let i = 0; i < 3600 * Math.ceil(d); i++) {
            const rad = deg2Rad(i);
            const r = Math.sin(-k * rad - rotate) * size + Math.round(gg);
            const x = xStart + r * Math.cos(rad);
            const y = yStart + r * Math.sin(rad);
            cx.lineTo(x, y);
        }
        cx.stroke();
    }
}

// pre-render
draw();

const randomize = () => {
    Object.assign(settings, {
        n: Math.random() * 20,
        d: Math.random() * 30,
        maurer: Math.random() * 360,
        size: Math.random() * 1100 - 100,
        gg: Math.random() * 500
    });
    draw();
};

const save = () => {
    const image = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
    const link = document.createElement('a');
    document.body.appendChild(link);
    const now = new Date();
    const timeString = now.toTimeString().replace(/ /g, '_');
    link.href = image;
    link.setAttribute('download', `Maurer_Rose_${timeString}.png`);
    link.click();
};

datgui();
