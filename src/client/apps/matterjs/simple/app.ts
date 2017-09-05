
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);
console.log('hi');

import {Engine, Render, Bodies, World, Composite} from '../matter-js';

const engine = Engine.create();
const render = Render.create({
    element: document.body,
    engine,
    options: {
        wireframes: false,
    }
});
const boxA = Bodies.rectangle(400, 200, 80, 80);
const boxB = Bodies.rectangle(450, 50, 80, 80);
const ground = Bodies.rectangle(400, 610, 810, 60, {isStatic: true});
World.add(engine.world, [boxA, boxB, ground]);
Engine.run(engine);
Render.run(render);

// var canvas = document.createElement('canvas'),
//     context = canvas.getContext('2d');

// canvas.width = 800;
// canvas.height = 600;

// document.body.appendChild(canvas);

// (function render() {
//     var bodies = Composite.allBodies(engine.world);

//     window.requestAnimationFrame(render);

//     context.fillStyle = '#fff';
//     context.fillRect(0, 0, canvas.width, canvas.height);

//     context.beginPath();

//     for (var i = 0; i < bodies.length; i += 1) {
//         var vertices = bodies[i].vertices;

//         context.moveTo(vertices[0].x, vertices[0].y);

//         for (var j = 1; j < vertices.length; j += 1) {
//             context.lineTo(vertices[j].x, vertices[j].y);
//         }

//         context.lineTo(vertices[0].x, vertices[0].y);
//     }

//     context.lineWidth = 1;
//     context.strokeStyle = '#999';
//     context.stroke();
// })();
