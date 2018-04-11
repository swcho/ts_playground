
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

// if (!window.requestAnimationFrame) {
//     window.requestAnimationFrame = (function () {
//         return window.requestAnimationFrame ||
//             window.webkitRequestAnimationFrame ||
//             window.mozRequestAnimationFrame ||
//             window.oRequestAnimationFrame ||
//             window.msRequestAnimationFrame ||
//             function ( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
//                 window.setTimeout(callback, 1000 / 60);
//             };
//     })();
// }
// if (!window.cancelAnimationFrame) {
//     window.cancelAnimationFrame = (window.cancelRequestAnimationFrame ||
//         window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame ||
//         window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame ||
//         window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame ||
//         window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame ||
//         window.clearTimeout);
// }


declare global {
    interface Window {
        utils;
    }
    const utils;
}

window.utils = {};

window.utils.captureMouse = function (element: HTMLElement) {
    var mouse = {
        x: 0,
        y: 0,
        event: null,
    };
    var l1 = document.body.scrollLeft, //body
        l2 = document.documentElement.scrollLeft, //html
        t1 = document.body.scrollTop,
        t2 = document.documentElement.scrollTop,
        ofX = element.scrollLeft,
        ofY = element.scrollTop;
    element.addEventListener('mousemove', function (event) {
        var x, y;
        if (event.pageX || event.pageY) {
            x = event.pageX;
            y = event.pageY;
        } else {
            x = event.clientX + l1 + l2;
            y = event.clientY + t1 + t2;
        }
        // console.log(x,y)
        x -= ofX;
        y -= ofY;
        // console.log(ofX,ofY)

        mouse.x = x;
        mouse.y = y;
        mouse.event = event;
    });
    return mouse;
};
window.utils.parseColor = function (color, toNumber) {
    if (toNumber === true) {
        if (typeof color === 'number') {
            return (color | 0); //chop off decimal
        }
        if (typeof color === 'string' && color[0] === '#') {
            color = color.slice(1);
        }
        return parseInt(color, 16);
    } else {
        if (typeof color === 'number') {
            color = '#' + ('00000' + (color | 0).toString(16)).substr(-6); //pad
        }
        return color;
    }
};
window.utils.containsPoint = function (rect, x, y) {
    return !(x < rect.x ||
        x > rect.x + rect.width ||
        y < rect.y ||
        y > rect.y + rect.height);
};
window.utils.rectContainsPoint = function (rect, x, y) {
    return !(x < rect.x ||
        x > rect.x + rect.width ||
        y < rect.y ||
        y > rect.y + rect.height);
};
window.utils.ellipseContainsPoint = function (x, y, centerX, centerY, eW, eH) {
    if (Math.pow((x - centerX * .5), 2) / Math.pow(eW, 2) + Math.pow((y - centerY * .5), 2) / Math.pow(eH, 2) < 1) {
        return true
    }
    return false;
};
window.utils.getNumberInNormalDistribution = function (mean, std_dev) { // 正态分布 两头少 中间多
    function randomNormalDistribution() {
        var u = 0.0,
            v = 0.0,
            w = 0.0,
            c = 0.0;
        do {
            u = Math.random() * 2 - 1.0;
            v = Math.random() * 2 - 1.0;
            w = u * u + v * v;
        } while (w == 0.0 || w >= 1.0)
        c = Math.sqrt((-2 * Math.log(w)) / w);
        return u * c;
    }
    return mean + (randomNormalDistribution() * std_dev);
}
window.utils.getBezierCoordinates = function ($t) { }


function Target(x, y, radius, color) {
    this.x = x ? x : canvas.width / 2;
    this.y = y ? y : canvas.height / 2;
    this.ox = x;
    this.oy = y;
    this.radius = radius ? radius : 30;
    this.color = (color === undefined) ? "#ff0000" : utils.parseColor(color);
}

var unitat
var unitet = unitat = 20 + Math.random() * 10;
Target.prototype.draw = function (ctx) {
    // ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    // unit = this.x ;
    // unity = this.y ;
    // ctx.moveTo(unit + 0.5 * unitat, unity + 0.3 * unitet);
    // ctx.beginPath();
    // ctx.moveTo(unit + 0.5 * unitat, unity + 0.3 * unitet);
    // ctx.bezierCurveTo(unit + 0.1 * unitat, unity, unit,
    //     unity + 0.6 * unitet, unit + 0.5 *
    //     unitat, unity + 0.9 * unitet);
    // ctx.bezierCurveTo(unit + 1 * unitat, unity + 0.6 *
    //     unitet, unit + 0.9 * unitat, unity,
    //     unit + 0.5 * unitat,
    //     unity + 0.3 * unitet);
    // ctx.closePath();
    // ctx.fill();
};

