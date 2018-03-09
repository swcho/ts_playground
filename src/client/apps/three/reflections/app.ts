
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
var camera,
    scene,
    renderer,
    effect,
    controls,
    element,
    container,
    rotationPoint,
    lightRotationPoint,
    sphere, skybox, textureCube;

var cube;
var cubeMaterial;
var mirrorSphere, mirrorSphereCamera;
var mirrorRect1, mirrorRect1Camera;
var mirrorRect2, mirrorRect2Camera;
var mirrorRect3, mirrorRect3Camera;
var mirrorRect4, mirrorRect4Camera;

document.addEventListener('mousemove', onDocumentMouseMove, false);

init();
// animate();

/**
 * Initializer function.
 */
function init() {
    // Build the container
    container = document.createElement('div');
    document.body.appendChild(container);

    // Create the scene.
    const urls = [
        TEXTURE_PATH + 'px.jpg', TEXTURE_PATH + 'nx.jpg',
        TEXTURE_PATH + 'py.jpg', TEXTURE_PATH + 'ny.jpg',
        TEXTURE_PATH + 'pz.jpg', TEXTURE_PATH + 'nz.jpg',
    ];
    const loader = new THREE.CubeTextureLoader();
    // loader.crossOrigin = "";
    const textureCube = loader.load(urls);
    textureCube.format = THREE.RGBFormat;
    scene = new THREE.Scene();
    scene.background = textureCube;

    // Create a rotation points.
    rotationPoint = new THREE.Object3D();
    rotationPoint.position.set(0, 0, 0);
    scene.add(rotationPoint);

    // light rotation point.
    lightRotationPoint = new THREE.Object3D();
    lightRotationPoint.position.set(0, 0, 0);
    scene.add(lightRotationPoint);

    // Create the camera.
    camera = new THREE.PerspectiveCamera(
        45, // Angle
        window.innerWidth / window.innerHeight, // Aspect Ratio.
        1, // Near view.
        23000 // Far view.
    );
    camera.position.z = -1500;
    camera.position.y = 200;

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
    controls.maxDistance = 2000;
    controls.minDistance = 500;
    controls.target.copy(new THREE.Vector3(0, 200, 0));
    camera.lookAt(new THREE.Vector3(0, 200, 0));

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
    const ambient = new THREE.AmbientLight(0xffffff);
    scene.add(ambient);

    const sun = new THREE.PointLight(0xffffcc, 1, 6000);
    sun.position.set(4000, 1000, -4000);
    scene.add(sun);

    const sun1 = new THREE.PointLight(0xffffcc, 1, 6000);
    sun1.position.set(-4000, 1000, -4000);
    scene.add(sun1);

    const sun2 = new THREE.PointLight(0xffffcc, 1, 6000);
    sun2.position.set(-4000, 1000, 4000);
    scene.add(sun2);

    const sun3 = new THREE.PointLight(0xffffcc, 1, 6000);
    sun3.position.set(4000, 1000, 4000);
    scene.add(sun3);

    const light = new THREE.PointLight(0x7777aa, 1, 1000);
    light.position.set(-200, 200, -175);
    lightRotationPoint.add(light);
    var geometry = new THREE.SphereBufferGeometry(10, 8, 8);
    var material = new THREE.MeshLambertMaterial({
        color: 0x7777aa,
        emissive: 0x7777aa,
    });
    var lightBall = new THREE.Mesh(geometry, material);
    lightBall.position.set(-200, 200, -175);
    lightRotationPoint.add(lightBall);

    var light2 = new THREE.PointLight(0xaa7777, 1, 1000);
    light2.position.set(200, 200, -175);
    lightRotationPoint.add(light2);
    var geometry = new THREE.SphereBufferGeometry(10, 8, 8);
    var material = new THREE.MeshLambertMaterial({
        color: 0xaa7777,
        emissive: 0xaa7777,
    });
    lightBall = new THREE.Mesh(geometry, material);
    lightBall.position.set(200, 200, -175);
    lightRotationPoint.add(lightBall);

    var light3 = new THREE.PointLight(0xaaaaaa, 1, 1000);
    light3.position.set(200, 200, 175);
    lightRotationPoint.add(light3);
    var geometry = new THREE.SphereBufferGeometry(10, 8, 8);
    var material = new THREE.MeshLambertMaterial({
        color: 0xaaaaaa,
        emissive: 0xaaaaaa,
    });
    lightBall = new THREE.Mesh(geometry, material);
    lightBall.position.set(200, 200, 175);
    lightRotationPoint.add(lightBall);

    var light4 = new THREE.PointLight(0x77aa77, 1, 1000);
    light4.position.set(-200, 200, 175);
    lightRotationPoint.add(light4);
    var geometry = new THREE.SphereBufferGeometry(10, 8, 8);
    var material = new THREE.MeshLambertMaterial({
        color: 0x77aa77,
        emissive: 0x77aa77,
    });
    lightBall = new THREE.Mesh(geometry, material);
    lightBall.position.set(-200, 200, 175);
    lightRotationPoint.add(lightBall);

    let light5 = new THREE.PointLight(0x777777, 1, 1400);
    light5.position.set(0, 1000, 0);
    scene.add(light5);

    // Create base.
    createBase();

    // Create the main object.
    createSphere();

    // Create surrounding shapes.
    createSphere1();
    createSphere2();
    createRect();
    createCone();

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
 * Updates to apply to the scene while running.
 */
function update() {
    camera.updateProjectionMatrix();
}

/**
 * Render the scene.
 */
function render() {
    // Render the main sphere.
    mirrorSphere.visible = false;
    mirrorSphereCamera.updateCubeMap(renderer, scene);
    mirrorSphere.visible = true;

    // Render the other materials.
    mirrorRect1.visible = false;
    mirrorRect1Camera.updateCubeMap(renderer, scene);
    mirrorRect1.visible = true;
    mirrorRect2.visible = false;
    mirrorRect2Camera.updateCubeMap(renderer, scene);
    mirrorRect2.visible = true;
    mirrorRect3.visible = false;
    mirrorRect3Camera.updateCubeMap(renderer, scene);
    mirrorRect3.visible = true;
    mirrorRect4.visible = false;
    mirrorRect4Camera.updateCubeMap(renderer, scene);
    mirrorRect4.visible = true;

    // Render the scene.
    renderer.render(scene, camera);

    // Rotate the lights.
    lightRotationPoint.rotation.y += 0.005;

    // Don't let the camera go too low.
    if (camera.position.y < 30) {
        camera.position.y = 30;
    }

    // Slowly rotate the scene.
    rotationPoint.rotation.y += 0.0005;
}

/**
 * Animate the scene.
 */
function animate() {
    requestAnimationFrame(animate);
    update();
    render();
}

function onDocumentMouseMove(event) {
    event.preventDefault();
}

function createSphere() {
    let geometry = new THREE.SphereGeometry(200, 64, 64);
    mirrorSphereCamera = new THREE.CubeCamera(0.1, 5000, 512);
    scene.add(mirrorSphereCamera);
    let mirrorSphereMaterial = new THREE.MeshBasicMaterial({ envMap: mirrorSphereCamera.renderTarget });
    mirrorSphere = new THREE.Mesh(geometry, mirrorSphereMaterial);
    mirrorSphere.position.set(0, 200, 0);
    mirrorSphereCamera.position.set(0, 200, 0);
    scene.add(mirrorSphere);
}

function createBase() {
    // Create a floor.
    let loader = new THREE.TextureLoader();
    loader.crossOrigin = "";
    loader.load(TEXTURE_PATH + 'MetalRustRepolished001_COL_1K_SPECULAR.jpg', function (texture) {

        let repeatX = 16;
        let repeatY = 16;

        texture.anisotropy = renderer.getMaxAnisotropy();
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX, repeatY);

        let normal = loader.load(TEXTURE_PATH + 'MetalRustRepolished001_NRM_1K_SPECULAR.jpg');
        normal.anisotropy = renderer.getMaxAnisotropy();
        normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
        normal.repeat.set(repeatX, repeatY);

        let ao = loader.load(TEXTURE_PATH + 'MetalRustRepolished001_GLOSS_VAR2_1K_SPECULAR.jpg');
        ao.anisotropy = renderer.getMaxAnisotropy();
        ao.wrapS = normal.wrapT = THREE.RepeatWrapping;
        ao.repeat.set(repeatX, repeatY);

        let displace = loader.load(TEXTURE_PATH + 'MetalRustRepolished001_DISP_1K_SPECULAR.jpg');
        displace.anisotropy = renderer.getMaxAnisotropy();
        displace.wrapS = displace.wrapT = THREE.RepeatWrapping;
        displace.repeat.set(repeatX, repeatY);

        let spec = loader.load(TEXTURE_PATH + 'MetalRustRepolished001_REFL_1K_SPECULAR.jpg');
        spec.anisotropy = renderer.getMaxAnisotropy();
        spec.wrapS = spec.wrapT = THREE.RepeatWrapping;
        spec.repeat.set(repeatX, repeatY);

        let material = new THREE.MeshStandardMaterial({
            aoMap: ao,
            aoMapIntensity: 0.5,
            color: 0x666666,
            map: texture,
            metalnessMap: texture,
            displacementMap: displace,
            normalMap: normal,
            envMap: scene.background,
            metalness: 0.7,
            // metalMap: texture,
            roughness: 0.2,
            // combine: THREE.MixOperation,
            // reflectivity: 0.3,
        });

        // Create the floor geometry and mesh. Add to scene.
        let geometry = new THREE.PlaneGeometry(50000, 50000);
        geometry.computeFaceNormals();
        let floor = new THREE.Mesh(geometry, material);
        floor.position.set(0, 0, 0);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);
    });
}

