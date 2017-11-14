
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/gbnikolov/pen/LjpQPP

import * as THREE from '../three';
import {TweenMax} from 'gsap';
import dat = require('dat-gui');
const CONFIG = {
    applyFactor: false,
    u_Red: false,
    u_mixFactor: 0.25,
    u_Noise: true,
};

let gui = new dat.GUI();
gui.add(CONFIG, 'applyFactor');
gui.add(CONFIG, 'u_Red');
gui.add(CONFIG, 'u_mixFactor', -2, 2).step(0.01);
gui.add(CONFIG, 'u_Noise');

class ClockTexture {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    constructor(width, height) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width = width;
        this.height = this.canvas.height = height;

        // this.canvas.style.position = 'fixed'
        // this.canvas.style.bottom = '1rem'
        // this.canvas.style.right = '1rem'
        // document.body.appendChild(this.canvas)
    }
    private getTime() {
        let date = new Date();

        let hours = date.getHours().toString();
        let minutes = date.getMinutes().toString();
        let seconds = date.getSeconds().toString();

        if (hours.length === 1) hours = `0${hours}`;
        if (minutes.length === 1) minutes = `0${minutes}`;
        if (seconds.length === 1) seconds = `0${seconds}`;

        return `${hours}:${minutes}:${seconds}`;
    }
    render() {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '120px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.getTime(), this.width / 2, this.height / 2 + 30);
        let img = this.ctx.getImageData(0, 0, this.width, this.height);
        return new THREE.Texture(img as any);
    }
}

let width = window.innerWidth;
let height = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const clock = new THREE.Clock();
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// let helper = new THREE.GridHelper(200, 20)
// scene.add(helper)

let clockTexture = new ClockTexture(1024, 512);

const uniforms = {
    u_texture1: { value: clockTexture.render() },
    u_texture2: { value: clockTexture.render() },
    u_time: { value: 0 },
    u_mixFactor: { value: 0 },
    u_Red: { value: false },
    u_Noise: { value: false },
};

const perlinNoise = require('./noise.glsl') as string;
const vertexShader = require('./vert.glsl') as string;
const fragmentShader = require('./frag.glsl') as string;

const geometry = new THREE.PlaneBufferGeometry(200, 100);
const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader: fragmentShader.replace(/<perlin-noise>/i, perlinNoise),
    side: THREE.DoubleSide
});
// const material = new THREE.MeshBasicMaterial({ color: 0xFF0000 })
const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0, 0, 0);
scene.add(mesh);

setInterval(updateClock, 500);
setScene();
renderFrame();

let clockCount = 0;
function updateClock() {
    if (CONFIG.applyFactor) {
        return;
    }
    if (clockCount % 2 === 0) {
        TweenMax.to(uniforms.u_mixFactor, 0.25, {
            value: 1, onComplete() {
                uniforms.u_texture1.value = clockTexture.render();
            }, onProgress(e) {
                console.log(e);
            }
        } as any);
    } else if (clockCount % 2 !== 0) {
        TweenMax.to(uniforms.u_mixFactor, 0.25, {
            value: 0, onComplete() {
                uniforms.u_texture2.value = clockTexture.render();
            }
        } as any);
    }
    clockCount += 1;
}

function setScene() {
    renderer.setSize(width, height);
    renderer.setClearColor(0x111111);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    document.body.appendChild(renderer.domElement);

    camera.position.set(0, 0, 150);
    camera.lookAt(new THREE.Vector3());
}

let time = 0;
function renderFrame() {
    window.requestAnimationFrame(renderFrame);
    renderer.render(scene, camera);
    time += clock.getDelta();
    uniforms.u_texture1.value.needsUpdate = true;
    uniforms.u_texture2.value.needsUpdate = true;
    uniforms.u_time.value = time;
    if (CONFIG.applyFactor) {
        uniforms.u_mixFactor.value = CONFIG.u_mixFactor;
    }
    uniforms.u_Noise.value = CONFIG.u_Noise;
    uniforms.u_Red.value = CONFIG.u_Red;
}
