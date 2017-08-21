
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

// https://codepen.io/darrylhuffman/pen/OgagYW

console.log(__filename);
console.log('hi');

const requestFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window['mozRequestAnimationFrame'] ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

const container = 'body';
const size = {
    x: $(container).width(),
    y: $(container).height()
};

const color = [157, 208, 136];
// const color = [99, 99, 99];

const RESOLUTION_SCALE = 1;

const BUNCH_SIZE = 20;
const PERLIN_SPEAD = 50;

const HAIR_DISTANCE = 10;
const exS = 4;

const canvas = $('<canvas/>').attr({ width: size.x * RESOLUTION_SCALE, height: size.y * RESOLUTION_SCALE }).appendTo(container);
const context = (canvas.get(0) as HTMLCanvasElement).getContext('2d');

const startTime = new Date().getTime();
let currentTime = 0;

const wind = [];
function initWind() {
    for (let x = 0; x <= size.x / BUNCH_SIZE + exS; x++) {
        wind.push([]);
        for (let y = 0; y <= size.y / BUNCH_SIZE + exS; y++) {
            wind[x].push([]);
        }
    }
}
initWind();

declare const noise;

function updateWind() {
    for (let x = 0; x <= size.x / BUNCH_SIZE + exS; x++) {
        for (let y = 0; y <= size.y / BUNCH_SIZE + exS; y++) {
            // wind[x][y] = noise.perlin3((currentTime + x) / PERLIN_SPEAD, (currentTime + y) / PERLIN_SPEAD, currentTime * 1.25);
            // wind[x][y] = noise.perlin2((currentTime + x) / PERLIN_SPEAD, currentTime * 1.25);
            wind[x][y] = noise.simplex2((currentTime + x) / PERLIN_SPEAD, currentTime * 1.25);
        }
    }
}

const hairs: Hair[] = [];

interface Position {
    x: number;
    y: number;
}

class Hair {
    private id;
    constructor(private position: Position, private drawShape, private shade) {
        this.id = hairs.length;
        hairs.push(this);
    }

    draw(pos: Position) {
        const {
            x,
            y,
        } = this.position;
        let windr = wind[Math.floor(x / BUNCH_SIZE)][Math.floor(y / BUNCH_SIZE)];
        if (!windr) {
            windr = 0;
        }
        context.save();
        context.translate(
            (this.position.x - HAIR_DISTANCE * 2) * RESOLUTION_SCALE,
            (this.position.y - HAIR_DISTANCE * 2) * RESOLUTION_SCALE);
        const dist = Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2);
        const BOUND = 10000;
        const ratio = (dist > BOUND) ? 0 : BOUND - dist / BOUND;
        // console.log(dist, ratio);
        context.rotate(windr * (Math.PI / 2 + ratio / 10000));
        // context.rotate(windr * Math.PI * 2);
        const light = Math.floor(40 * (1 + windr)) + this.shade;
        this.drawShape(light);
        context.restore();
    }
};

function hairShape(light) {
    context.fillStyle = 'rgb(' + (color[0] + light) + ',' + (color[1] + light) + ',' + (color[2] + light) + ')';
    context.fillRect(0, 80 * RESOLUTION_SCALE, 1 * RESOLUTION_SCALE, -80 * RESOLUTION_SCALE);
}

for (let x = 0; x < size.x / HAIR_DISTANCE + exS; x++) {
    for (let y = 0; y < size.y / HAIR_DISTANCE + exS; y++) {
        new Hair({
            x: x * HAIR_DISTANCE + Math.floor(Math.random() * HAIR_DISTANCE),
            y: y * HAIR_DISTANCE + Math.floor(Math.random() * HAIR_DISTANCE),
        },
        hairShape,
        Math.floor(Math.random() * 30));
    }
}


let pos = {
    x: 0,
    y: 0,
};
window.onmousemove = function(e) {
    const {
        clientX,
        clientY,
    } = e;
    pos = {
        x: clientX,
        y: clientY,
    };
};

function render() {
    let now = new Date().getTime();
    currentTime = (now - startTime) / 10000;
    context.clearRect(0, 0, size.x * RESOLUTION_SCALE, size.y * RESOLUTION_SCALE);
    context.fillRect(pos.x, pos.y, 2, 2);

    updateWind();
    for (let i = 0; i <= hairs.length; i++) {
        if (hairs[i]) {
            hairs[i].draw(pos);
        }
    }

    requestFrame(render);
}
render();
