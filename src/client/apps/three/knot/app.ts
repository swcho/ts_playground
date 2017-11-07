
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/Thibka/pen/brGoGO

import * as THREE from '../three';
/*
=======================
Scene
=======================
*/
let scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

let canvas = document.getElementById('canvas') as HTMLCanvasElement,
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: false, antialias: false }),
    WIDTH = document.documentElement.clientWidth,
    HEIGHT = document.documentElement.clientHeight;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setSize(WIDTH, HEIGHT);

/*
=======================
Camera
=======================
*/
let camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, .1, 100);

camera.position.z = 10;
camera.position.x = 2;
camera.position.y = 2;
scene.add(camera);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .25;
controls.enableZoom = true;
controls.autoRotate = false;
controls.autoRotateSpeed = 5.0;
controls.minDistance = 4;
controls.maxDistance = 20;
controls.minPolarAngle = 0;
controls.maxPolarAngle = 1.5;

scene.fog = new THREE.Fog(0x000000, 5, 50);

window.addEventListener('resize', function () {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();

    pass2.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

/*
=======================
Lights
=======================
*/
let ambiantlight = new THREE.AmbientLight(0xffffff, .3);
scene.add(ambiantlight);

let light = new THREE.SpotLight(0xffffff, .3);
light.position.set(30, 30, 20);
light.castShadow = true;
light.penumbra = 1;
scene.add(light);

let light2 = new THREE.SpotLight(0xffffff, .5);
light2.position.set(-20, 10, 20);
light2.castShadow = true;
light2.penumbra = 1;
scene.add(light2);

/*
=======================
Mesh
=======================
*/
let geometry: THREE.Geometry;
let material: THREE.Material;
geometry = new THREE.PlaneGeometry(100, 100);
material = new THREE.MeshStandardMaterial({ color: 0x9e9e9e, roughness: 1.0 });
let plane = new THREE.Mesh(geometry, material);
plane.rotation.x = degToRad(-90);
plane.position.y = -2;
plane.receiveShadow = true;
scene.add(plane);

geometry = new THREE.TorusKnotGeometry(1, .5, 256, 64);
// geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);

material = new THREE.MeshStandardMaterial({
    map: null,
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.0
});
let torusKnot = new THREE.Mesh(geometry, material);
torusKnot.castShadow = true;
scene.add(torusKnot);


/*
=======================
Composer
=======================
*/

const WITHOUT_FXAA_ANTIALIASING = false;

let composer = new THREE.EffectComposer(renderer);
let renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);

let pass1 = new THREE.ShaderPass(THREE.ColorCorrectionShader);
composer.addPass(pass1);
if (WITHOUT_FXAA_ANTIALIASING) {
    pass1.renderToScreen = true;
}

let pass2;
console.log(window.devicePixelRatio);
pass2 = new THREE.ShaderPass(THREE.FXAAShader);
pass2.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
pass2.renderToScreen = true;

composer.setSize(window.innerWidth, window.innerHeight);
if (!WITHOUT_FXAA_ANTIALIASING) {
    composer.addPass(pass2);
}


/*
=======================
Logic
=======================
*/
camera.lookAt(scene.position);
// renderer.render(scene, camera);

animate();

function animate() {
    controls.update();
    requestAnimationFrame(animate);
    // renderer.render(scene, camera);
    composer.render();
    torusKnot.rotation.x += .01;
    torusKnot.rotation.y += .01;
}

function degToRad(deg) {
    return deg * Math.PI / 180;
}
