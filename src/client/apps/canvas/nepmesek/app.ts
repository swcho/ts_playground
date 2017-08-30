
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

// https://codepen.io/scorch/pen/owmzRj

console.log(__filename);
console.log('hi');

import * as dat from 'dat-gui';

var canvas, bg, wh, ctx, max_num;


var ctrl = {
    a: 10,
    b: 40,
    c: 10,
    d: 20,
    color: "#FF0000"
}

const gui = new dat.GUI();
gui.addColor(ctrl, 'color');
gui.add(ctrl, 'a', 5, 14).step(1);
gui.add(ctrl, 'b', 20, 60).step(1);
gui.add(ctrl, 'c', 3, 20).step(2);
gui.add(ctrl, 'd', 18, 30).step(1);


var CENTER_CANVAS = false


const hue = 100;

function Stem(x?, y?, r?) {
    stems.push(this)
    // this.x = x || Math.random() * canvas.width
    // this.y = y || Math.random() * canvas.height
    this.x = x || Math.random() * canvas.width;
    this.y = canvas.height

    this.angle = Math.random()
    this.angleChange = 0.003 + Math.random() * 0.004
    this.angleChangeDest = this.angleChange
    this.velocity = 5

    this.history = []
    this.leaves = []
    this.s = 0
    this.sMax = 5
    this.maxHistory = 20

    this.decay = false;
    this.hue = hue

    this.getNewCenter = function () {
        // pick a new radius
        let r = Math.round(Math.random() * 70 + 10);

        let phase = this.phase / this.r1c
    };

    this.update = function () {
        this.s = (this.s + 1) % ctrl.c;


        this.angle += this.angleChange;

        this.hue = hue * 0.01 + this.hue * 0.99;
        this.angleChange = this.angleChangeDest * 0.0001 + this.angleChange * 0.9999;

        if (Math.random() > 0.96) {
            this.angleChange = -this.angleChange;
            this.angleChangeDest = -this.angleChangeDest;
            // this.angleChangeDest = (Math.random() - 0.5 ) * 0.03;
        }

        if (Math.random() > 0.95) {
            this.angleChangeDest = (Math.random() - 0.6) * 0.03;
        }

        if (this.decay) {
            this.history.pop();
            if (this.history.length == 0) {
                this.kill();
            }
            return null;
        }

        if (this.x < (0 + 30) || this.x > (canvas.width + 30) ||
            this.y < (0 + 30) || this.y > (canvas.height + 30)) {
            // start decay
            this.decay = true;

            // create new
            new Stem();
            return;
        }

        let newx = this.x + Math.cos(this.angle * Math.PI * 2) * this.velocity;
        let newy = this.y + Math.sin(this.angle * Math.PI * 2) * this.velocity;

        if (this.s == 0) {
            // add leaf
            this.leaves.unshift(new Leaf(this.x, this.y, newx, newy, 1));
            this.leaves.unshift(new Leaf(this.x, this.y, newx, newy, -1));
        }

        let xy = [
            this.x = newx,
            this.y = newy
        ];

        this.history.unshift(xy);

        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }

        if (this.leaves.length > this.maxHistory / ctrl.c * 2) {
            this.leaves.pop();
        }

        // update leaves
        for (let i = this.leaves.length - 1; i >= 0; i--) {
            this.leaves[i].update();
        };
    };
    this.kill = function () {
        while (this.leaves.length > 0) {
            this.leaves.pop();
        }

        let i = stems.indexOf(this);
        stems.splice(i, 1);
    };

    this.draw = function () {
        this.update();

        if (this.history.length > 1) {
            ctx.beginPath();
            // ctx.strokeStyle = `hsla(${this.hue}, 100%, 50%, 0.5)`
            ctx.strokeStyle = ctrl.color;
            ctx.lineCap = 'round';
            ctx.lineWidth = 3;
            ctx.moveTo(this.history[0][0], this.history[0][1]);
            ctx.lineTo(this.history[1][0], this.history[1][1]);
            // for (var i = 1; i < this.history.length; i ++) {
            //   ctx.lineTo(this.history[i][0], this.history[i][1])
            // }
            ctx.stroke();
        }

        // draw leaves
        for (let i = this.leaves.length - 1; i >= 0; i--) {
            this.leaves[i].draw();
        };
    };

    // return this;
}

window.onload = init;

function init() {
    // create a canvas element
    canvas = document.createElement('canvas');

    // attach element to DOM
    document.body.appendChild(canvas);

    // background color (hsl)
    bg = { h: 320, s: 10, l: 100 };

    wh = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;

    ctx = canvas.getContext('2d');

    resizeCanvas();

    new Stem();
    new Stem();
    new Stem();

    onUpdate();
}

function resizeCanvas() {
    // setup the canvas size to match the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    wh = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;

    // set the 0,0 point to the middle of the canvas, this is not necessary but it can be handy
    if (CENTER_CANVAS) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
    }

    fill(bg, 1);
}

// re-setup canvas when the size of the window changes
window.addEventListener('resize', resizeCanvas);

let s = 0;
function onUpdate() {
    window.requestAnimationFrame(function () { onUpdate(); });
    s = (s + 1) % 800;
    fill(bg, 0.002 + Math.sin(Math.pow(s / 800, 12) * 3.14) * 0.07);

    for (let i = 0; i < stems.length; i++) {
        stems[i].draw();
    }
}
// fill entire canvas with a preset color
function fill(hsl, amt) {
    ctx.beginPath(); // start path
    if (CENTER_CANVAS) {
        ctx.rect(- canvas.width / 2, - canvas.height / 2, canvas.width, canvas.height); // set rectangle to be the same size as the window
    } else {
        ctx.rect(0, 0, canvas.width, canvas.height); // set rectangle to be the same size as the window
    }
    ctx.fillStyle = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${amt})`; // use the rgb array/color for fill, and amt for opacity
    ctx.fill(); // do the drawing
}


function drawCircle(x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color || 'white';
    ctx.fill();
    ctx.closePath();
}


let stems = [];

function Leaf(x, y, vx, vy, d) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.d = d;
    this.angle = Math.atan2(vy - y, vx - x);
    this.s = 0;
    this.a = ctrl.a;
    this.b = ctrl.b;
    this.sMax = ctrl.d;
    this.history = [];

    this.update = function () {
        this.s++;
        if (this.s < this.sMax) {
            let r = this.s / this.sMax;
            this.history.unshift([
                this.x + r * this.b * Math.cos(this.angle),
                this.y + r * this.b * Math.sin(this.angle),
                0.1 + r * this.a
            ]);

            this.angle += this.d / this.sMax;
        }
    };

    this.draw = function () {
        let h;
        h = this.history[0];
        drawCircle(h[0], h[1], h[2], ctrl.color);
        // for (var i = this.history.length - 1; i >= 0; i--) {
        //   h = this.history[i]
        //   drawCircle(h[0], h[1], h[2], 'red')
        // };
    };

}
