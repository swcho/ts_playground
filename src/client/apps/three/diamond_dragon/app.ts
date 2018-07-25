
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


let camera, scene, renderer;
let scale = 6;
let position = 10;
init();
animate();
function init() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 10, 40);
    scene = new THREE.Scene();

    // lights
    function createLight(color) {
        let pointLight = new THREE.PointLight(color, 15, 7);
        let geometry = new THREE.SphereGeometry(0.1, 0.1, 0.1);
        let material = new THREE.MeshBasicMaterial({ color: color });
        let sphere = new THREE.Mesh(geometry, material);
        pointLight.add(sphere);
        return pointLight;
    }

    for (let i = 0; i < 40; i++) {
        window['pointLight' + i] = createLight(Math.random() * 0xffffff); scene.add(
            window['pointLight' + i]);
    }

    //
    let manager = new THREE.LoadingManager();
    let material = new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 100 });
    let materialred = new THREE.MeshToonMaterial({ color: 0xff0000 });

    // HEAD
    let loader = new THREE.OBJLoader(manager);
    loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1037366/Head.OBJ', function (head) {
        head.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = material;
            }
        });
        head.position.y = position;
        head.scale.set(scale, scale, scale);
        scene.add(head);
    });

    // EYES
    loader = new THREE.OBJLoader(manager);
    loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1037366/Eyes.OBJ', function (eyes) {
        eyes.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = materialred;
            }
        });
        eyes.position.y = position;
        eyes.scale.set(scale, scale, scale);
        scene.add(eyes);

    });

    // jaw
    loader = new THREE.OBJLoader(manager);
    loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1037366/Jaw.OBJ', function (jaw) {
        jaw.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = materialred;
            }

        });
        jaw.position.y = position;
        jaw.scale.set(scale, scale, scale);
        scene.add(jaw);
    });

    // teeth
    loader = new THREE.OBJLoader(manager);
    loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1037366/Teeth.OBJ', function (teeth) {
        teeth.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = materialred;
            }
        });
        teeth.position.y = position;
        teeth.scale.set(scale, scale, scale);
        scene.add(teeth);
    });

    //
    // renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    //

    let controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 10, 0);
    controls.update();
    //
    window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    scene.rotation.y += 0.007;

    render();
}

function render() {
    let time = performance.now() * 0.0005;

    for (let i = 0; i < 10; i++) {
        time += 1 + i;
        window['pointLight' + i].position.x = Math.sin(time) * -8 + 0;
        window['pointLight' + i].position.y = Math.sin(time * 1) * 5 + 10;
        window['pointLight' + i].position.z = Math.sin(time * 1.2) * 13;
    }

    for (let i = 10; i < 20; i++) {
        time += 1 + i;
        window['pointLight' + i].position.x = Math.sin(time) * 8 + 0;
        window['pointLight' + i].position.y = Math.sin(time * 1) * 5 + 10;
        window['pointLight' + i].position.z = Math.sin(time * 1.2) * 13;
    }

    for (let i = 20; i < 30; i++) {
        time += 1 + i;
        window['pointLight' + i].position.x = Math.sin(time) * -16 + 0;
        window['pointLight' + i].position.y = Math.sin(time * 1) * 10 + 10;
        window['pointLight' + i].position.z = Math.sin(time * 1.2) * 13;
    }

    for (let i = 30; i < 40; i++) {
        time += 1 + i;
        window['pointLight' + i].position.x = Math.sin(time) * 16 + 0;
        window['pointLight' + i].position.y = Math.sin(time * 1) * 10 + 10;
        window['pointLight' + i].position.z = Math.sin(time * 1.2) * 13;
    }

    renderer.render(scene, camera);
}
