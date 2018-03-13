
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import './style.scss';

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


let container;

let camera, scene, renderer;

let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let dirLight;

const TEXTURE_PATH = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1037366';

init();
animate();


function init() {


    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 100;

    // scene

    scene = new THREE.Scene();

    let ambient = new THREE.AmbientLight(0x101030);
    scene.add(ambient);

    // LIGHTS

    dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(1, 0, 3).normalize();
    scene.add(dirLight);

    let spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(400, 1000, 100);

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    // spotLight.shadow.camera.near = 500;
    // spotLight.shadow.camera.far = 400;
    // spotLight.shadow.camera.fov = 30;

    scene.add(spotLight);

    let directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 0, 2);
    scene.add(directionalLight);

    // texture

    let manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {

        console.log(item, loaded, total);

    };

    // let texture = new THREE.Texture();

    let onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            let percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete) + '% downloaded');
        }
    };

    let onError = function (xhr) {
    };


    // model
    const loaderTexture = new THREE.TextureLoader();
    loaderTexture.setCrossOrigin('https://s.codepen.io');
    const texture = loaderTexture.load(TEXTURE_PATH + '/texture.png');

    const loader = new THREE.OBJLoader(manager);
    loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1037366/fighter.obj', function (object) {

        object.traverse(function (child) {

            if (child instanceof THREE.Mesh) {

                child.material.map = texture;

            }

        });

        object.position.y = 0;
        scene.add(object);

    }, onProgress, onError);


    //

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    document.addEventListener('mousemove', onDocumentMouseMove, false);

    //

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentMouseMove(event) {

    mouseX = (event.clientX - windowHalfX) / 2;
    mouseY = (event.clientY - windowHalfY) / 2;

}

//

function animate() {

    requestAnimationFrame(animate);
    render();

}

function render() {

    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (- mouseY - camera.position.y) * .05;

    camera.lookAt(scene.position);

    renderer.render(scene, camera);
    renderer.domElement.id = 'c';

}

