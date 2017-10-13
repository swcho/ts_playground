
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// ref: https://codepen.io/clindsey/pen/bRxJvO?editors=0010

import * as THREE from '../three';
import {Shell} from './shell';

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 0, 46);

// Lights
const light1 = new THREE.DirectionalLight(0xffffff);
light1.position.set(0, 0, 1);
scene.add(light1);

const light2 = new THREE.DirectionalLight(0xffffff);
light2.position.set(0, 1, 0);
scene.add(light2);

const shell = new Shell(30, 6);
scene.add(shell);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.autoClear = false;
// renderer.autoClearDepth = false;
renderer.setClearColor(0x666666);
const container = document.getElementById('js-app');
container.appendChild(renderer.domElement);

function animate(renderer, scene, camera, lastTime) {
    const currentTime = +(new Date);
    const deltaTime = (currentTime - lastTime) / 1000;
    requestAnimationFrame(() => {
        shell.time += deltaTime;
        animate(renderer, scene, camera, currentTime);
    });
    renderer.render(scene, camera);
}

animate(renderer, scene, camera, +(new Date));