Target.prototype.getBounds = function () {
    return {
        x: this.x - this.radius,
        y: this.y - this.radius,
        width: this.radius * 2,
        height: this.radius * 2
    };
};


var canvas = document.getElementById('demo') as HTMLCanvasElement;
var ctx = canvas.getContext("2d");
var mouse = utils.captureMouse(canvas);
var speed = 20,
    friction = 0.7;
var targetIndexDirection = 1;
resize();

function heartPosition(phi) {
    return [Math.pow(Math.sin(phi), 3) * 150, - 10 * ((15 * Math.cos(phi) - 5 * Math.cos(2 * phi) - 2 * Math.cos(3 * phi) - Math.cos(4 * phi)))];
}
function circle(phi) {
    return [Math.sin(phi) * 150, Math.cos(phi) * 200];
}
function gain(x, k) {
    k = k ? k : 1;
    var a = 0.5 * Math.pow(2.0 * ((x < 0.5) ? x : 1.0 - x), k);
    return [((x < 0.5) ? a : 1.0 - a) * 50, ((x < 0.5) ? a : 1.0 - a) * 10];
}
function parabola(x, k) {
    k = k ? k : 1;
    var y;
    x = y = Math.pow(4.0 * x * (1.0 - x), k);
    return [x * 10 + 500, y * 100];
}
function impulse(k, x) {
    k = k ? k : 1;
    var h = k * x;
    var y;
    x = y = h * Math.exp(1.0 - h);
    return [Math.random() * 1000 - 500, y * 200];
}
var targets = [];
for (var phi = 0; phi < Math.PI * 2; phi += 0.1) {
    targets.push(new (Target as any)(heartPosition(phi)[0] + canvas.width / 2, heartPosition(phi)[1] + canvas.height / 2, 10));
}
let targetIndex = randint(0, targets.length);
let particle = new Target(targets[targetIndex].x, targets[targetIndex].y, 5, '#ff0000');
let target = new Target(targets[targetIndex].x, targets[targetIndex].y, 15, '#0000ff');

const trace = [];
for (let i = 0; i < 180; i++) {
    trace[i] = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };
}

render();
function render() {
    requestAnimationFrame(render);
    ctx.fillStyle = 'rgba(24, 24, 24, 0.01)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    update();
    particle.draw(ctx);

    target.x = targets[targetIndex].x;
    target.y = targets[targetIndex].y;
    // target.draw(ctx);

    // targets.forEach(function (target) {
    //     target.draw(ctx);
    // });
    trace.forEach(function (item) {
        ctx.fillStyle = '#ff0000';
        // ctx.fillStyle = "rgba(254, 254, 254, 0.01)";
        ctx.beginPath();
        ctx.arc(item.x, item.y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });

    ctx.restore();
}
function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
function update() {
    let dx = particle.x - target.x;
    let dy = particle.y - target.y;
    // var angle = Math.atan2(-dy, -dx);
    // var vx = Math.cos(angle) * speed;
    // var vy = Math.sin(angle) * speed;

    let length = Math.sqrt(dx * dx + dy * dy + 100);
    let vx = -dx / length * 8;
    let vy = -dy / length * 8;

    particle.x += vx;
    particle.y += vy;

    vx *= friction;
    vy *= friction;


    let amountOfParticles = targets.length;
    if (length < 20) {
        if (Math.random() > 0.92) {
            targetIndex = Math.floor(Math.random() * amountOfParticles);
        } else {
            if (Math.random() > 0.99) {
                targetIndexDirection *= -1;
            }
            targetIndex += targetIndexDirection;
            targetIndex %= amountOfParticles;
            if (targetIndex < 0) {
                targetIndex += amountOfParticles;
            }
        }
    }


    particle.x = target.x;
    particle.y = target.y;

    trace[0].x = particle.x;
    trace[0].y = particle.y;
    const traceStep = 0.4;

    trace.forEach(function (current, index, array) {
        if (index === array.length - 1) return;
        let next = array[index + 1];
        // console.log(next)
        next.x -= traceStep * (next.x - current.x);
        next.y -= traceStep * (next.y - current.y);
    });
};

function resize() {
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
