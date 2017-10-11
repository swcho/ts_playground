
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// ref: https://codepen.io/Alca/pen/GEwbbo

require('p5');
let canvas: p5.Renderer2D, ctx: p5.CanvasRenderingContext2D;

declare function beginPath();
declare function beginShape();
declare function endShape();

let colors: p5.Color[];

const ROTATE = true;

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    ctx = canvas.drawingContext;
    colors = [
        color('red'),
        color('blue'),
        color('green'),
        color('yellow'),
        color('white'),
        color('magenta'),
    ];
}


function draw() {
    background(0);

    stroke(255);
    strokeWeight(2);
    noFill();

    let time = Date.now() / 250;
    let count = 6;
    let r = 100;
    let a = r * cos(PI / count);
    let r3 = r / 3;
    let r3_ = r3 * 4;
    let ROT = TAU / count;
    let timeROT = time / 10;

    translate(width / 2, height / 2);

    push();

    if (ROTATE) {
        rotate((ROT / 2 + timeROT) % TAU);
    }
    textSize(14);

    for (let i = 0; i < count; i++) {
        push();

        let v = createVector(r, 0);

        stroke(colors[i]);

        rotate(i * ROT);
        translate(v.x, v.y);
        rotate(2 * ROT);
        text('' + i, 0, 0);

        line(-r3, 0, r3_, 0);

        pop();
    }

    pop();

    push();

    ctx.beginPath();
    let offset = ROTATE ? (timeROT + ROT / 2) : 0;
    for (let i = 0; i < count; i++) {
        let t = i * ROT + offset;
        let x = cos(t) * r;
        let y = sin(t) * r;
        if (i === 0) {
            ctx.moveTo(x, y);
        }
        else {
            ctx.lineTo(x, y);
        }
    }
    ctx.clip();

    let count2 = 3;
    let count3 = 40;
    let ROT_2 = HALF_PI / count2;
    let ROT_3 = TAU / count3;
    let w = r / count3 * 2;

    for (let j = 0; j < count2; j++) {

        let t_ = j * ROT_2;

        beginShape();

        for (let i = 0; i < count3; i++) {

            let t = i * ROT_3;

            curveVertex(
                map(i, 1, count3 - 2, -r, r),
                cos(t + t_ + time) * r / 10 * 3
            );
        }

        endShape();
    }

    pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

window['setup'] = setup;
window['draw'] = draw;
window['resize'] = windowResized;
