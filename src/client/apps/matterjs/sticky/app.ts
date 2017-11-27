
/// <reference path='../../p5/p5.global.d.ts'/>
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';
require('p5');
import {
    Engine,
    World,
    Bodies,
    Body,
    Constraint,
    Composite,
    MouseConstraint,
    Mouse,
} from '../matter-js';

let engine = Engine.create();
let world = engine.world;

let chain: CreateChain = null;
let heatLines = [];

let distanceToCup = 10000;
let distanceFromCup = { size: 500, towards: true };
let firstAnimation = { max: 241, min: 171, percent: 1 };
let secondAnimation = { max: 170, min: 100, percent: 0 };
let thirdAnimation = { max: 241, min: 100, percent: 0 };

let marshmallow;

// ---------------
// Box Constructor
// ---------------

class Box {
    w;
    h;
    body;
    constructor(x, y, w, h, options) {
        this.w = w;
        this.h = h;
        this.body = Bodies.rectangle(x, y, w, h, options);
        World.add(world, this.body);
    }
}

let floor: Box;
let cup: Box;
let cupLeft: Box;
let cupRight: Box;
let cupHandle: Box;

function calculateLinks() {
    // 77 is the offset from the bottom and the top
    // 200 is the amount of space we want between the marshmallow and cup when hanging
    let spaceLeft = window.innerHeight - (125 + 100 + 77 + 200);
    let links = spaceLeft / 26;

    if (links < 3) {
        return Math.ceil(3);
    } else if (links > 6) {
        return Math.ceil(6);
    } else {
        return Math.ceil(links);
    }
}

// ------------
// Create chain
// ------------

class CreateChain {

    x: number;
    y: number;
    private hinges: Box[];
    private constraints: Constraint[];
    private chainLinks: number;
    private linkLength: number;
    constructor(x: number, y: number, chainLinks: number, linkLength: number) {
        this.x = x;
        this.y = y;
        this.hinges = [];
        this.constraints = [];
        this.chainLinks = chainLinks;
        this.linkLength = linkLength;
    }

    remove() {
        for (let i = 0; i < this.constraints.length; i++) {
            World.remove(world, this.constraints[i]);
        }

        chain = null;
    }

    init() {
        // Create hinges
        for (let i = 0; i < this.chainLinks; i++) {
            let isStatic = (i === 0) ? true : false;

            let anchor = new Box(this.x, this.y + (this.linkLength * i), 5, 5, {
                isStatic,
                collisionFilter: {
                    category: 0x0001
                }
            });

            this.hinges.push(anchor);
        }

        // Create links between hinges
        for (let i = 0; i < this.hinges.length; i++) {
            let constraint;

            if (i === this.chainLinks - 1) {
                constraint = Constraint.create({
                    bodyA: this.hinges[i].body,
                    bodyB: marshmallow.body,
                    pointB: { x: 0, y: (marshmallow.h / 2 * -1) + 12 },
                    length: this.linkLength,
                    damping: 0.5,
                    stiffness: 0.1,
                    label: 'marshmallowAttachment'
                });
            } else {
                constraint = Constraint.create({
                    bodyA: this.hinges[i].body,
                    bodyB: this.hinges[i + 1].body,
                    length: this.linkLength,
                    damping: 0.5,
                    stiffness: 0.1
                });
            }

            this.constraints.push(constraint);
            World.add(world, constraint);
        }
    }
}

function createChain() {
    chain = new CreateChain(width / 2, 50, calculateLinks(), 10);
    chain.init();
}

// --------------
// Heat particles
// --------------

class HeatParticle {

    private position: p5.Vector;
    constructor(private parent: HeatLine, private index: number, x: number, y: number) {
        this.position = createVector(x, y);
        this.index = 0;
    }

    render() {
        push();
        noStroke();
        fill('#f0d38d');
        ellipse(this.position.x, this.position.y, this.parent.particleSize, this.parent.particleSize);
        pop();
    }

    updatePos() {
        this.position.y -= 0.5;
        this.position.x = Math.sin((frameCount + this.index / 0.4) / 35) * 10 + this.parent.position.x;
    }

    checkPos() {
        if (this.position.y < this.parent.position.y - this.parent.height) {
            this.reset();
        }
    }

    reset() {
        this.parent.particleIndex += 1;
        this.index = this.parent.particleIndex;
        this.position.y = this.parent.position.y;
    }
}

// ----------
// Heat lines
// ----------

class HeatLine {