function createSphere1() {
    let geometry = new THREE.SphereGeometry(100, 32, 32);
    mirrorRect1Camera = new THREE.CubeCamera(0.1, 5000, 512);
    scene.add(mirrorRect1Camera);
    let mirrorRectMaterial = new THREE.MeshBasicMaterial({ envMap: mirrorRect1Camera.renderTarget });
    mirrorRect1 = new THREE.Mesh(geometry, mirrorRectMaterial);
    mirrorRect1.position.set(500, 600, 500);
    mirrorRect1Camera.position.set(-500, 600, 500);// = mirrorRect1.position;
    scene.add(mirrorRect1);
}

function createSphere2() {
    let geometry = new THREE.SphereGeometry(100, 32, 32);
    mirrorRect2Camera = new THREE.CubeCamera(0.1, 5000, 512);
    scene.add(mirrorRect2Camera);
    let mirrorRectMaterial = new THREE.MeshBasicMaterial({ envMap: mirrorRect2Camera.renderTarget });
    mirrorRect2 = new THREE.Mesh(geometry, mirrorRectMaterial);
    mirrorRect2.position.set(-500, 300, -500);
    mirrorRect2Camera.position.set(-500, 300, -500);
    scene.add(mirrorRect2);
}

function createRect() {
    let geometry = new THREE.CubeGeometry(200, 600, 200, 1, 1, 1, );
    mirrorRect3Camera = new THREE.CubeCamera(0.1, 5000, 512);
    scene.add(mirrorRect3Camera);
    let mirrorRectMaterial = new THREE.MeshBasicMaterial({
        envMap: mirrorRect3Camera.renderTarget,
        // reflectivity: 0.9,
        color: 0xaaaaaa,
    });
    mirrorRect3 = new THREE.Mesh(geometry, mirrorRectMaterial);
    mirrorRect3.position.set(-500, 300, 500);
    mirrorRect3Camera.position.set(-500, 300, 500);
    scene.add(mirrorRect3);
}

function createCone() {
    let geometry = new THREE.ConeGeometry(200, 600, 64);
    mirrorRect4Camera = new THREE.CubeCamera(1, 1000, 512);
    scene.add(mirrorRect4Camera);
    let mirrorRectMaterial = new THREE.MeshBasicMaterial({
        envMap: mirrorRect4Camera.renderTarget,
    });
    mirrorRect4 = new THREE.Mesh(geometry, mirrorRectMaterial);
    mirrorRect4.position.set(500, 300, -500);
    mirrorRect4Camera.position.set(500, 300, -500);
    scene.add(mirrorRect4);
}
