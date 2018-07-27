
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// ref: https://codepen.io/Alca/pen/GEwbbo

require('p5');
declare function beginPath();
declare function beginShape();
declare function endShape();

function windowResized() {
}


window.addEventListener('resize', resize, false);

let points = [];
let maxDist = 0;

function Point(x, y) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;

    this.speed = random() * 10 + 1;
    this.hue = random() * 360;
    this.weight = random() * 5 + 1;

    this.angle = random() * PI * 2;
    this.angleMod = random() * .1 + .05;
    if (random() < .5) this.angleMod *= -1;

    this.update = function () {
        this.prevX = this.x;
        this.prevY = this.y;
        this.x += cos(this.angle) * this.speed;
        this.y += sin(this.angle) * this.speed;
        if (random() < .1) this.angle = floor(random() * 8) * PI / 4;
        // this.angle += this.angleMod;
        // if (random() < .05){
        //   this.angleMod = random()*.1 + .05;
        //   if (random() < .5) this.angleMod *= -1;
        // }
    };
}

const START_COUNT = 1;

function setup() {
    createCanvas();
    colorMode(HSB, 360, 100, 100, 100);
    ellipseMode(CENTER);
    resize();
    points = [];
    for (let i = 0; i < START_COUNT; i++) {
        points.push(new Point(0, 0));
    }
    background(0);
    // frameRate(1); // For debugging
}

function draw() {
    background(0, 5);
    if (!points) return;

    translate(width / 2, height / 2);
    if (random() < .01 && points.length < 20) {
        points.push(new Point(0, 0));
    }
    for (let j = 0; j < points.length; j++) {
        let p = points[j];
        p.update();
        let distance = dist(0, 0, p.x, p.y);
        if (distance > maxDist) {
            points.splice(j, 1);
            j--;
            continue;
        }
        push();
        strokeWeight(p.weight * ((distance / maxDist) * 4));
        stroke(p.hue, 100, 100);

        push();
        for (let i = 0; i < 10; i++) {
            rotate(PI / 5);
            line(p.x, p.y, p.prevX, p.prevY);
        }
        pop();

        push();
        scale(-1, 1);
        for (let i = 0; i < 10; i++) {
            rotate(PI / 5);
            line(p.x, p.y, p.prevX, p.prevY);
        }
        pop();

        pop();
    }
}

function resize() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    maxDist = sqrt(width / 2 * width / 2 + height / 2 * height / 2);
    background(0);
}

window['setup'] = setup;
window['draw'] = draw;
window['resize'] = windowResized;