    position: p5.Vector;
    private particles: HeatParticle[];
    particleIndex: number;
    constructor(x: number, y: number, public height: number, public particleSize: number) {
        this.position = createVector(x, y);
        this.particles = [];
        this.particleIndex = 0;
        this.height = height;
        this.particleSize = particleSize;
    }

    render() {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].updatePos();
            this.particles[i].render();
            this.particles[i].checkPos();
        }
    }

    init() {
        let particleCount = this.height / (this.particleSize / 6);

        for (let i = 0; i < particleCount; i++) {
            this.particleIndex += 1;
            let particle = new HeatParticle(this, this.particleIndex, this.position.x, this.position.y + (i * this.particleSize / 6));
            this.particles.push(particle);
        }
    }
}

function populateHeatLines() {
    heatLines.push(new HeatLine(cup.body.position.x, cup.body.position.y - cup.h / 2, 50, 5));
    heatLines.push(new HeatLine(cup.body.position.x - 60, cup.body.position.y - cup.h / 2, 50, 5));
    heatLines.push(new HeatLine(cup.body.position.x + 60, cup.body.position.y - cup.h / 2, 50, 5));
    for (let i = 0; i < heatLines.length; i++) {
        heatLines[i].init();
    }
}

// -----------
// Cup + Floor
// -----------
// Change this to an object since we don't need it to construct anything

class CupFloor {

    constructor() {

    }

    destroy() {
        World.remove(world, [
            floor.body,
            cup.body,
            cupLeft.body,
            cupRight.body,
            cupHandle.body,
        ] as any);

        floor = null;
        cup = null;
        cupLeft = null;
        cupRight = null;
        cupHandle = null;
    }

    init() {
        // All of the magic numbers here are to position the elements relative to the marshmallow body
        floor = new Box(
            width / 2,
            height - 31.75, 320, 3.5,
            {
                isStatic: true,
                collisionFilter: {
                    category: COLLISION_CATEGORY_STATIC
                }
            }
        );
        cup = new Box(width / 2, height - 93, 259, 125.5, {
            isStatic: true,
            isSensor: true,
            label: 'cup',
            collisionFilter: {
                category: COLLISION_CATEGORY_STATIC
            }
        });
        cupLeft = new Box(width / 2 - 134.5, height - 93, 10, 125.5, { isStatic: true, collisionFilter: { category: COLLISION_CATEGORY_STATIC } });
        cupRight = new Box(width / 2 + 134.5, height - 93, 10, 125.5, { isStatic: true, collisionFilter: { category: COLLISION_CATEGORY_STATIC } });
        cupHandle = new Box(width / 2 + 153, height - 114, 31, 60.5, { isStatic: true, collisionFilter: { category: COLLISION_CATEGORY_STATIC } });
    }

}
let cupFloor = new CupFloor();

// ---------
// P5 Resize
// ---------

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    cupFloor.destroy();
    cupFloor.init();

    heatLines = [];
    populateHeatLines();

    marshmallow.body.isStatic = true;
    marshmallow.body.angle = 0;

    if (chain) {
        chain.remove();
    }
    createChain();

    marshmallow.body.isStatic = false;

    Body.setVelocity(marshmallow.body, {
        x: 0,
        y: 0
    });

    marshmallow.angularVelocity = 0;
    marshmallow.angularSpeed = 0;

    firstAnimation.percent = 0;
    secondAnimation.percent = 0;
    thirdAnimation.percent = 0;
}



// --------
// P5 Setup
// --------

