
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
    callback: true,
    rotation: true,
};

let gui = new dat.GUI();
gui.add(CONFIG, 'wireframe');
gui.add(CONFIG, 'callback');
gui.add(CONFIG, 'rotation');

/**
 * @file
 * The main scene.
 */

/**
 * Define constants.
 */
const TEXTURE_PATH = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123879/';

/**
 * Set our global variables.
 */
let camera,
    scene,
    renderer,
    effect,
    controls,
    element,
    container,
    rotationPoint;

let textureFlare0;
let textureFlare2;
let textureFlare3;

document.addEventListener('mousemove', onDocumentMouseMove, false);

init();
animate();

/**
 * Initializer function.
 */
function init() {
    // Build the container
    container = document.createElement('div');
    document.body.appendChild(container);

    // Create the scene.
    scene = new THREE.Scene();

    // Create a rotation point.
    rotationPoint = new THREE.Object3D();
    rotationPoint.position.set(0, 0, 1000);
    scene.add(rotationPoint);

    // Create the camera.
    camera = new THREE.PerspectiveCamera(
        50, // Angle
        window.innerWidth / window.innerHeight, // Aspect Ratio.
        1, // Near view.
        23000 // Far view.
    );
    rotationPoint.add(camera);

    // Build the renderer.
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    element = renderer.domElement;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled;
    container.appendChild(element);

    // Build the controls.
    controls = new THREE.OrbitControls(camera, element);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.maxDistance = 4000;
    controls.minDistance = 1000;
    controls.target.copy(new THREE.Vector3(0, 0, -100));

    function setOrientationControls(e) {
        if (!e.alpha) {
            return;
        }

        controls = new THREE.DeviceOrientationControls(camera);
        controls.connect();

        window.removeEventListener('deviceorientation', setOrientationControls, true);
    }
    window.addEventListener('deviceorientation', setOrientationControls, true);

    // Ambient lights
    const ambient = new THREE.AmbientLight(0x222222);
    scene.add(ambient);

    // The sun.
    const light = new THREE.PointLight(0xffffff, 1, 10000, 0);
    light.position.set(-8000, 0, 0);
    scene.add(light);

    // Add the skymap.
    addSkybox();

    // Add the sun.
    createSun(-11600, 0, 0);

    // Create a lensflare effect.
    createLensflare(-11400, 0, 0);

    // Add the sun.
    createSun(-11600, 4000, 5500);

    // Create a lensflare effect.
    createLensflare(-11400, 4000, 5500);

    // Add the sun.
    createSun(11600, 0, 0);

    // Create a lensflare effect.
    createLensflare(11400, 0, 0);

    // Add the sun.
    createSun(11600, -4000, 5500);

    // Create a lensflare effect.
    createLensflare(11400, -4000, 5500);

    // Add the sun.
    createSun(0, 0, -11600);

    // Create a lensflare effect.
    createLensflare(0, 0, -11400);

    // Add the sun.
    createSun(5500, 4000, -11600);

    // Create a lensflare effect.
    createLensflare(5500, 4000, -11400);

    // Add the sun.
    createSun(0, 0, 11600);

    // Create a lensflare effect.
    createLensflare(0, 0, 11400);

    // Add the sun.
    createSun(11600, 0, 11600);

    // Create a lensflare effect.
    createLensflare(11400, 0, 11400);

    // Add the sun.
    createSun(11600, 0, -11600);

    // Create a lensflare effect.
    createLensflare(11400, 0, -11400);

    // Add the sun.
    createSun(-11600, 0, -11600);

    // Create a lensflare effect.
    createLensflare(-11400, 0, -11400);

    // Add the sun.
    createSun(-11600, 0, 11600);

    // Create a lensflare effect.
    createLensflare(-11400, 0, 11400);

    // Add the sun.
    createSun(0, -11600, 0);

    // Create a lensflare effect.
    createLensflare(0, -11400, 0);

    // Add the sun.
    createSun(0, 11600, 0);

    // Create a lensflare effect.
    createLensflare(0, 11400, 0);


    window.addEventListener('resize', onWindowResize, false);
}

/**
 * Events to fire upon window resizing.
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Add the sun to the scene.
 */
