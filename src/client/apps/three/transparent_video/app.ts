
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

require('./style.scss');

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

let lastUpdate;
let container;
let camera, scene, renderer;
let uniforms;

function init(showStats) {
    // stats
    if (showStats) {
        let stats = new Stats();
        stats.domElement.style.zIndex = '200';
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0';
        stats.domElement.style.top = '0';
        document.body.appendChild(stats.domElement);
        requestAnimationFrame(function updateStats() {
            stats.update();
            requestAnimationFrame(updateStats);
        });
    }

    // basic setup
    container = document.getElementById('container');
    camera = new THREE.Camera();
    camera.position.z = 1;
    scene = new THREE.Scene();

    // load video
    let video = document.getElementById('video') as HTMLVideoElement;
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;

    // shader stuff
    uniforms = {
        time: { type: 'f', value: 1.0 },
        texture: { type: 'sampler2D', value: videoTexture }
    };
    let material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
        transparent: true
    });
    lastUpdate = new Date().getTime();

    // put it together for rendering
    let geometry = new THREE.PlaneBufferGeometry(2, 2);
    let mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(0.8);
    scene.add(mesh);
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio / parseFloat(document.getElementById('resolution').value));
    container.appendChild(renderer.domElement);

    // event listeners
    document.getElementById('play-button').addEventListener('click', e => { video.play(); });
    document.getElementById('stop-button').addEventListener('click', e => { video.pause(); });
    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);
    document.getElementById('resolution').addEventListener('change', onResolutionChange, false);
}

// events
function onWindowResize() {
    renderer.setSize(window.innerHeight, window.innerHeight);
}
function onResolutionChange(evt) {
    let newResolutionScale = parseFloat(evt.target.value);
    renderer.setPixelRatio(window.devicePixelRatio / newResolutionScale);
}
function animate() {
    let currentTime = new Date().getTime();
    let timeSinceLastUpdate = currentTime - lastUpdate;
    lastUpdate = currentTime;

    requestAnimationFrame(animate);
    render(timeSinceLastUpdate);
}
function render(timeDelta) {
    uniforms.time.value += (timeDelta ? timeDelta / 1000 : 0.05);
    renderer.render(scene, camera);
}

// boot
init(true);
animate();
