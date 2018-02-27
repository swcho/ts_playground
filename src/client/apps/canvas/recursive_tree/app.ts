
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

//

import dat = require('dat-gui');
const CONFIG = {
    division: 25,
    add: 0.1,
    usePrev: false,
    noFade: false,
};

let gui = new dat.GUI();
gui.add(CONFIG, 'division', 0.01, 50).step(0.01);
gui.add(CONFIG, 'add', -1, 1).step(0.1);
gui.add(CONFIG, 'usePrev');
gui.add(CONFIG, 'noFade');

import $ = require('jquery');

$(document).ready(function () {
    let canvas = document.getElementById('forest') as HTMLCanvasElement;
    if (canvas.getContext) {
        let ctx = canvas.getContext('2d');
        recursiveTree(ctx, 800, 485, 80, -Math.PI / 2, 13, 13);
    }
});

let recursiveTree = function (ctx, startX, startY, length, angle, depth, branchWidth) {
    let rand = Math.random,
        newLength, newAngle, newDepth, maxBranch = 3,
        endX, endY, maxAngle = 2 * Math.PI / 4,
        subBranches;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    endX = startX + length * Math.cos(angle);
    endY = startY + length * Math.sin(angle);
    ctx.lineCap = 'round';
    ctx.lineWidth = branchWidth;
    ctx.lineTo(endX, endY);

    if (depth <= 2) {
        ctx.strokeStyle = '#27ae60';
    }
    else {
        ctx.strokeStyle = '#2c3e50';
    }
    ctx.stroke();

    newDepth = depth - 1;

    if (!newDepth) {
        return;
    }

    subBranches = (rand() * (maxBranch - 1)) + 1;

    branchWidth *= 0.7;

    for (let i = 0; i < subBranches; i++) {
        newAngle = angle + rand() * maxAngle - maxAngle * 0.5;
        newLength = length * (0.7 + rand() * 0.3);
        recursiveTree(ctx, endX, endY, newLength, newAngle, newDepth, branchWidth);
    }
};
