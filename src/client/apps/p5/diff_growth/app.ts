
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// ref: https://codepen.io/Alca/pen/GEwbbo
// / <reference path='../p5.global.d.ts'/>

declare function beginPath();
declare function beginShape();
declare const DEGREES;
declare function angleMode(value?);
declare function endShape(value?);

console.clear();

let nodes: Node[] = [],
    centerX,
    centerY,
    divisions = 10,
    radius = 100,
    scalar = 0.5,
    rForce = -1.0,
    rThresh = 100,
    dThresh = 20,
    aForce = 0.2,
    aThresh = 10;

const setup = () => {
    createCanvas(windowWidth, windowHeight);
    centerX = width / 2;
    centerY = height / 2;
    angleMode(DEGREES);
    frameRate(10);

    reset();
};

const draw = () => {
    push();
    translate(centerX, centerY);
    scale(scalar);

    stroke(0);
    fill(0);
    nodes.forEach(n => n.display());

    noStroke();
    fill(255, 255, 0, 3);
    beginShape();
    nodes.forEach(n => vertex(n.pos.x, n.pos.y));
    endShape(CLOSE);

    pop();

    rejectAll();
    // edgeSplit();
    attractNeighbors();
};

const rejectAll = () => {
    nodes.forEach((ni, i) => {
        nodes.forEach((nj, j) => {
            if (i !== j) {
                if (nj.pos.dist(ni.pos) < rThresh) {
                    let newPos = p5.Vector.lerp(
                        ni.pos,
                        nj.pos,
                        rForce / nodes.length
                    );
                    ni.pos = newPos;
                }
            }
        });
    });
};

const growMidpoint = (vec1, vec2) => {
    let d = p5.Vector.lerp(vec1, vec2, 0.5);
    let bulb = new Node(d);
    return bulb;
};

const edgeSplit = () => {
    nodes.forEach((n, i) => {
        let neighbor = i + 1;
        if (neighbor > nodes.length - 1) neighbor = 0;
        if (n.pos.dist(nodes[neighbor].pos) > dThresh) {
            let bulb = growMidpoint(n.pos, nodes[neighbor].pos);
            nodes.splice(neighbor, 0, bulb);
        }
    });
};

const attractNeighbors = () => {
    nodes.forEach((n, i) => {
        let right = i + 1;
        let left = i - 1;
        if (right > nodes.length - 1) {
            right = 0;
        }
        if (left < 0) {
            left = nodes.length - 1;
        }
        if (n.pos.dist(nodes[right].pos) > aThresh) {
            let d = p5.Vector.lerp(n.pos, nodes[right].pos, aForce);
            n.pos = d;
        }
        if (n.pos.dist(nodes[left].pos) > aThresh) {
            let d = p5.Vector.lerp(n.pos, nodes[left].pos, aForce);
            n.pos = d;
        }
    });
};

const reset = () => {
    background(30);

    nodes = [];

    for (let i = 0; i < divisions; i++) {
        let vec = createVector(radius, 0);
        let angle = 360 / divisions * i + random(-10, 10);
        vec.rotate(angle);
        let node = new Node(vec);
        nodes.push(node);
    }
};

const keyPressed = () => {
    reset();
};

const mousePressed = () => {
    reset();
};

class Node {
    pos;
    constructor(vector) {
        this.pos = vector;
    }

    display() {
        ellipse(this.pos.x, this.pos.y, 10, 10);
    }
}

window['setup'] = setup;
window['draw'] = draw;
window['keyPressed'] = keyPressed;
window['mousePressed'] = mousePressed;
// window['resize'] = resize;
