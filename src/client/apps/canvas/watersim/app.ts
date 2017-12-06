
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

//
/* simple 2D Water Simulation

  idea and python code from:https://www.reddit.com/r/cellular_automata/comments/6jhdfw/i_used_1dimensional_cellular_automata_to_make_a/

    C L I C K / H O L D / R E L E A S E  I N S I D E
    T H E  P O O L  T O  A D D  W A T E R
*/

var width = 300;

var ground = new Array(width).fill(1);
ground[0] = ground[width - 1] = 100;

// Predictable randomize multi-sine for generating the ground
// from @shshaw, thx!
var twoPI = Math.PI * 4;
var placement;
var offset = Math.random() + 1.1;
let tmp;
for (let x = 1; x < width / 2; x++) {
    placement = (x / (width / 2)) * twoPI;
    ground[x] = tmp = 30 + 10 * ((Math.sin(placement) + Math.sin(offset * placement)) / 2);
}
/* my lame kinda random spiky ground...doh! */
var level = tmp; // Math.random()*50;
for (let x = width / 2; x < width - 1; x++) {
    ground[x] = level;
    level = Math.min(100, Math.max(0, level + Math.random() * 8 - 4));
}

// empty pool with a drip of water in the middle
var water = new Array(width).fill(0);
water[0] = water[width - 1] = 0;
water[Math.floor(width / 2)] = 250;

var energy = new Array(width).fill(0);

// put that thing into the DOM
var wrap = document.getElementById("wrap");
var html = "<div class='ww'></div><div class='gw'></div>";
for (let x = 0; x < width; x++) {
    var col = document.createElement("div");
    col.classList.add('col');
    col.innerHTML = html;
    wrap.appendChild(col);
}
var cols = document.getElementById("wrap").children; // ...for the renderer

// add the mouse actions
for (var i = 0; i < cols.length; i++) {
    (function (j) {
        cols[i].addEventListener("mousedown", function () {
            var time = Date.now();
            var index = j;
            window.onmouseup = function () {
                var diff = Date.now()  - time;
                window.onmouseup = null;
                water[index] = diff;
            }
        });
    })(i);
}

// calculate the next frame
function calc() {
    var dwater = new Array(width).fill(0);
    var denergy = new Array(width).fill(0);

    for (let x = 1; x < width - 1; x++) {
        if (ground[x] + water[x] - energy[x] > ground[x - 1] + water[x - 1] + energy[x - 1]) {
            var flow = Math.min(water[x], ground[x] + water[x] - energy[x] - ground[x - 1] - water[x - 1] - energy[x - 1]) / 4;
            dwater[x - 1] += flow;
            dwater[x] += -flow;
            denergy[x - 1] += -energy[x - 1] / 2 - flow;
        }

        if (ground[x] + water[x] + energy[x] > ground[x + 1] + water[x + 1] - energy[x + 1]) {
            var flow = Math.min(water[x], ground[x] + water[x] + energy[x] - ground[x + 1] - water[x + 1] + energy[x + 1]) / 4;
            dwater[x + 1] += flow;
            dwater[x] += -flow;
            denergy[x + 1] += -energy[x + 1] / 2 + flow;
        }
    }

    for (let x = 1; x < width - 1; x++) {
        water[x] = water[x] + dwater[x];
        energy[x] = energy[x] + denergy[x];
    }
}

// draw the next frame
function draw(terrain, water) {
    for (var i = 0; i < terrain.length; i++) {
        var col = cols[i].children;
        (col[0] as HTMLElement).style.height = Math.min(100 - terrain[i], water[i]) + "%";
        (col[1] as HTMLElement).style.height = terrain[i] + "%";
    }
}

// RUN it!
/* "use reqAnimFr instead of timeout, noob!"  hint from @shshaw, thx! */
function render() {
    requestAnimationFrame(render);
    calc();
    draw(ground, water);
}
requestAnimationFrame(render);
