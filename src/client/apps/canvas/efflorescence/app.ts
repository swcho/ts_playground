
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

//
let cols = [
    '#FFFFFF',
    '#FDA543',
    '#A90448',
    '#FB3640',
    '#FFFFFF',
    '#17C69B'
];

let rndCol = function () {
    let len = cols.length;

    let hues = Math.floor(Math.random() * len);
    return cols[hues];
};

namespace obj {
    const cir = new Array(13);
    const rad = 120;
    const echo = 80;
    const sp = 1.2;
    const sz = 360;
    const col = {
        a: 'hsla(231, 16%, 9%, .4)',
        b: rndCol(),
    };
    export let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    function x(_x) {
        return canvas.width / 2 + _x;
    }
    function y(_y) {
        return canvas.height / 2 - _y;
    }
    class Circle {
        r: number;
        e: boolean;
        max: number;
        min: number;
        val: number;
        col: string;
        constructor(i) {
            this.r = rad - i * rad / cir.length;
            this.e = i % 2 ? true : false;
            this.max = Math.random() * echo;
            this.min = -Math.random() * echo;
            this.val = Math.random() * (this.max - this.min) + this.min;
            this.col = rndCol();
        }
    }
    function fill() {
        ctx.fillStyle = col.a;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    function move(circle: Circle) {
        for (let i = 0; i < sz; i++) {
            let a = i * Math.PI * 2 / sz;
            let _x = Math.cos(a) * (circle.r - circle.val * Math.sin(i * Math.PI / 18));
            let _y = Math.sin(a) * (circle.r - circle.val * Math.sin(i * Math.PI / 18));
            ctx.fillStyle = circle.col;
            ctx.fillRect(x(_x), y(_y), 2, 2);
        }
        check(circle);
    }
    function check(circle: Circle) {
        circle.val = circle.e ? circle.val + sp : circle.val - sp;
        if (circle.val < circle.min) {
            circle.e = true;
            circle.max = Math.random() * echo;
        }
        if (circle.val > circle.max) {
            circle.e = false;
            circle.min = -Math.random() * echo;
        }
    }
    function upd() {
        fill();
        for (let i = 0; i < cir.length; i++) {
            move(cir[i]);
        }
    }
    function draw() {
        upd();
        text();
        window.requestAnimationFrame(draw);
    }
    export function createCircles() {
        for (let i = 0; i < cir.length; i++) {
            cir[i] = new Circle(i);
        }
    }
    function updateSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    function init() {
        canvas = document.getElementById('canv') as HTMLCanvasElement;
        ctx = canvas.getContext('2d');
    }
    function text() {
        let t = 'Efflorescence'.split('').join(String.fromCharCode(0x2004));
        ctx.font = '3em Marck Script';
        ctx.fillStyle = col.b;
        ctx.textBaseline = 'middle';
        ctx.fillText(t, (canvas.width - ctx.measureText(t).width) * 0.5, canvas.height * 0.065);
        let t2 = 'Click or Tap Anywhere To Change Color Pattern'.split('').join(String.fromCharCode(0x2004));
        ctx.font = '1em Marck Script';
        ctx.fillStyle = col.b;
        ctx.textBaseline = 'middle';
        ctx.fillText(t2, (canvas.width - ctx.measureText(t2).width) * 0.5, canvas.height * 0.95);
    }
    export function run() {
        init();
        updateSize();
        createCircles();
        draw();
    }
};
obj.run();

/*********listeners***********/
window.addEventListener('resize', function () {
    obj.canvas.width = window.innerWidth;
    obj.canvas.height = window.innerHeight;
}, false);

window.addEventListener('mousedown', function (e) {
    obj.createCircles();
}, false);

window.addEventListener('touchstart', function (e) {
    e.preventDefault();
    obj.createCircles();
}, false);


console.log('Code With ❤ Always, @tmrDevelops');
