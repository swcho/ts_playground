
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/jscottsmith/pen/XgGZaL

console.log('Device Pixel Ratio', window.devicePixelRatio);

/*------------------------------*\
|* Constants
\*------------------------------*/

const COLOR_1 = '#ffecd2';
const COLOR_2 = '#fbc2eb';
const COLOR_3 = '#667eea';
const COLOR_4 = '#8fd3f4';
const BG_COLOR_TOP = '#fff1ce';
const BG_COLOR_BOT = '#8ec5fc';
const RADIANS = Math.PI / 180;

const STRENGTH = 4;
const ELASTICITY = 0.0001;
// const ELASTICITY = 0.1;
const DAMPING = 0.995;
// const DAMPING = 0.1;
const MASS = 0.15;

/*------------------------------*\
|* Main Canvas
\*------------------------------*/

class Canvas {

    private canvas: HTMLCanvasElement;
    // device pixcel density
    private dpr: number;
    private ctx: CanvasRenderingContext2D;
    private mouse: {
        x: number;
        y: number;
        mousedown: boolean;
    };
    private tick: number;
    private diamond: DiamondCanvas;
    private grid: FluidDiamond[];

    constructor() {
        this.handleMousedown = this.handleMousedown.bind(this);
        this.handleMouseup = this.handleMouseup.bind(this);
        this.handleMouse = this.handleMouse.bind(this);
        // this.handleClick = this.handleClick.bind(this);
        this.render = this.render.bind(this);

        // setup a canvas
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);

        // Simulation can be too slow on hi-res devices so ignoring device pixel density
        this.dpr = 1;
        // this.dpr =  window.devicePixelRatio || 1;

        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(this.dpr, this.dpr);
        this.setCanvasSize = this.setCanvasSize.bind(this);

        this.mouse = {
            x: window.innerWidth * this.dpr / 2,
            y: window.innerHeight * this.dpr / 2,
            mousedown: false,
        };

        this.setCanvasSize();
        this.setupListeners();
        this.layoutGrid();

        this.tick = 0;
        this.render();
    }

    setupListeners() {
        window.addEventListener('resize', this.setCanvasSize);
        window.addEventListener('mousedown', this.handleMousedown);
        window.addEventListener('mouseup', this.handleMouseup);
        window.addEventListener('mousemove', this.handleMouse);
        // window.addEventListener('click', this.handleClick);
    }

    setCanvasSize() {
        this.canvas.width = window.innerWidth * this.dpr;
        this.canvas.height = window.innerHeight * this.dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';

        this.layoutGrid();
    }

    layoutGrid() {
        const { width, height } = this.canvas;
        const gw = width - 100 * this.dpr;
        const gh = height - 100 * this.dpr;

        const size = Math.floor(Math.max(gw, gh) / 22);

        // new diamond canvas to draw the diamond image
        this.diamond = new DiamondCanvas();

        const columns = Math.floor(gw / size);
        const rows = Math.floor(gh / size);

        const colPad = (width - gw) / 2;
        const rowPad = (height - size * rows) / 2;

        this.grid = [];
        for (let row = 1; row <= rows; row++) {
            for (let col = 1; col <= columns; col++) {

                const x = (col - 1) * size + colPad;
                const y = (row - 1) * size + rowPad;

                const fd = new FluidDiamond(
                    this.ctx,
                    x,
                    y,
                    size,
                    size,
                );

                this.grid.push(fd);
            }
        }
    }

    // handleClick(event) {}

    handleMousedown(event) {
        this.mouse.mousedown = true;
    }

    handleMouseup(event) {
        this.mouse.mousedown = false;
    }

    handleMouse(event) {
        const x = event.clientX * this.dpr;
        const y = event.clientY * this.dpr;
        this.mouse.x = x;
        this.mouse.y = y;

        this.applyForce();
    }

    applyForce() {
        const { mousedown, x, y } = this.mouse;
        const length = this.grid.length;

        for (let i = 0; i < length; i++) {
            const fd = this.grid[i];
            const dx = fd.cx - x;
            const dy = fd.cy - y;
            const angle = Math.atan2(dy, dx);
            let dist = STRENGTH / Math.sqrt(dx * dx + dy * dy);

            if (mousedown) {
                dist *= -1;
            }

            const fx = Math.cos(angle) * dist;
            const fy = Math.sin(angle) * dist;
            fd.applyForce(fx, fy);
        }
    }

    drawBackground() {
        const { width, height } = this.canvas;
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, BG_COLOR_TOP);
        gradient.addColorStop(1, BG_COLOR_BOT);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
    }

    drawMouse() {
        const { mousedown, x, y } = this.mouse;
        this.ctx.lineWidth = 2 * this.dpr;
        this.ctx.strokeStyle = mousedown ? '#FFFFFF' : '#537895';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 16 * this.dpr, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    render() {
        this.drawBackground();
        this.drawMouse();

        // draw and update fluid diamonds
        const length = this.grid.length;
        const image = this.diamond.canvas;

        for (let i = 0; i < length; i++) {
            const fd = this.grid[i];
            fd.draw(image);
            fd.update();
        }

        // draw and update diamond canvas
        this.diamond.update();
        this.diamond.draw();

        // Apply force for a split second to Demo
        if (this.tick <= 120) {
            this.applyForce();
        }

        this.tick++;
        window.requestAnimationFrame(this.render);
    }
}

