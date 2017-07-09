
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

import * as THREE from 'three';
import 'three/examples/js/controls/FlyControls';
import * as $ from 'jquery';

declare module "three" {

    class FlyControls extends THREE.EventDispatcher {
        constructor(camera: THREE.Camera);
    }

}

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(new THREE.Color(0xEEEEEE));
// renderer.setClearColor(new THREE.Color(0x000000));

renderer.setSize(window.innerWidth, window.innerHeight);

const axes = new THREE.AxisHelper(20);
scene.add(axes);

// Plane
const planeGeometry = new THREE.PlaneGeometry(60, 20, 1, 1);
const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xcccccc
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
plane.position.x = 15;
plane.position.y = 0;
plane.position.z = 0;
scene.add(plane);

// Cube
var cubeGeometry = new THREE.CubeGeometry(4,4,4);
var cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
});
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.x = -4;
cube.position.y = 3;
cube.position.z = 0;
scene.add(cube);

// Sphere
var sphereGeometry = new THREE.SphereGeometry(4,20,20);
var sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x7777ff,
    wireframe: true
});
var sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);
sphere.position.x = 20;
sphere.position.y = 4;
sphere.position.z = 2;
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

const elOutput = document.getElementById('output');
elOutput.appendChild(renderer.domElement);

const flyControls: any = new THREE.FlyControls(camera);
flyControls.movementSpeed = 25;
flyControls.domElement = elOutput;
flyControls.rollSpeed = Math.PI / 24;
flyControls.autoForward = true;
flyControls.dragToLook = false;

// renderer.render(scene, camera);

requestAnimationFrame(() => renderer.render(scene, camera));
