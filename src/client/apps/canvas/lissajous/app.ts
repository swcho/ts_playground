
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

declare const Hyperact;
const { activate, disableAnimation, HyperArray, HyperNumber } = Hyperact;

function elastic(progress, omega, zeta) {
    const beta = Math.sqrt(1.0 - zeta * zeta);
    const value = 1.0 / beta * Math.exp(-zeta * omega * progress) * Math.sin(beta * omega * progress + Math.atan(beta / zeta));
    return 1 - value;
};

function easing(progress) {
    progress = 1 - Math.cos(progress * Math.PI / 2);
    return elastic(progress, 15, 0.6);
}

const duration = 1.0;

interface HyperactInstance {
    registerAnimatableProperty(name: string);
    needsDisplay();
    addAnimation(p1, p2);
    presentation: any;
}

interface View extends HyperactInstance {

}

class View {
    element;
    iterations = 25;
    vertices = 2000;
    radiusA = 0;
    radiusB = 0;
    a = 5;
    b = 8;
    d = 0;
    value;
    positionArray;
    constructor(element, value) {
        activate(this);
        this.element = element;
        this.iterations = 25;
        this.vertices = 2000;
        this.radiusA = 0;
        this.radiusB = 0;
        this.a = 5;
        this.b = 8;
        this.d = 0;
        this.value = value;
        this.positionArray = this.plot();
        this.registerAnimatableProperty('positionArray');
    }
    animationForKey(key, value, previous) {
        if (key === 'positionArray') return {
            type: new HyperArray(HyperNumber, this.vertices * 2),
            duration: duration,
            easing: easing
        };
    }
    plot() {
        const canvas = this.element;
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const phi = this.value * Math.PI;
        const array = [];
        const slice = (Math.PI * 2) / this.vertices;
        let j = this.vertices + 1;
        let theta = 0;
        while (--j) {
            theta -= slice;
            let i = this.iterations;
            let x = centerX;
            let y = centerY;
            do {
                const value = (i * theta) + (i * i * phi); // this is where the magic happens
                x += (Math.sin(this.a * value + this.d) / i) * this.radiusA;
                y += (Math.sin(this.b * value) / i) * this.radiusB;
            } while (--i);
            array.push(x);
            array.push(y);
        }
        return array;
    }
    layout(value) {
        this.value = value;
        this.positionArray = this.plot();
        this.needsDisplay();
    }
    display() {
        const canvas = this.element;
        const context = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        context.clearRect(0, 0, width, height);
        const array = this.positionArray;
        const length = array.length;
        if (length > 1) {
            context.beginPath();
            context.moveTo(array[0], array[1]);
            for (let i = 2; i < length; i += 2) {
                context.lineTo(array[i], array[i + 1]);
            }
            context.closePath();
            context.stroke();
        }
    }
}


interface Controller extends HyperactInstance {

}

class Controller {
    value: number;
    constructor() {
        activate(this);
        this.value = 0;
        document.addEventListener('mousedown', this.mouseDown.bind(this));
    }
    mouseDown(e) {
        let value = Math.random() * Math.PI * 2 - Math.PI;
        valueAnimation.from = value;
        valueAnimation.to = value + Math.PI * 2;
        this.addAnimation(valueAnimation, valueAnimationName);
        view.layout(value);
    };
    display() {
        disableAnimation(true);
        view.layout(this.presentation.value);
    }
}


const valueAnimation = {
    property: 'value',
    duration: 5000.0,
    from: 0,
    to: Math.PI * 2,
    iterations: Infinity,
    easing: 'linear',
    blend: 'absolute'
};

function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    disableAnimation(true);
    view.radiusA = width / 5;
    view.radiusB = height / 5;
};

let value = Math.random();

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
const view = new View(canvas, value);

const valueAnimationName = 'myValueAnimation';
const controller = new Controller();
resize();
controller.addAnimation(valueAnimation, valueAnimationName);
window.addEventListener('resize', resize);
