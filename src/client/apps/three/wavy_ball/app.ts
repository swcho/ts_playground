
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import * as THREE from '../three';

console.clear();

let ww = window.innerWidth,
    wh = window.innerHeight;

let renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas'),
    antialias: true
});
renderer.setSize(ww, wh);
renderer.setClearColor(0xffffff);

let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(45, ww / wh, 0.1, 2000);
camera.position.z = 200;

scene.add(new THREE.AxisHelper(500));
new THREE.OrbitControls(camera);

// let container = new THREE.Object3D();
// scene.add(container);

let objectLines = new THREE.Object3D();
scene.add(objectLines);

let loader = new THREE.TextureLoader();
loader.crossOrigin = 'Anonymous';
let mat = new THREE.PointsMaterial({
    color: 0x330000,
    map: loader.load(require('./dotTexture.png')),
    transparent: true,
    alphaTest: 0.5,
    sizeAttenuation: false
});
let dotsPerLine = 250;
let amountLines = 500;

class Line {
    private geometry: THREE.Geometry;
    mesh: THREE.Points;
    private length: number;
    private speed: number;
    constructor() {
        this.geometry = new THREE.Geometry();
        this.mesh = new THREE.Points(this.geometry, mat);
        this.length = Math.floor(Math.random() * 100 + 250);
        this.speed = Math.random() * 400 + 200;
        for (let i = -(this.length * 0.5); i < (this.length * 0.5); i++) {
            let vector = new THREE.Vector3(i * 0.4, 0, 0);
            this.geometry.vertices.push(vector);
        }
        this.mesh.rotation.x = Math.random() * Math.PI;
        this.mesh.rotation.y = Math.random() * Math.PI;
        this.mesh.rotation.z = Math.random() * Math.PI;
    }
    update(a) {
        for (let i = 0; i < this.geometry.vertices.length; i++) {
            let vector = this.geometry.vertices[i];
            vector.y = Math.sin(a / this.speed + i * 0.1) * 2.2;
        }
        this.geometry.verticesNeedUpdate = true;
    }
}
let lines: Line[] = [];


function init() {

    for (let i = 0; i < amountLines; i++) {
        lines.push(new Line());
        objectLines.add(lines[i].mesh);
    }

    requestAnimationFrame(render);

    window.addEventListener('resize', onResize);
}
function render(a) {
    requestAnimationFrame(render);


    objectLines.rotation.y = (a * 0.0001);
    objectLines.rotation.x = (-a * 0.0001);

    for (let i = 0; i < amountLines; i++) {
        lines[i].update(a);
    }
    renderer.render(scene, camera);
}


function onResize() {
    ww = window.innerWidth;
    wh = window.innerHeight;
    camera.aspect = ww / wh;
    camera.updateProjectionMatrix();
    renderer.setSize(ww, wh);
}

init();