let marshmallowBody: p5.Image;
let floorImg: p5.Image;
let cupImg: p5.Image;
let cupHandleImg: p5.Image;
let armLeft: Matter.Body;
let armRight: Matter.Body;
let legRight: Matter.Body;
let legLeft: Matter.Body;
let mouseConstraint: MouseConstraint;
const COLLISION_CATEGORY_MARSHMALLOW = 0x0001;
const COLLISION_CATEGORY_STATIC = 0x0002;
function setup() {

    // Setup the canvas
    let canvas = createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);

    // Setup the mouse events
    let mouse = Mouse.create(canvas.elt);
    mouse.pixelRatio = pixelDensity();

    mouseConstraint = MouseConstraint.create(
        engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2
            } as any
        }
    );
    mouseConstraint.collisionFilter.category = COLLISION_CATEGORY_STATIC;

    World.add(world, mouseConstraint);

    // Load all of the image assets
    marshmallowBody = loadImage(require('./body.png'));
    floorImg = loadImage(require('./ground.png'));
    cupImg = loadImage(require('./cup.png'));
    cupHandleImg = loadImage(require('./cupHandle.png'));

    // Create the boundaries
    cupFloor.init();


    // -----------
    // Marshmallow
    // -----------
    // The marshmallow code below is very messy and should be refactored into a constructor

    marshmallow = new Box(width / 2, 0, 80, 100, {
        density: 0.00001,
        label: 'marshmallow',
        collisionFilter: {
            category: COLLISION_CATEGORY_MARSHMALLOW,
            mask: 0x0002
        }
    });

    createChain();

    armLeft = Bodies.circle(width / 2 - 40, 300, 5, {
        collisionFilter: {
            category: COLLISION_CATEGORY_MARSHMALLOW
        } as any,
        density: 0.00001
    });

    armRight = Bodies.circle(width / 2 + 40, 300, 5, {
        collisionFilter: {
            category: COLLISION_CATEGORY_MARSHMALLOW
        } as any,
        density: 0.00001
    });

    legRight = Bodies.circle(width / 2 + 20, 300 + 50, 0.1, {
        collisionFilter: {
            category: COLLISION_CATEGORY_MARSHMALLOW
        } as any,
        density: 0.00001
    });

    legLeft = Bodies.circle(width / 2 - 20, 300 + 50, 0.1, {
        collisionFilter: {
            category: COLLISION_CATEGORY_MARSHMALLOW
        } as any,
        density: 0.00001
    });

    let constraintArmLeft = Constraint.create({
        bodyA: marshmallow.body,
        bodyB: armLeft,
        pointA: { x: -39, y: -20 },
        length: 40,
        damping: 0.5,
        stiffness: 1,
        label: 'limb'
    });

    let constraintArmRight = Constraint.create({
        bodyA: marshmallow.body,
        bodyB: armRight,
        pointA: { x: 39, y: -20 },
        length: 40,
        damping: 0.5,
        stiffness: 1,
        label: 'limb'
    });

    let constraintLegRight = Constraint.create({
        bodyA: marshmallow.body,
        bodyB: legRight,
        pointA: { x: 20, y: 49 },
        length: 30,
        damping: 0.5,
        stiffness: 1,
        label: 'limb'
    });

    let constraintLegLeft = Constraint.create({
        bodyA: marshmallow.body,
        bodyB: legLeft,
        pointA: { x: -20, y: 49 },
        length: 30,
        damping: 0.5,
        stiffness: 1,
        label: 'limb'
    });

    World.add(world, [
        armLeft,
        armRight,
        legRight,
        legLeft,
        constraintArmLeft,
        constraintArmRight,
        constraintLegRight,
        constraintLegLeft
    ] as any);

    // Create and initialize the heat lines
    populateHeatLines();

    // Start the engine
    Engine.run(engine);
}



// -------
// P5 Draw
// -------

