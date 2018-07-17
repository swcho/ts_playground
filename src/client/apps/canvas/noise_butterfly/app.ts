
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

//
import $ = require('jquery');

import dat = require('dat-gui');
const CONFIG = {
    noise: true,
    scale: true,
    frequency: true,
    division: 25,
    add: 0.1,
    usePrev: false,
};

let gui = new dat.GUI();
gui.add(CONFIG, 'noise');
gui.add(CONFIG, 'scale');
gui.add(CONFIG, 'frequency');
gui.add(CONFIG, 'division', 0.01, 50).step(0.01);
gui.add(CONFIG, 'add', -1, 1).step(0.1);
gui.add(CONFIG, 'usePrev');


class Particle {
    x: number;
    y: number;
    r: number;
    g: number;
    b: number;
    a: number;
    h: number;
    s: number;
    constructor(params) {
        this.x = params.x;
        this.y = params.y;
        this.r = params.r;
        this.g = params.g;
        this.b = params.b;
        this.a = params.a;
        this.h = params.h; // hex
        this.s = params.s || 1; // size
        // this.vx = 0;            // velocity values - unused
        // this.vy = 0;
    }
}

class App {
    private img: HTMLImageElement;
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private particles: Particle[];
    private nx = new SimplexNoise();
    private ny = new SimplexNoise();
    private frequency: number;
    private scale: number;
    private ti: number;
    private t: number;
    private lerpTo: { frequency: number; scale: number; };
    constructor(img: HTMLImageElement, canvas: HTMLCanvasElement) {
        this.img = img;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.particles = [];
        // this.nx = new SimplexNoise();
        // this.ny = new SimplexNoise();
        // this.frequency = 0.0007;
        // this.scale = 450;
        this.frequency = 0.0027;
        this.scale = 250;
        this.ti = 0.005;
        this.t = 0;

        this.lerpTo = {
            frequency: this.frequency,
            scale: this.scale
        };

        $('html').on('click', () => {
            for (let i = 0; i < this.particles.length; i++) {
                let p = this.particles[i];
                // p.vx += Math.random() > 0.9 ? Math.random() * 40 - 20 : Math.random() * 10 - 5;
                // p.vy += Math.random() > 0.9 ? Math.random() * 40 - 20 : Math.random() * 10 - 5;
            }
            this.lerpTo.scale = Math.random() * 650;
            this.lerpTo.frequency = Math.random() * 0.0075 + 0.0001;
            console.log(this.lerpTo);
        });

        $(window).on('resize', () => this.size());
    }

    lerp(value1: number, value2: number, amount: number) {
        amount = amount < 0 ? 0 : amount;
        amount = amount > 1 ? 1 : amount;
        return value1 + (value2 - value1) * amount;
    }

    start() {
        this.size();
        this.createParticles();
        this.sortParticlesByColor();
        this.tick();
    }

    size() {
        this.canvas.width = $(window).width();
        this.canvas.height = $(window).height();
    }

    tick() {
        this.scale = this.lerp(this.scale, this.lerpTo.scale, 0.01);
        this.frequency = this.lerp(this.frequency, this.lerpTo.frequency, 0.01);
        this.t += this.ti;

        const context = this.context;
        context.beginPath();
        context.rect(0, 0, this.canvas.width, this.canvas.height);
        //    context.fillStyle = "rgba(255, 255, 255, 0.1)";
        context.fillStyle = '#ffffff';
        context.fill();
        context.beginPath();

        const center = {
            x: this.canvas.width * 0.5 - this.img.width * 0.5,
            y: this.canvas.height * 0.5 - this.img.height * 0.5
        };

        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            /*
            p.vx *= 0.9;
            p.vy *= 0.9;
            p.x += p.vx;
            p.y += p.vy;*/

            // noise
            let x =
                CONFIG.noise
                ? p.x +
                    this.nx.noise2D(
                        p.x * (CONFIG.frequency ? this.frequency : 1) + this.t,
                        p.y * (CONFIG.frequency ? this.frequency : 1) + this.t
                    ) * (CONFIG.scale ? this.scale : 1)
                : p.x;
            let y =
                CONFIG.noise
                ? p.y +
                    this.ny.noise2D(
                        p.x * (CONFIG.frequency ? this.frequency : 1) + this.t,
                        p.y * (CONFIG.frequency ? this.frequency : 1) + this.t
                    ) * (CONFIG.scale ? this.scale : 1)
                : p.y;

            // center
            x += center.x;
            y += center.y;

            // round
            // x = ~~x;
            // y = ~~y;

            // diamond
            if (p.s > 1) {
                context.moveTo(x, y - p.s);
                context.lineTo(x + p.s, y);
                context.lineTo(x, y + p.s);
                context.lineTo(x - p.s, y);
                context.lineTo(x, y - p.s);
            } else {
                context.rect(x, y, 1, 1); // so small may as well do a rect
            }

            // square
            // context.rect(x, y, p.s, p.s);

            // circle - too slow??
            // context.arc(x, y, p.s, 0, Math.PI * 2);
            // context.closePath();

            // fill if the next particle colour is not the same
            let nextP = this.particles[i + 1];
            if (!nextP || p.h !== nextP.h) {
                context.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${1})`;
                context.fill();
                context.beginPath();
            }
        }

        requestAnimationFrame(() => this.tick());
    }

    createParticles() {
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = this.img.width;
        tmpCanvas.height = this.img.height;

        const tmpCtx = tmpCanvas.getContext('2d');
        tmpCtx.drawImage(this.img, 0, 0);

        const data = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height)
            .data;

        // create particles for opaque pixels, with a bit of randomness
        let alphaThreshold = 240;
        let randomThreshold = 0.65;
        for (let i = 0; i < data.length; i += 4) {
            let a = data[i + 3];
            if (a > alphaThreshold && Math.random() > randomThreshold) {
                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];
                let h = b | (g << 8) | (r << 16);
                let x = i / 4 % this.img.width;
                let y = i / 4 / this.img.width;
                let s = Math.random() > 0.9 ? Math.random() * 4 : 1;
                this.particles.push(
                    new Particle({ x: x, y: y, r: r, g: g, b: b, a: a, h: h, s: s })
                );
            }
        }
    }

    sortParticlesByColor() {
        // sorting the particles by hex color means we can batch drawFill operations in tick()
        let rules = (p1, p2) => {
            return p1.h - p2.h;
        };
        this.particles.sort(rules);
    }
}

const img = $('img')[0] as HTMLImageElement;
const canvas = $('canvas')[0] as HTMLCanvasElement;
const app = new App(img, canvas);
app.start();
