
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);
console.log('Tree generator');

// https://codepen.io/tsuhre/pen/RgYpKx
import FileSaver = require('file-saver');
import 'three/examples/js/controls/FlyControls';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/effects/AsciiEffect';
import Stats = require('stats.js');
import dat = require('dat-gui');

import * as THREE from '../three';
import * as THREEx from '../threex';
require('./style.css');

let container, scene, camera, renderer, controls, stats;
let keyboard = new THREEx.KeyboardState();
let clock = new THREE.Clock();

let slices = 0;
let maxSlices = 2500;
let angleMod = 0.05;
let splitChance = .15;

let heightMod = 1;
let widthMod = .2;
let startingSize = 1;
let branchVariance = .3;

let sizeMod = 4;
let sizeDec = .03;

let sections = 10;

let objects = [];
let gui;

window.onload = function () {
    gui = new dat.GUI();
    let controllers = [];
    controllers.push(gui.add(this, 'maxSlices', 100, 10000));
    controllers.push(gui.add(this, 'splitChance', 0, 1, .01));
    controllers.push(gui.add(this, 'angleMod', 0, .2, .01));
    controllers.push(gui.add(this, 'heightMod', .1, 4, .1));
    controllers.push(gui.add(this, 'widthMod', .1, 1, .05));
    controllers.push(gui.add(this, 'startingSize', 0, 10, .01));
    controllers.push(gui.add(this, 'sizeDec', .01, 1, .01));
    controllers.push(gui.add(this, 'branchVariance', 0, 1, .01));
    controllers.push(gui.add(this, 'sections', 3, 30, 1));
    gui.add(this, 'randomizeVars');
    gui.add(this, 'resetVars');

    for (let i = 0; i < controllers.length; i++) {
        controllers[i].onFinishChange(function () {
            generateTree();
        });
    }
};


function RW(x, y, z, size, tickOffset) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.prevX = x;
    this.prevY = y;
    this.prevZ = z;
    this.prevSize = this.size;
    this.size = size;

    this.numTicks = tickOffset;
    this.speed = Math.random() * widthMod + .05;
    this.angle = Math.random() * 2 * Math.PI;
    this.angleMod = Math.random() * angleMod + .05;
    this.angleMod *= 2 * Math.PI;
    this.geom = new THREE.Geometry();

    this.update = function () {
        slices++;

        this.prevX = this.x;
        this.prevY = this.y;
        this.prevZ = this.z;
        this.prevSize = this.size;

        this.x += Math.cos(this.angle) * this.speed * sizeMod;
        this.y += Math.sin(this.angle) * this.speed * sizeMod;
        this.z += heightMod;
        this.size -= sizeDec;

        if (this.size < 0) return;

        if (Math.random() < .5) this.angleMod *= -1;
        this.angle += Math.random() * this.angleMod;

        let vertices = [];
        for (let i = 0; i < sections; i++) {
            let mod = 0;
            if (this.numTicks % 2 === 0) mod = .5;
            let ratio = (i + mod) / sections;
            let ratio2 = (i + .5 + mod) / sections;
            let a1 = ratio * 2 * Math.PI;
            let a2 = ratio2 * 2 * Math.PI;

            vertices.push(new THREE.Vector3(
                (Math.cos(a1) * this.prevSize + this.prevX) * sizeMod,
                this.prevZ * sizeMod,
                (Math.sin(a1) * this.prevSize + this.prevY) * sizeMod
            ));
            vertices.push(new THREE.Vector3(
                (Math.cos(a2) * this.size + this.x) * sizeMod,
                this.z * sizeMod,
                (Math.sin(a2) * this.size + this.y) * sizeMod
            ));
        }

        let base = this.geom.vertices.length;

        for (let i = 0; i < vertices.length; i++) {
            this.geom.vertices.push(vertices[i]);
        }

        for (let i = 0; i < vertices.length; i++) {
            if (i % 2 === 1) {
                this.geom.faces.push(new THREE.Face3(
                    // base + i,
                    base + (i + 2) % vertices.length,
                    base + (i + 1) % vertices.length,
                    base + i,
                ));
            } else {
                this.geom.faces.push(new THREE.Face3(
                    base + i,
                    base + (i + 1) % vertices.length,
                    base + (i + 2) % vertices.length
                ));
            }
        }

        this.numTicks++;
    };
}

