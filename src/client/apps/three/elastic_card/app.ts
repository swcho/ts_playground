
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import * as THREE from '../three';
import Stats = require('stats.js');
import dat = require('dat-gui');

///////////
// STATS //
///////////
const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.bottom = '0px';
stats.domElement.style.zIndex = '100';
document.body.appendChild(stats.domElement);
// stats.update();

const CONFIG = {
    wireframe: false,

    bloom: true,
    fxaa: true,
    copy: true,
    horizontalBlur: true,
    verticalBlur: true,
    colorMatrix: true,
};

let gui = new dat.GUI();
gui.add(CONFIG, 'wireframe');

//////////
// CODE //
//////////

/**
  A interactive webGL elastic material experiment.

  Inspired by Luigi De Rosa's [elastic material demo](https://twitter.com/luruke/status/847023253503856640)

  Monsters University ID from [Disney website](http://create.disney.co.uk/monsters-university/monsters-university-card)

  The BOING sound from [juskiddink](https://freesound.org/people/juskiddink/sounds/140867/)

  Made by [Ray Victor](https://twitter.com/ray7551)
 */
class MouseManager {
    static instance: MouseManager;

    dom: HTMLElement;
    position: THREE.Vector2;
    isPressing: boolean;
    constructor(domElement) {
        if (MouseManager.instance) {
            return MouseManager.instance;
        }

        this.dom = domElement;
        this.position = new THREE.Vector2();

        this.addMoveListener(this.onMove.bind(this));
        this.addDownListener(this.onDown.bind(this));
        this.addUpListener(this.onUp.bind(this));
        this.isPressing = false;

        MouseManager.instance = this;
    }

    updatePosition(clientX, clientY) {
        this.position.x = (clientX / this.dom.clientWidth) * 2 - 1;
        this.position.y = -(clientY / this.dom.clientHeight) * 2 + 1;
    }

    onMove(e) {
        let x, y;
        if (e.targetTouches) {
            x = e.targetTouches[0].clientX;
            y = e.targetTouches[0].clientY;
        } else {
            x = e.clientX;
            y = e.clientY;
        }
        this.updatePosition(x, y);
        // e.preventDefault();
    }
    addMoveListener(cb) {
        ['mousemove', 'touchmove'].forEach(evtName => {
            this.dom.addEventListener(evtName, cb, false);
        });
    }

    onDown(e) {
        this.isPressing = true;
        if (e.targetTouches) {
            let x = e.targetTouches[0].clientX;
            let y = e.targetTouches[0].clientY;
            this.updatePosition(x, y);
        };
    }
    addDownListener(cb) {
        ['mousedown', 'touchstart'].forEach(evtName => {
            this.dom.addEventListener(evtName, cb, false);
        });
    }

    onUp(e) {
        this.isPressing = false;
    }
    addUpListener(cb) {
        ['mouseup', 'touchend'].forEach(evtName => {
            this.dom.addEventListener(evtName, cb, false);
        });
    }
}
MouseManager.instance = null;

declare const threeOrbitViewer;
let createOrbitViewer = threeOrbitViewer(THREE);
let audio = new Audio('https://cdn.glitch.com/a7e5950b-6ba6-4ecd-9a13-c6864732a451%2Fboing.mp3?1504947644759');

// our basic full-screen application and render loop
let time = 0;
const app = createOrbitViewer({
    clearColor: 0xFFFFFF,
    clearAlpha: 0.0,
    fov: 70,
    position: new THREE.Vector3(0, 0, 100)
});

// load up a test image
const tex = new THREE.TextureLoader().load('https://cdn.glitch.com/a7e5950b-6ba6-4ecd-9a13-c6864732a451%2Fid.png?1504946992645', ready);
tex.minFilter = THREE.LinearFilter;

