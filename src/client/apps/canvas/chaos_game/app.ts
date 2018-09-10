
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

//

import dat = require('dat-gui');
import { range } from 'lodash-es';
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


const MAX_STEP = 1000;
const STEP_DURATION = 1;
const toplevel = document.getElementById('root');
let laststep = 0;

chaosGrid(7);

function chaosGrid(nbAttractors) {
    let i = 1;
    for (i; i < Math.pow(2, nbAttractors); i++) {
        const unPaddedRule = i.toString(2);
        const paddedRule = '0'.repeat(nbAttractors - unPaddedRule.length) + unPaddedRule;
        const rules = paddedRule.split('').reduce((prev, curr, i) => {
            if (Number(curr)) {
                prev.push(i);
            }
            return prev;
        }, []);

        const cell = document.createElement('div');
        toplevel.appendChild(cell);
        cell.className = 'cell';
        const rule = document.createElement('div');
        cell.appendChild(rule);
        rule.className = 'rule';
        rule.innerHTML = rules.toString();
        cell.id = rules.length ? rules.join('-') : 'x';
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        cell.appendChild(canvas);
        chaos({
            canvas,
            // radius: 0,
            height: 200,
            width: 200,
            maxSteps: 10000,
            stepDuration: 1,
            nbAttractors,
            rules
        } as any);
    }
}

///////////////////////////////////////////////////

function chaos({
    canvas,
    start = performance.now(),
    maxSteps = MAX_STEP,
    stepDuration = STEP_DURATION,
    nbAttractors = 3,
    angleOffset = 0,
    radius,
    regular = true,
    rules
}) {
    const points = init({
        canvas,
        angleOffset,
        maxSteps,
        nbAttractors,
        rules,
        radius,
        // height: 0,
        // width: 0,
    } as any);
    const ctx = canvas.getContext('2d');
    ctx.globalAlpha = 1;
    ctx.fillStyle = `hsla(${Math.floor(Math.random() * 360)}, 30%, 7%, 1)`; ;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `hsla(${Math.floor(Math.random() * 360)}, 77%, 45%, 1)`;

    let i = 0;
    for (i; i < maxSteps; i++) {
        ctx.globalAlpha = 0.8;
        drawCircle(ctx, points[i].x, points[i].y, 1);
        ctx.fill();
    }
}

///////////

function init({ canvas, angleOffset, maxSteps, nbAttractors, rules, radius, height, width }) {
    const ctx = canvas.getContext('2d');
    height = height || canvas.height;
    width = width || canvas.width;
    rules = rules || range(nbAttractors);
    radius = radius || .95 * Math.min(height, width) / 2;

    const center = { x: width / 2, y: height / 2 };
    const attractors = range(nbAttractors).map(i => {
        const angle = angleOffset + 0.5 * (nbAttractors + 4 * i) / nbAttractors;
        return {
            x: center.x + radius * Math.cos(angle * Math.PI),
            y: center.y - radius * Math.sin(angle * Math.PI)
        };
    });
    const o = {
        x: Math.random() * width,
        y: Math.random() * height
    };

    let points = [o];

    let prevDirection = 0;
    for (let i = 0; i < maxSteps; i++) {
        const direction =
            (prevDirection + rules[Math.floor(Math.random() * rules.length)]) %
            nbAttractors;
        prevDirection = direction;
        const lastPoint = points[i];
        const attractor = attractors[direction];
        const newPoint = {
            x: (lastPoint.x + attractor.x) / 2,
            y: (lastPoint.y + attractor.y) / 2
        };
        points.push(newPoint);
    }
    return points;
}

function drawCircle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
}