function createSun(x, y, z) {
    // Add the Sun sphere model.
    let sunGeometry = new THREE.SphereGeometry(100, 16, 16);

    // Create the Sun materials.
    let sunMaterial = new THREE.MeshLambertMaterial({
        color: '#ffff55',
        emissive: '#ffff55',
    });
    sunMaterial.wireframe;

    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.castShadow = false;
    sun.receiveShadow = false;
    sun.position.set(x, y, z);
    sun.rotation.y = Math.PI;

    // Add the Sun to the scene.
    scene.add(sun);
}

/**
 * Updates to apply to the scene while running.
 */
function update() {
    camera.updateProjectionMatrix();

    if (CONFIG.rotation) {
        rotationPoint.rotation.y -= 0.0015;
    }
}

/**
 * Render the scene.
 */
function render() {
    renderer.render(scene, camera);
}

/**
 * Animate the scene.
 */
function animate() {
    requestAnimationFrame(animate);
    update();
    render();
    stats.update();
}

/**
 * Add the skybox, the stars wrapper.
 */
function addSkybox() {
    let urlPrefix = TEXTURE_PATH;
    let urls = [
        urlPrefix + 'test.jpg',
        urlPrefix + 'test.jpg',
        urlPrefix + 'test.jpg',
        urlPrefix + 'test.jpg',
        urlPrefix + 'test.jpg',
        urlPrefix + 'test.jpg',
    ];

    let loader = new THREE.CubeTextureLoader();
    loader.setCrossOrigin('https://s.codepen.io');

    let textureCube = loader.load(urls);
    textureCube.format = THREE.RGBFormat;

    let shader = THREE.ShaderLib['cube'];
    shader.uniforms['tCube'].value = textureCube;

    let material = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });
    // material.wireframe = true;

    let geometry = new THREE.BoxGeometry(20000, 20000, 20000);

    let skybox = new THREE.Mesh(geometry, material);
    // skybox.position.x = -30;

    scene.add(skybox);
}

/**
 * Create the lens flare effect.
 *
 * Code from https://threejs.org/examples/webgl_lensflares.html
 */
function createLensflare(x, y, z) {
    let textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('https://s.codepen.io');
    textureFlare0 = textureLoader.load(TEXTURE_PATH + 'sun.png');
    textureFlare2 = textureLoader.load(TEXTURE_PATH + 'lensflare2.png');
    textureFlare3 = textureLoader.load(TEXTURE_PATH + 'lensflare3.png');

    addLight(0.55, 0.9, 0.5, x, y, z);
}

/**
 * Add the lens flare to the scene.
 *
 * Code from https://threejs.org/examples/webgl_lensflares.html
 */
function addLight(h: number, s: number, l: number, x: number, y: number, z: number) {
    let flareColor = new THREE.Color(0xffffff);
    flareColor.setHSL(h, s, l + 0.5);

    let lensFlare = new THREE.LensFlare(textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor);

    lensFlare.add(textureFlare3, 60, 0.6, THREE.AdditiveBlending);
    lensFlare.add(textureFlare3, 70, 0.7, THREE.AdditiveBlending);
    lensFlare.add(textureFlare3, 120, 0.9, THREE.AdditiveBlending);
    lensFlare.add(textureFlare3, 70, 1.0, THREE.AdditiveBlending);

    lensFlare.customUpdateCallback = lensFlareUpdateCallback;
    lensFlare.position.set(x, y, z);

    scene.add(lensFlare);
}

/**
 * Update the lens flare.
 *
 * Code from https://threejs.org/examples/webgl_lensflares.html
 */
function lensFlareUpdateCallback(object) {
    if (!CONFIG.callback) return;
    let f, fl = object.lensFlares.length;
    let flare;
    let vecX = -object.positionScreen.x * 2;
    let vecY = -object.positionScreen.y * 2;

    for (f = 0; f < fl; f++) {
        flare = object.lensFlares[f];
        flare.x = object.positionScreen.x + vecX * flare.distance;
        flare.y = object.positionScreen.y + vecY * flare.distance;
        flare.rotation = 0;
    }

    object.lensFlares[2].y += 0.025;
    object.lensFlares[3].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad(45);
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    // mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    // mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