function draw() {
    clear();

    // ----------------------
    // Outline matter objects
    // ----------------------

    push();
    let bodies = Composite.allBodies(engine.world);
    drawingContext.beginPath();
    for (let i = 0; i < bodies.length; i += 1) {
        let vertices = bodies[i].vertices;
        drawingContext.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j += 1) {
            drawingContext.lineTo(vertices[j].x, vertices[j].y);
        }
        drawingContext.lineTo(vertices[0].x, vertices[0].y);
    }

    drawingContext.lineWidth = 1;
    drawingContext.strokeStyle = '#9e9e9e';
    drawingContext.stroke();
    pop();


    if (cup) {
        // heatLines
        for (let i = 0; i < heatLines.length; i++) {
            heatLines[i].render();
        }
    }


    // --------------------
    // Draw the marshmallow
    // --------------------

    push();
    translate(marshmallow.body.position.x, marshmallow.body.position.y);
    rotate(marshmallow.body.angle);
    image(marshmallowBody, marshmallow.w / 2 * -1, marshmallow.h / 2 * -1, marshmallow.w, marshmallow.h);
    pop();


    // --------------
    // Draw the chain
    // --------------

    let allConstraints: Matter.Constraint[] = Composite.allConstraints(engine.world) as any;
    let marshmallowAttachment;

    // Rope hole at the top of the page
    if (chain) {
        push();
        noStroke();
        fill('black');
        ellipse(chain.x, chain.y, 25, 6);
        pop();
    }

    for (let i = 0; i < allConstraints.length; i++) {
        if (allConstraints[i].label === 'marshmallowAttachment') {
            marshmallowAttachment = allConstraints[i];
        }

        if (allConstraints[i].label !== 'Mouse Constraint') {
            push();
            strokeWeight(2.5);

            line(
                allConstraints[i].bodyA.position.x + allConstraints[i].pointA.x,
                allConstraints[i].bodyA.position.y + allConstraints[i].pointA.y,
                allConstraints[i].bodyB.position.x + allConstraints[i].pointB.x,
                allConstraints[i].bodyB.position.y + allConstraints[i].pointB.y
            );
            pop();
        }
    }

    // Rope attachment on top of head
    if (marshmallowAttachment) {
        push();
        noStroke();
        fill('black');
        translate(marshmallowAttachment.bodyB.position.x + marshmallowAttachment.pointB.x, marshmallowAttachment.bodyB.position.y + marshmallowAttachment.pointB.y);
        rotate(marshmallow.body.angle);
        ellipse(0, 0, 10, 3);
        pop();
    }

    // Draw arms
    push();
    strokeWeight(2.5);
    ellipse(armLeft.position.x, armLeft.position.y, 10, 10);
    ellipse(armRight.position.x, armRight.position.y, 10, 10);
    pop();

    // When the arms enter the cup, raise them
    if (cup) {
        if (marshmallow.body.position.y / height > 0.75 && marshmallow.body.position.x > cup.body.position.x - cup.w / 2 && marshmallow.body.position.x < cup.body.position.x + cup.w / 2) {
            Body.setVelocity(armLeft, { x: 0, y: -3 });
            Body.setVelocity(armRight, { x: 0, y: -3 });
        }
    }

    // Facial expression

    if (cup) {
        distanceToCup = Math.sqrt(Math.pow(marshmallow.body.position.x - cup.body.position.x, 2) + Math.pow(marshmallow.body.position.y - cup.body.position.y, 2));
    } else {
        distanceToCup = 1000;
    }

    if (distanceToCup <= firstAnimation.max && distanceToCup >= firstAnimation.min) {
        firstAnimation.percent = (distanceToCup - firstAnimation.min) / (firstAnimation.max - firstAnimation.min);
    }

    if (distanceToCup < secondAnimation.max && distanceToCup >= secondAnimation.min) {
        secondAnimation.percent = ((distanceToCup - secondAnimation.min) / (secondAnimation.max - secondAnimation.min) - 1) * -1;
    }

    if (distanceToCup < thirdAnimation.max && distanceToCup >= thirdAnimation.min) {
        thirdAnimation.percent = ((distanceToCup - thirdAnimation.min) / (thirdAnimation.max - thirdAnimation.min) - 1) * -1;
    }

    if (distanceToCup < secondAnimation.max) {
        firstAnimation.percent = 0;
    }

    if (distanceToCup > firstAnimation.max) {
        firstAnimation.percent = 1;
        secondAnimation.percent = 0;
    }

    // Marshmallow eye left
    push();
    translate(marshmallow.body.position.x, marshmallow.body.position.y);
    strokeWeight(3);
    noFill();
    rotate(marshmallow.body.angle);
    bezier(
        -20, -5 + (secondAnimation.percent * 5) + (secondAnimation.percent * -4),
        -20, -5 + (firstAnimation.percent * -7) + (secondAnimation.percent * 5) + (secondAnimation.percent * -4),
        -10, -5 + (firstAnimation.percent * -7) + (secondAnimation.percent * -4),
        -10, -5 + (secondAnimation.percent * -4)
    );
    pop();

    // Marshmallow eye right
    // The second parameter, (secondAnimation.percent * -4), is to move the item up when the animation happens
    push();
    translate(marshmallow.body.position.x, marshmallow.body.position.y);
    strokeWeight(3);
    noFill();
    rotate(marshmallow.body.angle);
    bezier(
        20, -5 + (secondAnimation.percent * 5) + (secondAnimation.percent * -4),
        20, -5 + (firstAnimation.percent * -7) + (secondAnimation.percent * 5) + (secondAnimation.percent * -4),
        10, -5 + (firstAnimation.percent * -7) + (secondAnimation.percent * -4),
        10, -5 + (secondAnimation.percent * -4)
    );
    pop();

    // Marshmallow mouth
    push();
    stroke('#000');
    strokeJoin(ROUND);
    strokeWeight(2);
    fill('black');
    translate(marshmallow.body.position.x, marshmallow.body.position.y);
    rotate(marshmallow.body.angle);
    arc(0, 12 + (thirdAnimation.percent * 5), 16, firstAnimation.percent * 14, 0, 3.14, CHORD);
    arc(0, 12 + (thirdAnimation.percent * 5), 16, thirdAnimation.percent * 14, 3.14, 0, CHORD);
    pop();

    if (mouseConstraint.body) {
        push();
        const posBody = mouseConstraint.body.position;
        fill(0, 255, 0);
        ellipse(posBody.x, posBody.y, 5, 5);
        const posMouse = mouseConstraint.mouse.position;
        const posConstraints = mouseConstraint.constraint.bodyB.position;
        // line(posBody.x, posBody.y, posMouse.x, posMouse.y);
        line(posConstraints.x, posConstraints.y, posMouse.x, posMouse.y);
        pop();
    }

    // ---
    // Cup
    // ---

    if (cup) {
        push();
        noStroke();
        fill('#fee096');
        translate(cup.body.position.x, cup.body.position.y);
        rect(0, 60, cup.w + 20, cup.h + 100);
        pop();

        push();
        translate(floor.body.position.x, floor.body.position.y);
        image(floorImg, floor.w / 2 * -1, floor.h / 2 * -1, floor.w, floor.h);
        pop();

        push();
        translate(cup.body.position.x, cup.body.position.y);
        image(cupImg, (cup.w / 2 * -1) - 10, cup.h / 2 * -1, cup.w + 20, cup.h);
        pop();

        push();
        noFill();
        noStroke();
        translate(cupHandle.body.position.x, cupHandle.body.position.y);
        image(cupHandleImg, cupHandle.w / 2 * -1, cupHandle.h / 2 * -1, cupHandle.w, cupHandle.h);
        pop();

        // Outer eye Left
        push();
        noStroke();
        fill('white');
        translate(cup.body.position.x - 76.5, cup.body.position.y - 5.5);
        ellipse(0, 0, 34);
        rotate(thirdAnimation.percent * 1.3);
        stroke('#812d29');
        strokeWeight(3.5);
        line(-24, 2, 2, -24);
        pop();

        // Outer eye right
        push();
        noStroke();
        fill('white');
        translate(cup.body.position.x + 76.5, cup.body.position.y - 5.5);
        ellipse(0, 0, 34);
        rotate(thirdAnimation.percent * -1.3);
        stroke('#812d29');
        strokeWeight(3.5);
        line(24, -2, -2, -24);
        pop();

        // Cheek right
        push();
        noStroke();
        fill('#f6554f');
        translate(cup.body.position.x + 76.5, cup.body.position.y);
        ellipse(0, 10 + thirdAnimation.percent * 3, 34, 10);
        pop();

        // Cheek left
        push();
        noStroke();
        fill('#ff635b');
        translate(cup.body.position.x - 76.5, cup.body.position.y);
        ellipse(0, 10 + thirdAnimation.percent * 3, 34, 10);
        pop();

        // Blush left
        push();
        noStroke();
        fill('#ff847e');
        translate(cup.body.position.x - 76.5, cup.body.position.y);
        ellipse(-20, 18.5, 18.5, 11);
        pop();

        // Blush right
        push();
        noStroke();
        fill('#ff635b');
        translate(cup.body.position.x + 76.5, cup.body.position.y);
        ellipse(20, 18.5, 18.5, 11);
        pop();

        // Inner eyes
        push();
        noStroke();
        fill('black');
        translate(cup.body.position.x, cup.body.position.y);
        ellipse(
            -76.5 + (marshmallow.body.position.x / width - 0.5) * 10,
            -7 + (marshmallow.body.position.y / height - 0.5) * 10,
            9.5
        );
        ellipse(
            76.5 + (marshmallow.body.position.x / width - 0.5) * 10,
            -7 + (marshmallow.body.position.y / height - 0.5) * 10,
            9.5
        );
        pop();

        // Cup mouth
        push();
        stroke('#812d29');
        strokeJoin(ROUND);
        strokeWeight(2);
        fill('#812d29');
        translate(cup.body.position.x, cup.body.position.y);
        rotate(cup.body.angle);
        arc(0, -10 + (thirdAnimation.percent * 18), 46, firstAnimation.percent * 44, 0, 3.14, CHORD);
        arc(0, -10 + (thirdAnimation.percent * 18), 46, thirdAnimation.percent * 44, 3.14, 0, CHORD);
        pop();
    }
}

window['setup'] = setup;
window['draw'] = draw;
window['resize'] = windowResized;
