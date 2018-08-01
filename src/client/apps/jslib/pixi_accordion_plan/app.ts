
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import * as PIXI from 'pixi.js';
import { TimelineMax, Elastic } from 'gsap';

console.clear();

let accordionTextures = {
    left: PIXI.Texture.fromImage('https://s3-us-west-2.amazonaws.com/s.cdpn.io/39255/accordion-left.png'),
    right: PIXI.Texture.fromImage('https://s3-us-west-2.amazonaws.com/s.cdpn.io/39255/accordion-right.png'),
    center: PIXI.Texture.fromImage('https://s3-us-west-2.amazonaws.com/s.cdpn.io/39255/accordion-center.png?v=1')
};

let accordion = {
    squash: 0.25,
    pull: -0.5,
    maxSquash: 0.2,
    maxPull: 0.1,
    center: null,
    left: PIXI.Sprite.from(accordionTextures.left as any),
    right: PIXI.Sprite.from(accordionTextures.right as any),
};


let tl = new TimelineMax({ repeat: -1, yoyo: true });

tl.fromTo(
    accordion,
    0.5,
    {
        squash: 0.4,
    },
    {
        squash: -0.5,
        ease: Elastic.easeInOut.config(1, 0.5)
    },
    0
);


/* ////////////////////////////////////////////////////////////////////////// */

let pointer = {
    x: window.innerWidth / 2,
    y: window.innerWidth / 2,
    cx: 0.5,
    cy: -0.5,
    track: function (e) {
        e = e.touches ? e.touches[0] : e;

        pointer.y = e.clientY;
        pointer.x = e.clientX;
        pointer.cx = ((e.clientX / window.innerWidth) - 0.5) * 2;
        pointer.cy = ((e.clientY / window.innerHeight) - 0.5) * 2;

    }
};
window.addEventListener('mousemove', pointer.track);
window.addEventListener('touchmove', pointer.track);
window.addEventListener('touchstart', pointer.track);


/* ////////////////////////////////////////////////////////////////////////// */

let renderer = PIXI.autoDetectRenderer(800, 700, {
    antialias: true,
    // transparent: true,
    roundPixels: true,
    forceFXAA: true,
    backgroundColor: 0x8DCAE8
});

document.querySelector('.accordion-plan').appendChild(renderer.view);

let stage = new PIXI.Container();


/* ////////////////////////////////////////////////////////////////////////// */

let container = new PIXI.Container();
stage.addChild(container);

let points = [];
let pointCount = 11;

function Circle() {
    let graphics = new PIXI.Graphics();
    graphics.alpha = 0.5;
    graphics.cacheAsBitmap = true;
    graphics.beginFill(0xEE0033);
    graphics.drawCircle(0, 0, 5); // drawCircle(x, y, radius)
    graphics.endFill();
    return graphics;
}

const pointMarkers = (new Array(3).fill(null)).map(Circle);
pointMarkers.forEach(g => container.addChild(g));

/*////////////////////////////////////////*/


function ease(current, target, ease) {
    return current + (target - current) * (ease || 0.2);
}


/*////////////////////////////////////////*/

// let curve = new Bezier(0, 0,
//     renderer.width * 0.5, 0,
//     renderer.width, 0);

accordionTextures.left.on('update', function () {
    accordion.left.pivot.x += this.width - 5;
});


function getRotation(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

declare const Bezier;

accordionTextures.center.on('update', function () {

    let texture: PIXI.Texture = this;
    let curve = new Bezier(0, 0,
        this.width * 0.5, 0,
        this.width, 0);

    let LUT = curve.getLUT(pointCount);

    for (let i = 0; i < pointCount; i++) {
        let point = new PIXI.Point(LUT[i].x, LUT[i].y); // , 0)
        points.push(point);
    }

    accordion.center = new PIXI.mesh.Rope(this, points);

    accordion.right.pivot.y += texture.height / 2;
    accordion.left.pivot.y += texture.height / 2;

    container.addChild(accordion.center, accordion.left, accordion.right);

    let w = Math.min(renderer.width / container.width, renderer.height / container.height) * 0.7;
    console.log(w);

    console.log(container.width);

    // container.pivot.set( -renderer.width/2, -renderer.height/2);
    // container.pivot.set( -renderer.width * w, renderer.height/-2 - texture.height/2);
    container.scale.set(w, w);
    container.position.set(container.width / 2, container.height / 1.6);

    let count = 1;

    animate();

    let offsetX = renderer.width * pointer.cx / -2; // pointer.x * 0.4;
    console.log(offsetX, pointer.cx, pointer.x * 0.4);

    function animate() {

        count += 0.01;

        let halfHeight = renderer.height / 2;

        // accordion.squash = pointer.cx;
        accordion.pull = pointer.cy;

        let offsetX = renderer.width * accordion.squash * accordion.maxSquash; // pointer.x * 0.4;
        let offsetY = renderer.height * accordion.pull * accordion.maxPull; // (pointer.y - halfHeight) * 0.05;

        // Left
        curve.points[0].x = offsetX;
        curve.points[0].y = offsetY;

        // Center
        curve.points[1].x = texture.width / 2;
        curve.points[1].y = -offsetY;

        // Right
        curve.points[2].x = texture.width - offsetX;
        curve.points[2].y = offsetY;

        pointMarkers.forEach(function (point, i) {
            const { x, y } = curve.points[i];
            point.position.x = x;
            point.position.y = y;
        });

        // Points along the curve
        let i = 0,
            len = points.length,
            LUT = curve.getLUT(len);

        for (; i < len; i++) {
            points[i].y = ease(points[i].y, LUT[i].y, 0.1); /// ((i+1)/4) );
            points[i].x = ease(points[i].x, LUT[i].x, 0.1); // / ((i+1)/4) );
        }

        if (accordion.left) {
            accordion.left.position.set(points[0].x, points[0].y);
            accordion.left.rotation = getRotation(points[0], points[1]);
        }

        if (accordion.right) {
            accordion.right.rotation = getRotation(points[len - 2], points[len - 1]);
            accordion.right.position.set(points[len - 1].x, points[len - 1].y);
        }

        renderer.render(stage);
        requestAnimationFrame(animate);
    }

});



