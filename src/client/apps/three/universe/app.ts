
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/gvrban/pen/rzNGpW

import * as THREE from '../three';
import dat = require('dat-gui');
const CONFIG = {
    wireframe: false,
    distance: 500,
};

let gui = new dat.GUI();
gui.add(CONFIG, 'wireframe');
gui.add(CONFIG, 'distance', 0, 1000);

let camera, scene, renderer: THREE.WebGLRenderer;

let texture_placeholder,
    isUserInteracting = false,
    onMouseDownMouseX = 0, onMouseDownMouseY = 0,
    lon = 90, onMouseDownLon = 0,
    lat = 0, onMouseDownLat = 0,
    phi = 0, theta = 0,
    target = new THREE.Vector3();

let onPointerDownPointerX;
let onPointerDownPointerY;

let onPointerDownLon;
let onPointerDownLat;
// https://stackoverflow.com/questions/24087757/three-js-and-loading-a-cross-domain-image
THREE.ImageUtils.crossOrigin = '';

const gMaterials: THREE.MeshBasicMaterial[] = [];

function loadTexture(path) {

    let texture = new THREE.Texture(texture_placeholder);
    // https://stackoverflow.com/questions/29421702/threejs-texture
    texture.minFilter = THREE.LinearFilter;
    let material = new THREE.MeshBasicMaterial({
        map: texture,
        // overdraw: 0.5,
        // side: THREE.DoubleSide,
    });

    let image = new Image();
    image.onload = function () {
        texture.image = this;
        texture.needsUpdate = true;
    };
    image.src = path;

    gMaterials.push(material);
    return material;

}

function init() {

    const container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1500);

    scene = new THREE.Scene();

    texture_placeholder = document.createElement('canvas');
    texture_placeholder.width = 128;
    texture_placeholder.height = 128;

    let context = texture_placeholder.getContext('2d');
    context.fillStyle = 'rgb( 200, 200, 200 )';
    context.fillRect(0, 0, texture_placeholder.width, texture_placeholder.height);

    // https://stackoverflow.com/questions/36059642/how-to-disable-three-js-to-resize-images-in-power-of-two
    let materials = [
        loadTexture(require('./space4.jpg')), // right
        loadTexture(require('./space2.jpg')), // left
        loadTexture(require('./space1.jpg')), // top
        loadTexture(require('./space6.jpg')), // bottom
        loadTexture(require('./space3.jpg')), // back
        loadTexture(require('./space5.jpg')) // front
    ];

    const DETAIL = 7;

    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(550, 550, 550, DETAIL, DETAIL, DETAIL),
        new THREE.MultiMaterial(materials),
        // materials[0],
    );

    // Render texture inner side, this makes no need to set double sided
    mesh.scale.x = -1;
    scene.add(mesh);
    const geometry = mesh.geometry as THREE.Geometry;
    for (let i = 0, l = geometry.vertices.length; i < l; i++) {
        let vertex = geometry.vertices[i];
        vertex.normalize();
        vertex.multiplyScalar(550);
    }

    // renderer = new THREE.CanvasRenderer();
    renderer = new THREE.WebGLRenderer();
    // renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    // document.addEventListener( 'wheel', onDocumentMouseWheel, false );

    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);

    //

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentMouseDown(event) {

    event.preventDefault();

    isUserInteracting = true;

    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;

    onPointerDownLon = lon;
    onPointerDownLat = lat;

}

function onDocumentMouseMove(event) {

    if (isUserInteracting === true) {

        lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
        lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;

    }
}

function onDocumentMouseUp(event) {

    isUserInteracting = false;

}

// 	function onDocumentMouseWheel( event ) {

// 	camera.fov += event.deltaY * 0.05;
// 	camera.updateProjectionMatrix();

// 	}

function onDocumentTouchStart(event) {

    if (event.touches.length === 1) {

        event.preventDefault();

        onPointerDownPointerX = event.touches[0].pageX;
        onPointerDownPointerY = event.touches[0].pageY;

        onPointerDownLon = lon;
        onPointerDownLat = lat;

    }

}

function onDocumentTouchMove(event) {

    if (event.touches.length === 1) {

        event.preventDefault();

        lon = (onPointerDownPointerX - event.touches[0].pageX) * 0.1 + onPointerDownLon;
        lat = (event.touches[0].pageY - onPointerDownPointerY) * 0.1 + onPointerDownLat;

    }

}

function animate() {

    requestAnimationFrame(animate);
    update();

}

function update() {
    const {
        wireframe,
        distance,
    } = CONFIG;

    if (isUserInteracting === false) {
        lon += 0.1;
    }

    for (const m of gMaterials) {
        m.wireframe = CONFIG.wireframe;
    }

    lat = Math.max(- 85, Math.min(85, lat));
    phi = THREE.Math.degToRad(90 - lat);
    theta = THREE.Math.degToRad(lon);

    target.x = distance * Math.sin(phi) * Math.cos(theta);
    target.y = distance * Math.cos(phi);
    target.z = distance * Math.sin(phi) * Math.sin(theta);

    camera.position.copy(target).negate();
    camera.lookAt(target);

    renderer.render(scene, camera);

}

init();
animate();
