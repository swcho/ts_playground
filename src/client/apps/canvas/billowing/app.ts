
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

var elCanvas = document.getElementById("canv") as HTMLCanvasElement;
var ctx = elCanvas.getContext("2d");
let w: number, h: number;
elCanvas.width = w = window.innerWidth;
elCanvas.height = h = window.innerHeight;
ctx.fillStyle = 'hsla(0,0%,0%,1)';
ctx.fillRect(0, 0, w, h);
var bubble = 300;
var cells = 50;

function Cell(p1, p2, p3, p4) {
    var lingelbach = this;
    lingelbach.draw = function ($) {
        $.strokeStyle = 'hsla(255,255%,255%,.2)';
        $.fillStyle = 'hsla(255,255%,255%,1)';
        $.beginPath();
        $.arc(p1.x, p1.y, 5, 0, Math.PI * 2, false);
        $.fill();
        $.lineWidth = 6;
        $.moveTo(p1.x + 0.5, p1.y + 0.5);
        $.lineTo(p2.x - 0.5, p2.y + 0.5);
        $.lineTo(p3.x - 0.5, p3.y - 0.5);
        $.lineTo(p4.x + 0.5, p4.y - 0.5);
        $.closePath();
        $.stroke();
    };
}

function Grid($, w, h) {
    var lingelbach = this;
    lingelbach.ms = null;

    var col = ((w - 1) / cells | 0) + 1;
    var row = ((h - 1) / cells | 0) + 1;
    var bubbleXL = 1 / (bubble * bubble);
    var diam = [{
        x: -1,
        y: 0
    }, {
        x: 0,
        y: -1
    }, {
        x: 1,
        y: 0
    }, {
        x: 0,
        y: 1
    }];

    var pts = [];
    var sqs = [];

    var pindx = function (x, y) {
        if (0 <= x && x < col + 1 && 0 <= y && y < row + 1) {
            return x + y * (col + 1);
        } else {
            return null;
        }
    };

    var cindx = function (x, y) {
        if (0 <= x && x < col && 0 <= y && y < row) {
            return x + y * col;
        } else {
            return null;
        }
    };

    for (var x = 0; x < col + 1; x++) {
        for (var y = 0; y < row + 1; y++) {
            var px = x * cells;
            var py = y * cells;
            pts[pindx(x, y)] = new Part(px, py);

            if (x > 0 && y > 0) {
                var idxc = cindx(x - 1, y - 1);
                var p1 = pts[pindx(x - 1, y - 1)];
                var p2 = pts[pindx(x, y - 1)];
                let p3 = pts[pindx(x, y)];
                let p4 = pts[pindx(x - 1, y)];
                let cell = new Cell(p1, p2, p3, p4);
                sqs[idxc] = cell;
            }
        }
    }
    lingelbach.struct = function () {
        for (let x = 0; x < col + 1; x++) {
            for (let y = 0; y < row + 1; y++) {
                let p = pts[pindx(x, y)];

                let cnt = 1;
                let msX = x * cells;
                let msY = y * cells;
                for (let i = 0; i < diam.length; i++) {
                    let dp = diam[i];
                    let cp = pts[pindx(x + dp.x, y + dp.y)];
                    if (cp != null) {
                        msX += cp.x - dp.x * cells;
                        msY += cp.y - dp.y * cells;
                        cnt++;
                    }
                }
                p.vx += (msX / cnt - p.x) * 0.6;
                p.vy += (msY / cnt - p.y) * 0.6;

                if (lingelbach.ms != null) {
                    let d2 = (lingelbach.ms.x - p.x) *
                        (lingelbach.ms.x - p.x) +
                        (lingelbach.ms.y - p.y) *
                        (lingelbach.ms.y - p.y);
                    if (d2 * bubbleXL < 1.0) {
                        let t = 1.0 - (d2 * bubbleXL);
                        p.vx -= (lingelbach.ms.x - p.x) * t * 0.06;
                        p.vy -= (lingelbach.ms.y - p.y) * t * 0.06;
                    }
                }
            }
        }

        for (let x = 0; x < col + 1; x++) {
            for (let y = 0; y < row + 1; y++) {
                let p = pts[pindx(x, y)];
                p.anim();
            }
        }
    };

    lingelbach.draw = function ($) {
        $.clearRect(0, 0, w, h);
        for (let i = 0; i < sqs.length; i++) {
            sqs[i].draw($);
        }
    };
}
function Part(px, py) {
    let lingelbach = this;
    lingelbach.x = px;
    lingelbach.y = py;
    lingelbach.vx = 0;
    lingelbach.vy = 0;

    lingelbach.anim = function () {
        lingelbach.x += lingelbach.vx;
        lingelbach.y += lingelbach.vy;
        lingelbach.vx *= 0.9;
        lingelbach.vy *= 0.9;
    };
}

let grid = new Grid(ctx, w, h);

window.addEventListener('mousemove', function (e) {
    grid.ms = {
        x: e.clientX,
        y: e.clientY,
    };
}, false);

window.addEventListener('touchmove', function (e) {
    e.preventDefault();
    grid.ms = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
    };
}, false);

function load() {
    grid.struct();
    grid.draw(ctx);
    window.requestAnimationFrame(load);
};
load();

console.log('Code With ❤ Always, @tmrDevelops');