const shaderMat = new THREE.ShaderMaterial({
    vertexShader: require('./vert.glsl'), // document.getElementById('vert').textContent,
    fragmentShader: require('./frag.glsl'), // document.getElementById('frag').textContent,
    uniforms: {
        iChannel0: { type: 't', value: tex },
        uGrabCenter: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
        uTarget: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
        uTime: { type: 'f', value: 0 },
        uGrabStart: new THREE.Uniform(0.0),
        uReleaseStart: new THREE.Uniform(0.0),
    },
    // extensions: {
    //     // derivatives: true // don't need this now
    // },
    transparent: true,
    wireframe: true,
    side: THREE.DoubleSide
});

// once texture is ready, show our box
function ready() {
    let spacing = 30;
    // make a box, hidden until the texture has loaded
    const geo = new THREE.PlaneGeometry(
        tex.image.width / 10, tex.image.height / 10,
        // 5, 5
        Math.floor(tex.image.width / spacing), Math.floor(tex.image.height / spacing)
    );
    console.log('seg', geo.parameters.widthSegments, geo.parameters.heightSegments);

    const card = new THREE.Mesh(geo, shaderMat);
    app.scene.add(card);
    app.camera.lookAt(card.position);

    // create an (invisible) plane to drag the vertices on
    let dragPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(5000, 5000),
        new THREE.MeshBasicMaterial({
            color: 0x00FFFF, transparent: true, opacity: 0.0,
            depthWrite: false// , side:THREE.DoubleSide
        })
    );
    app.scene.add(dragPlane);

    const raycaster = new THREE.Raycaster();
    const mouse = new MouseManager(app.renderer.domElement);
    const canvas = app.renderer.domElement;
    let INTERSECTED = null;
    let grabCenter = new THREE.Vector3(0, 0, 0);
    let isGrabbing = false;
    mouse.addMoveListener((e) => {
        dragPlane.lookAt(app.camera.position);

        if (isGrabbing) {
            updateTargetPoint();
            return;
        }

        if (grabCenter) {
            dragPlane.position.copy(grabCenter);
        }
        updateCardIntersect();
    });

    // update mouse and card intersection
    function updateCardIntersect() {
        raycaster.setFromCamera(mouse.position, app.camera);
        let intersects = raycaster.intersectObject(card);

        if (intersects.length) {
            // enter card area
            if (!INTERSECTED) {
                INTERSECTED = intersects[0];
                canvas.classList.add('grabbable');
                return;
            }

            // mouse moving within the card
            INTERSECTED = intersects[0];
            grabCenter = INTERSECTED.point;
        } else if (INTERSECTED) {
            // out of card
            INTERSECTED = null;
            canvas.classList.remove('grabbable');
        }
    }

    // update mouse and dragPlane intersection
    function updateTargetPoint(offset = 0) {
        raycaster.setFromCamera(mouse.position, app.camera);
        let intersects = raycaster.intersectObject(dragPlane);
        if (intersects.length) {
            let target = intersects[0].point.clone();
            let offsetV = offset
                ? app.camera.position.clone().sub(target).multiplyScalar(offset)
                : new THREE.Vector3(0, 0, 0);
            shaderMat.uniforms.uTarget = new THREE.Uniform(target.add(offsetV));
            shaderMat.needsUpdate = true;
        }
    }

    mouse.addDownListener((e) => {
        updateCardIntersect();
        if (INTERSECTED) {
            // grabbing start
            isGrabbing = true;
            updateTargetPoint(0.5);
            app.controls.noRotate = true;
            canvas.classList.add('grabbing');

            shaderMat.uniforms.uGrabCenter = new THREE.Uniform(grabCenter.clone());
            shaderMat.uniforms.uGrabStart.value = time;
            shaderMat.uniforms.uReleaseStart.value = 0.0;
        }
    });
    mouse.addUpListener((e) => {
        if (isGrabbing) {
            // release grab
            isGrabbing = false;
            shaderMat.uniforms.uGrabStart.value = 0.0; // if grab time too short
            shaderMat.uniforms.uReleaseStart.value = time;
            app.controls.noRotate = false;

            if (!audio.paused) audio.currentTime = 0;
            audio.play();
        }
        if (INTERSECTED) {
            canvas.classList.remove('grabbing');
        }
    });

    app.on('tick', dt => {
        time += dt / 1000;
        shaderMat.uniforms.uTime.value = time;
    });
}
