
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

import * as THREE from 'three';
import 'three/examples/js/controls/FlyControls';
import Stats = require('stats.js');

import {parseQuery} from '$lib/utils';

var stats = new Stats();
function initStats(elParent) {
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    elParent.append( stats.domElement );
    return stats;
}

interface Query {
    light: boolean;
    shadow: boolean;
    status: boolean;
}

const query = parseQuery<Query>(location.search);
console.log(query);

const USE_LIGHT = !!query.light;
const USE_SHADOW = !!query.shadow;
const USE_STATUS = !!query.status;
console.log(USE_LIGHT, USE_SHADOW, USE_STATUS);

declare module "three" {

    class FlyControls extends THREE.EventDispatcher {
        constructor(camera: THREE.Camera);
    }

}

const scene = new THREE.Scene();

// Axes
const axes = new THREE.AxisHelper(20);
scene.add(axes);

// Plane
const planeGeometry = new THREE.PlaneGeometry(60, 20, 1, 1);
const planeMaterial = USE_LIGHT
? new THREE.MeshLambertMaterial({
    color: 0xcccccc
})
: new THREE.MeshBasicMaterial({
    color: 0xcccccc
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
plane.position.x = 15;
plane.position.y = 0;
plane.position.z = 0;
plane.receiveShadow = USE_SHADOW;
scene.add(plane);

// Cube
var cubeGeometry = new THREE.CubeGeometry(4,4,4);
var cubeMaterial = USE_LIGHT
? new THREE.MeshLambertMaterial({
    color: 0xff0000
})
: new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
});
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.x = -4;
cube.position.y = 3;
cube.position.z = 0;
cube.castShadow = USE_SHADOW;
scene.add(cube);

// Sphere
var sphereGeometry = new THREE.SphereGeometry(4,20,20);
var sphereMaterial = USE_LIGHT
? new THREE.MeshLambertMaterial({
    color: 0x7777ff
})
: new THREE.MeshBasicMaterial({
    color: 0x7777ff,
    wireframe: true
});
var sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);
sphere.position.x = 20;
sphere.position.y = 4;
sphere.position.z = 2;
sphere.castShadow = USE_SHADOW;
scene.add(sphere);

// Camera
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000);
camera.position.x = -30;
camera.position.y = 40;
camera.position.z = 30;
camera.lookAt(scene.position);

if (USE_LIGHT) {
    // Lights
    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    if (USE_SHADOW) {
        // spotLight.shadowMapWidth = window.innerWidth;
        // spotLight.shadowMapHeight = window.innerHeight;
        spotLight.castShadow = USE_SHADOW;
    }
    scene.add(spotLight);
}

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(new THREE.Color(0xEEEEEE));
renderer.setSize(window.innerWidth, window.innerHeight);
if (USE_SHADOW) {
    renderer.shadowMapType = THREE.PCFSoftShadowMap;
    renderer.shadowMapEnabled = USE_SHADOW;
}
const elOutput = document.getElementById('output');
elOutput.appendChild(renderer.domElement);
if (USE_STATUS) {
    initStats(elOutput);
}

const flyControls: any = new THREE.FlyControls(camera);
flyControls.movementSpeed = 25;
flyControls.domElement = elOutput;
flyControls.rollSpeed = Math.PI / 24;
flyControls.autoForward = true;
flyControls.dragToLook = false;

// renderer.render(scene, camera);
let step = 0;
function render() {
    stats.update();
    requestAnimationFrame(render);

    cube.rotation.x += 0.02;
    cube.rotation.y += 0.02;
    cube.rotation.z += 0.02;

    step+=0.04;
    sphere.position.x = 20+( 10*(Math.cos(step)));
    sphere.position.y = 2 +( 10*Math.abs(Math.sin(step)));

    renderer.render(scene, camera)
}

render();
