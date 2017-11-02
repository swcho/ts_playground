
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import './style.scss';
import * as GPU from 'gpu.js';

declare global {
    function mix(a, b, c);
    function cos(a);
    function sin(a);
    const thread;
    const dimensions;
    const uTexSize;
    const vTexCoord;
}

let anim;
let gpu = new GPU();
let kernel = gpu.createKernel(function (time, from, to) {
    // let tX = vTexCoord.x / uTexSize.x;
    // let tY = vTexCoord.y / uTexSize.y;
    let tX = this.thread.x / uTexSize.x;
    let tY = this.thread.y / uTexSize.y;
    // let tX = this.thread.x / this.dimensions.x;
    // let tY = this.thread.y / this.dimensions.y;
    // color(
    //     mix(from[0], to[0], tX),
    //     mix(from[1], to[1], tY),
    //     mix(from[2], to[2], tX)
    // );

    const vc = cos(-time);
    const vs = sin(time * 1.5);
    const c = (vc + 1.0) / 2.0;
    const s = (vs + 1.0) / 2.0;

    color(
        mix(1.0, 0.25, tX),
        mix(c, 1.0, tY),
        mix(0.25, s, tX)
    );
}, {
    dimensions: [window.innerWidth, window.innerHeight],
    graphical: true,
    output: {
        x: window.innerWidth,
        y: window.innerHeight,
    }
});

document.body.appendChild(kernel.getCanvas());

window.addEventListener('resize', () => {
    kernel.dimensions([
        window.innerWidth,
        window.innerHeight
    ]);
});

function draw() {

    let time = Date.now() / 400;
    let cos = Math.cos(-time);
    let sin = Math.sin(time * 1.5);
    let c = (cos + 1) / 2;
    let s = (sin + 1) / 2;

    kernel(
        // Date.now() * 0.0025 % (Math.PI * 2),
        Date.now() * 0.001 % (Math.PI * 2),
        [1.0, c, 0.25],
        [0.25, 1.0, s],
    );

    anim = requestAnimationFrame(draw);
}

anim = requestAnimationFrame(draw);
