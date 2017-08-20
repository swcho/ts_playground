
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);
console.log('hi');

const container = 'body';
const size = {
    x: $(container).width(),
    y: $(container).height()
};

// const color = [157, 208, 136];
const color = [99, 99, 99];

const resolution_scale = 1;

const bunchSize = 20;
const perlinSpread = 50;

const hairdist = 20;
const exS = 4;

const canvas = $('<canvas/>').attr({ width: size.x * resolution_scale, height: size.y * resolution_scale }).appendTo(container);
const context = (canvas.get(0) as HTMLCanvasElement).getContext('2d');

const startTime = new Date().getTime();
let currentTime = 0;

const wind = [];
function initWind() {
    for (let x = 0; x <= size.x / bunchSize + exS; x++) {
        wind.push([]);
        for (let y = 0; y <= size.y / bunchSize + exS; y++) {
            wind[x].push([]);
        }
    }
}
initWind();

declare const noise;

function updateWind() {
    for (let x = 0; x <= size.x / bunchSize + exS; x++) {
        for (let y = 0; y <= size.y / bunchSize + exS; y++) {
            // wind[x][y] = noise.perlin3((currentTime + x) / perlinSpread, (currentTime + y) / perlinSpread, currentTime * 1.25);
            // wind[x][y] = noise.perlin2((currentTime + x) / perlinSpread, currentTime * 1.25);
            wind[x][y] = noise.simplex2((currentTime + x) / perlinSpread, currentTime * 1.25);
        }
    }
}
console.log(wind);

let hairs = [];
let hair = function (position, shape, shade) {
    this.position = position;
    this.drawShape = shape;
    this.shade = shade;

    this.draw = function () {
        let windr = wind[Math.floor(this.position.x / bunchSize)][Math.floor(this.position.y / bunchSize)];
        if (!windr) {
            windr = 0;
        }
        context.save();
        context.translate((this.position.x - hairdist * 2) * resolution_scale, (this.position.y - hairdist * 2) * resolution_scale);
        context.rotate(windr * (Math.PI / 2));
        this.light = Math.floor(40 * (1 + windr)) + this.shade;
        this.drawShape(this.light);
        context.restore();

    };

    this.id = hairs.length;
    hairs.push(this);
};

const requestFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window['mozRequestAnimationFrame'] ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function hairShape(light) {
    context.fillStyle = 'rgb(' + (color[0] + light) + ',' + (color[1] + light) + ',' + (color[2] + light) + ')';
    context.fillRect(0, 80 * resolution_scale, 2 * resolution_scale, -80 * resolution_scale);
}


for (let x = 0; x < size.x / hairdist + exS; x++) {
    for (let y = 0; y < size.y / hairdist + exS; y++) {
        new hair({ x: x * hairdist + Math.floor(Math.random() * hairdist), y: y * hairdist + Math.floor(Math.random() * hairdist) }, hairShape, Math.floor(Math.random() * 30));
    }
}

function render() {
    let now = new Date().getTime();
    currentTime = (now - startTime) / 10000;
    context.clearRect(0, 0, size.x * resolution_scale, size.y * resolution_scale);

    updateWind();
    for (let i = 0; i <= hairs.length; i++) {
        if (hairs[i]) {
            hairs[i].draw();
        }

    }

    requestFrame(render);
}
render();