init();
animate();

function init() {
    scene = new THREE.Scene();

    let SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    let VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(0, 150, 400);
    camera.lookAt(scene.position);

    //////////////
    // RENDERER //
    //////////////
    if (THREEx.Detector.webgl) renderer = new THREE.WebGLRenderer({ antialias: true });
    else renderer = new THREE.CanvasRenderer();

    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container = document.getElementById('ThreeJS');
    container.appendChild(renderer.domElement);

    ////////////
    // EVENTS //
    ////////////

    THREEx.WindowResize(renderer, camera);
    THREEx.FullScreen.bindKey({ charCode: 'm'.charCodeAt(0) });

    //////////////
    // CONTROLS //
    //////////////

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;

    ///////////
    // STATS //
    ///////////
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild(stats.domElement);

    ///////////
    // LIGHT //
    ///////////

    let light = new THREE.DirectionalLight(0xffffff);
    light.position.set(200, 1000, 200);
    scene.add(light);
    let ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);


    // generate a tree:
    generateTree();
}

function clearScene() {
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
}

function generateTree() {
    slices = 0;

    for (let i = 0; i < objects.length; i++) {
        scene.remove(objects[i]);
    }

    objects = [];

    let rws = [];
    rws.push(new RW(0, 0, 0, startingSize, 0));

    while (slices < maxSlices && rws.length > 0) {
        for (let i = rws.length - 1; i > -1; i--) {
            rws[i].update();
            if (rws[i].size < 0) {
                rws.splice(i, 0);
                continue;
            }
            if (slices < maxSlices && Math.random() < splitChance) rws.push(new RW(
                rws[i].x,
                rws[i].y,
                rws[i].z,
                rws[i].size * (Math.random() * branchVariance + (1 - branchVariance)),
                rws[i].numTicks % 2
            ));
        }
    }

    for (let i = 0; i < rws.length; i++) {
        rws[i].geom.computeFaceNormals();
        // var material = new THREE.MeshPhongMaterial({color: 0xffffff});
        let material = new THREE.MeshNormalMaterial();
        // material.side = THREE.DoubleSide;
        material['perPixel'] = true;
        let object = new THREE.Mesh(rws[i].geom, material);
        object.name = '' + performance.now();
        objects.push(object);
        scene.add(object);
    }
}

function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}

function update() {
    // delta = change in time since last call (in seconds)
    let delta = clock.getDelta();

    // functionality provided by THREEx.KeyboardState.js
    if (keyboard.pressed('1'))
        document.getElementById('message').innerHTML = ' Have a nice day! - 1';
    if (keyboard.pressed('2'))
        document.getElementById('message').innerHTML = ' Have a nice day! - 2 ';

    controls.update();
    stats.update();
}

function randomizeVars() {
    for (let i = 0; i < gui.__controllers.length - 2; i++) {
        let controller = gui.__controllers[i];

        let range = controller.__max - controller.__min;
        console.log(range);
        let value = controller.__min + Math.random() * range;
        if (controller.__step > 1) value = Math.floor(value);
        controller.setValue(value);
    }
    generateTree();
}

function resetVars() {
    for (let i = 0; i < gui.__controllers.length; i++) {
        gui.__controllers[i].setValue(gui.__controllers[i].initialValue);
    }
    generateTree();
}

function exportSceneOBJ() {
    let date = new Date();

    let exporter = new THREE.OBJExporter();
    let output = exporter.parse(scene);
    let blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, 'Tree_' + date.getTime() + '.obj');
}

function exportSceneSTL() {
    let date = new Date();
    THREE.saveSTL(scene, 'TreeGeneratorSTL_' + date.getTime());
}

document.body.onmousedown = function () {
    controls.autoRotate = false;
};
document.body.onmouseup = function () {
    controls.autoRotate = true;
};

function render() {
    renderer.render(scene, camera);
}

// Get the modal
let modal = document.getElementById('myModal');

// Get the button that opens the modal
let btn = document.getElementById('myBtn');

// Get the <span> element that closes the modal
let span = document.getElementsByClassName('close')[0] as HTMLSpanElement;

// When the user clicks on the button, open the modal
btn.onclick = function () {
    modal.style.display = 'block';
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = 'none';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
