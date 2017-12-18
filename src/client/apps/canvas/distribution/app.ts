
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

//

import dat = require('dat-gui');
const CONFIG = {
    division: 25,
};

let gui = new dat.GUI();
gui.add(CONFIG, 'division', 0.01, 50).step(0.01);

let c = document.getElementById('canvas') as HTMLCanvasElement;
let ctx = c.getContext('2d');
ctx.translate(c.width / 2, c.width / 2);
ctx.shadowColor = 'white';
ctx.shadowBlur = 20;

ctx.fillStyle = 'white';

let holding = -1;

c.addEventListener('mousedown', (e) => {
    let mouse = vec(e.clientX - c.offsetLeft - 250, e.clientY - c.offsetTop - 250);
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if (mag(sub(mouse, node)) < 10) {
            holding = i;
            break;
        }
    }
});

c.addEventListener('mousemove', (e) => {
    let mouse = vec(e.clientX - c.offsetLeft - 250, e.clientY - c.offsetTop - 250);
    if (holding !== -1) {
        if (mag(mouse) > 200)
            mouse = mul(normalize(mouse), 200);
        nodes[holding] = mouse;
    }
});

c.addEventListener('mouseup', (e) => {
    holding = -1;
});

let nodes = [];
for (let i = 0; i < 200; i++) {
    nodes.push(mul(normalize(vec(Math.random() - 0.5, Math.random() - 0.5)), Math.random() * 200));
}

function loop() {
    let newNodes = [];
    for (let i = 0; i < nodes.length; i++) {
        let p = nodes[i];
        let force = vec(0, 0);
        if (i !== holding) {
            for (let j = 0; j < nodes.length; j++) {
                if (i !== j) {
                    let direction = sub(nodes[j], p);
                    let dist = mag(direction);
                    force = add(force, mul(normalize(mul(direction, -1)), 1 / (dist * dist * dist) * 50000));
                }
            }
        }

        if (mag(force) > 1)
            force = mul(normalize(force), 1);
        let newPos = add(p, force);
        if (mag(newPos) > 200)
            newPos = mul(normalize(newPos), 200);
        newNodes.push(newPos);
    }
    nodes = newNodes;

    ctx.clearRect(-250, -250, 500, 500);
    ctx.beginPath();
    for (let n of nodes) {
        ctx.moveTo(n.x, n.y);
        ctx.arc(n.x, n.y, 7, 0, 2 * Math.PI);
    }
    ctx.fill();
    requestAnimationFrame(loop);
}

// Vector helper functions

function vec(x, y) {
    return {
        x: x,
        y: y
    };
}

function add(v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    };
}

function sub(v1, v2) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    };
}

function mul(v, n) {
    return {
        x: v.x * n,
        y: v.y * n
    };
}

function mag(v) {
    return Math.hypot(v.x, v.y);
}

function normalize(v) {
    let m = mag(v);
    return mul(v, 1 / m);
}


loop();