/*------------------------------*\
|* Fluid Diamond
\*------------------------------*/

class FluidDiamond {

    private ox: number;
    private oy: number;
    private hw: number;
    private hh: number;
    cx: number;
    cy: number;
    private vx: number;
    private vy: number;
    private fx: number;
    private fy: number;
    private mass: number;
    private elasticity: number;
    private damping: number;

    constructor(
        private ctx: CanvasRenderingContext2D,
        private x = 0,
        private y = 0,
        private w = 50,
        private h = 50,
    ) {
        this.ctx = ctx;         // canvas
        this.ox = x;            // origin x
        this.oy = y;            // origin y
        this.x = x;
        this.y = y;
        this.w = w;             // width
        this.h = h;             // height
        this.hw = w / 2;        // half width
        this.hh = h / 2;        // half height
        this.cx = x + this.hw;  // center x
        this.cy = y + this.hh;  // center y
        this.vx = 0;            // velocity x
        this.vy = 0;            // velocity y
        this.fx = 0;            // force x
        this.fy = 0;            // force y
        this.mass = MASS;
        this.elasticity = ELASTICITY;
        this.damping = DAMPING;
        // this.draw();
    }

    update() {
        // force to origin, difference multiplied by elasticity constant
        const ofx = (this.ox - this.x) * this.elasticity;
        const ofy = (this.oy - this.y) * this.elasticity;

        // sum forces
        const fx = this.fx + ofx;
        const fy = this.fy + ofy;

        // acceleration = force / mass;
        const ax = fx / this.mass;
        const ay = fy / this.mass;

        // velocity
        this.vx = this.damping * this.vx + ax;
        this.vy = this.damping * this.vy + ay;

        // add velocity to center and top/left
        this.x += this.vx;
        this.y += this.vy;
        this.cx += this.vx;
        this.cy += this.vy;

        // reset any applied forces
        this.fx = 0;
        this.fy = 0;
    }

    applyForce(fx, fy) {
        this.fx = fx;
        this.fy = fy;
    }

    draw(image) {
        // draws the diamond canvas as image
        const { x, y, w, h } = this;
        this.ctx.drawImage(image, x, y, w, h);
    }
}

/*------------------------------*\
|* Diamond Canvas
\*------------------------------*/

class DiamondCanvas {

    canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private x: number;
    private y: number;
    private w: number;
    private h: number;
    private hw: number;
    private hh: number;
    private cx: number;
    private cy: number;
    private theta: number;

    constructor(
        w = 50,
        h = 50,
    ) {

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = w;
        this.canvas.height = h;

        this.x = 0;
        this.y = 0;
        this.w = w;             // width
        this.h = h;             // height
        this.hw = w / 2;        // half width
        this.hh = h / 2;        // half height
        this.cx = this.x + this.hw;  // center x
        this.cy = this.y + this.hh;  // center y
        this.theta = 0;
        this.draw();
    }

    getGradient(c1, c2, x, y) {
        const { w, h } = this;
        const x2 = x + w;
        const y2 = y + h;
        const gradient = this.ctx.createLinearGradient(x, y, x, y2);
        gradient.addColorStop(0, c1);
        gradient.addColorStop(1, c2);
        return gradient;
    }

    update() {
        // increase rotation
        if (this.theta >= 360) {
            this.theta = 0;
        }
        this.theta += 1.5;
    }

    draw() {
        this.ctx.save();
        const { x, y, cx, cy, w, h, hw, hh, theta } = this;
        this.ctx.clearRect(x, y, h, w);

        // translate and rotate
        this.ctx.translate(cx, cy);
        this.ctx.rotate(theta * RADIANS);

        // top
        this.ctx.fillStyle = this.getGradient(COLOR_1, COLOR_2, -hw, -hh);
        this.ctx.beginPath();
        this.ctx.moveTo(0, -hh);
        this.ctx.lineTo(hw, 0);
        this.ctx.lineTo(-hw, 0);
        this.ctx.closePath();
        // undo rotation for fill
        this.ctx.rotate(-theta * RADIANS);
        this.ctx.fill();

        // bottom
        this.ctx.fillStyle = this.getGradient(COLOR_3, COLOR_4, -hw, -hh);
        // rotate again
        this.ctx.rotate(theta * RADIANS);
        this.ctx.beginPath();
        this.ctx.moveTo(hw, 0);
        this.ctx.lineTo(0, hh);
        this.ctx.lineTo(-hw, 0);
        this.ctx.closePath();
        // undo rotation for fill
        this.ctx.rotate(-theta * RADIANS);
        this.ctx.fill();

        // restore ctx
        this.ctx.restore();
    }
}

new Canvas();
