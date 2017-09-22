
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// A tribute to the Tetka Falling Woman Flash Movie...
// http://www.geocities.ws/mr_marble_madness/ragdoll/tetka.htm
// https://codepen.io/ge1doot/pen/xrBryP

/// <reference path="def.d.ts"/>

import {CanvasUtil} from './canvas';
import {PointerUtil} from './pointer';
import {createZombie} from './zombie';
import {CollideItems} from './doll';
import {Particle, Aargh, Disk} from './objects';

const canvas = new CanvasUtil();
const ctx = canvas.init();
const pointer = new PointerUtil();
const zombie = createZombie(Math.sqrt(canvas.width) / 2);
pointer.init(canvas, zombie);

// ---- main loop ----
const particles: CollideItems<Particle> = {
    items: [],
    index: 0,
};
for (let i = 0; i < 800; i++) {
    particles.items.push(new Particle());
}

const aarghs: CollideItems<Aargh> = {
    items: [],
    index: 0,
};
['boom', 'pow', 'ooops', 'hmm', 'aargh', 'splash'].forEach(t => {
    aarghs.items.push(new Aargh(t, Math.sqrt(canvas.width) / 2));
});

const disks: Disk[] = [];
for (let i = 0; i < 10; i++) {
    disks.push(new Disk(zombie.s));
}

const run = () => {
    requestAnimationFrame(run);

    // draw full moon
    ctx.drawImage(canvas.background, 0, 0);

    canvas.scroll(zombie.points[0], !!pointer.draggingObj);

    for (const disk of disks) disk.anim(canvas, ctx);
    ctx.stroke();
    zombie.collide(canvas, disks, particles, aarghs);
    zombie.anim(canvas, pointer, ctx);
    for (const p of particles.items) p.anim(canvas, ctx);
    for (const a of aarghs.items) a.anim(canvas, ctx);
    ctx.globalCompositeOperation = 'lighter';

    // draw 2 pixcel radius circles
    ctx.drawImage(canvas.filter, 0, 0);

    ctx.globalCompositeOperation = 'source-over';
};

run();
