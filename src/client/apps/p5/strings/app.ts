
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// ref: https://codepen.io/Alca/pen/GEwbbo

require('p5');
// declare function beginPath();
// declare function beginShape();

// This is some of the worst code I've ever written

let my_line: p5.Vector[] = [];
let line_points: number;
let num_lines: number; ;

function mousePressed() {
    init();
    draw();
}

function init() {
    background(255);
    line_points = width / 10 / 2;
    num_lines = (height + 50) / 5;
    my_line = [];

    for (let i = 0; i <= line_points; i++) {
        my_line.push(createVector(map(i, 0, line_points, 0, width), height + 20));
    }
}

function draw() {
    for (let i = num_lines; i > 0; i--) {
        fill(random(255), random(255), random(255));
        beginShape();
        vertex(width + 50, -50);
        vertex(-50, -50);
        vertex(-50, my_line[0].y);
        for (let j = 0; j < my_line.length; j++) {
            my_line[j].x += random(-1, 1);
            my_line[j].y += random(-1, 1);
            curveVertex(my_line[j].x, my_line[j].y);

            my_line[j].y -= 5;
        }
        vertex(width + 50, my_line[my_line.length - 1].y);
        endShape(CLOSE);
    }
}

function vmin(viewport_percent) {
    let viewport_min_size = windowWidth > windowHeight
        ? windowHeight
        : windowWidth;
    viewport_min_size -= viewport_min_size * ((100 - viewport_percent) / 100);
    return viewport_min_size;
}

function setup() {
    createCanvas(vmin(80), vmin(80));
    init();
    noLoop();
}

window['setup'] = setup;
window['draw'] = draw;
// window['resize'] = windowResized;
window['mousePressed'] = mousePressed;
