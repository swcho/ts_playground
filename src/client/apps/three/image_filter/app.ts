
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import * as THREE from '../three';
import {TweenMax, TimelineMax, Quint} from 'gsap';
import Stats = require('stats.js');
import dat = require('dat-gui');

///////////
// STATS //
///////////
// const stats = new Stats();
// stats.domElement.style.position = 'absolute';
// stats.domElement.style.bottom = '0px';
// stats.domElement.style.zIndex = '100';
// document.body.appendChild(stats.domElement);
// // stats.update();

// const CONFIG = {
//     wireframe: false,

//     bloom: true,
//     fxaa: true,
//     copy: true,
//     horizontalBlur: true,
//     verticalBlur: true,
//     colorMatrix: true,
// };

// let gui = new dat.GUI();
// gui.add(CONFIG, 'wireframe');


class NoiseApp01 {
    private renderer: THREE.WebGLRenderer;
    private mat: THREE.RawShaderMaterial;
    private mesh: THREE.Mesh;
    private scene: THREE.Scene;
    private cam: THREE.OrthographicCamera;
    private event: THREE.EventDispatcher;
    private folder;
    constructor(gui, name, renderWidth = 100, renderHeight = 100, targetWidth = 512, targetHeight = 512) {
        this.change = this.change.bind(this);
        this.fadeIn = this.fadeIn.bind(this);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        document.body.appendChild(this.renderer.domElement);
        this.renderer.setSize(renderWidth, renderHeight);

        let loader0 = new THREE.TextureLoader();
        loader0.crossOrigin = "Anonymous";
        let loader1 = new THREE.TextureLoader();
        loader1.crossOrigin = "Anonymous"

        this.mat = new THREE.RawShaderMaterial({
            vertexShader: document.getElementById('vs').textContent,
            fragmentShader: document.getElementById('fs').textContent,
            uniforms: {
                uTime: { value: 0 },
                uPow: { value: 0 },
                resolution: { value: new THREE.Vector2(400, 400) },
                bgTexture: { value: loader0.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/13842/texture02.png', () => { this.fadeIn() }) },
                bgTexture2: { value: loader1.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/13842/texture_copy_copy.png') },
                uMix: { value: -1 }
            },
            transparent: true
        })
        let geo = new THREE.PlaneBufferGeometry(400, 400);
        this.mesh = new THREE.Mesh(geo, this.mat);
        this.scene = new THREE.Scene();
        this.scene.add(this.mesh);
        this.cam = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 0, 1000);

        this.scene.add(this.cam);

        this.event = new THREE.EventDispatcher();

        // this.folder = gui.addFolder('')
        this.folder = gui;
        this.folder.add(this.mat.uniforms.uPow, 'value', 0, 20).step(0.1).name('uPow').listen();
        this.folder.add(this.mat.uniforms.uMix, 'value', -1, 2).step(0.01).name('uMix').listen();
        this.folder.add(this, 'change');
        this.folder.add(this, 'fadeIn');
        this.folder.add(this, 'fadeOut');
    }
    fadeIn() {
        TweenMax.to(this.mat.uniforms.uPow, 1, { value: 20, ease: Quint.easeIn } as any); //, ease: Quint.easeInOut });
    }
    fadeOut() {
        TweenMax.to(this.mat.uniforms.uPow, 1, { value: 0, ease: Quint.easeOut } as any); //, ease: Quint.easeInOut });
    }
    change() {
        let tl = new TimelineMax();
        // tl.to(this.mat.uniforms.uPow, 0.6, {value: 5})
        //    tl.to(this.mat.uniforms.uPow, 0.6, {value: 20, ease: Quint.easeIn}, 1)
        TweenMax.killTweensOf(this.mat.uniforms.uMix)
        if (this.mat.uniforms.uMix.value < 1.9) tl.to(this.mat.uniforms.uMix, 2, { value: 2, ease: Quint.easeInOut }, 0.0);
        else tl.to(this.mat.uniforms.uMix, 2, { value: -1, ease: Quint.easeInOut }, 0.0);
    }
    update() {
        this.mat.uniforms.uTime.value += 1 / 60;
        this.renderer.render(this.scene, this.cam);
    }
    eventDispatch() {
        this.event.dispatchEvent({ type: 'update' })
    }
    resize() {
        // this.cam.aspect = window.innerWidth / window.innerHeight;
        this.cam.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
let camera, scene, renderer, mouse, stats, geometry, shaderMaterial, mesh, clock;
let isLoop, gui, noiseApp01;

(() => {
    init();
    _setMesh();
    isLoop = true;
    TweenMax.ticker.addEventListener("tick", loop);
})();

function init() {

    clock = new THREE.Clock();

    document.addEventListener('mousemove', onDocumentMouseMove, false);

    gui = new dat.GUI();
}

function _setMesh() {
    noiseApp01 = new NoiseApp01(gui, 'noise', window.innerWidth, window.innerHeight);
}

function loop() {
    let delta = clock.getDelta();

    noiseApp01.update();
}



function onDocumentMouseMove(event) {
    event.preventDefault();
    if (!mouse) mouse = new THREE.Vector2();


    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}


window.addEventListener('resize', function (ev) {
    noiseApp01.resize();
});

window.addEventListener('keydown', function (ev) {
    switch (ev.which) {
        case 27:
            isLoop = !isLoop;
            if (isLoop) {
                clock.stop();
                TweenMax.ticker.addEventListener('tick', loop);
            } else {
                clock.start();
                TweenMax.ticker.removeEventListener('tick', loop);
            }
            break;
    }
});
