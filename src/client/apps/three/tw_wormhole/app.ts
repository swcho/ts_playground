
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import * as THREE from '../three';
import {TweenMax, Power0, Power1} from 'gsap';

console.clear();

let ww = window.innerWidth,
    wh = window.innerHeight;

let renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas'),
    antialias: true
});
renderer.setSize(ww, wh);
renderer.setClearColor(0x000000);

let scene = new THREE.Scene();

scene.add(new THREE.AxisHelper(50));

// scene.fog = new THREE.Fog(0x000000, 100, 160);

let camera = new THREE.PerspectiveCamera(45, ww / wh, 0.1, 1000);
camera.position.y = 30;
camera.position.z = 100;
// TweenMax.to(camera.position, 6, {
//     z: 50,
//     y: 80,
//     yoyo: true,
//     ease: Power1.easeInOut,
//     repeatDelay: 0.5,
//     repeat: -1
// } as any);

new THREE.OrbitControls(camera);

let container = new THREE.Object3D();
scene.add(container);

// TweenMax.to(container.rotation, 48, {
//     y: Math.PI * 2,
//     ease: Power0.easeNone
// } as any);

let loader = new THREE.TextureLoader();
loader.crossOrigin = 'Anonymous';
/* Options */
let dots: THREE.Points<THREE.Geometry, THREE.PointsMaterial>;
let plane: THREE.Mesh<THREE.MeshBasicMaterial, THREE.PlaneGeometry>;
let width = 150,
    height = 150;
let center = new THREE.Vector3(0, 0, 0);
let maxDistance = new THREE.Vector3(width * 0.5, height * 0.5).distanceTo(center);

function createDots() {

    const planeGeom = new THREE.PlaneGeometry(width * 2, height * 2, width, height);
    const m = new THREE.Matrix4();
    m.makeRotationX(-Math.PI * 0.5);
    planeGeom.applyMatrix(m);
    for (let i = 0; i < planeGeom.vertices.length; i++) {
        let vector = planeGeom.vertices[i];
        vector['dist'] = vector.distanceTo(center);
        vector['ratio'] = (maxDistance - vector['dist']) / (maxDistance * 0.9);
    }
    const planeMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    planeMat.wireframe = true;
    plane = new THREE.Mesh(planeGeom, planeMat);
    container.add(plane);

    const geom = new THREE.Geometry();
    for (let x = (-width * 0.5); x < width * 0.5; x++) {
        for (let z = (-height * 0.5); z < height * 0.5; z++) {
            let vector = new THREE.Vector3(x * 1.2, 0, z * 1.2);
            vector['dist'] = vector.distanceTo(center);
            vector['ratio'] = (maxDistance - vector['dist']) / (maxDistance * 0.9);
            geom.vertices.push(vector);
        }
    }
    const mat = new THREE.PointsMaterial({
        color: 0xffffff,
        map: loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/127738/dotTexture.png'),
        transparent: true,
        alphaTest: 0.4
    });
    dots = new THREE.Points(geom, mat);
    container.add(dots);
}

let ease = {
    hole: 0,
    depth: 0
};
TweenMax.to(ease, 6, {
    hole: 2,
    depth: 1.5,
    yoyo: true,
    ease: Power1.easeInOut,
    repeatDelay: 0.5,
    repeat: -1
} as any);
function render(a) {

    requestAnimationFrame(render);

    for (let i = 0; i < dots.geometry.vertices.length; i++) {
        let vector = dots.geometry.vertices[i];
        let ratioA = (vector['ratio'] * ease.depth) + ease.hole;
        ratioA *= vector['ratio'] * vector['ratio'] * vector['ratio'] * vector['ratio'];
        vector.y = ratioA * -150;
        vector.y = Math.max(vector.y, -100);
        vector.y += Math.sin(-(vector['dist'] * 0.4) + (a * 0.004));
        // vector.y = Math.sin(-(vector['dist'] * 0.4) + (a * 0.004));
    }
    for (let i = 0; i < plane.geometry.vertices.length; i++) {
        let vector = plane.geometry.vertices[i];
        let ratioA = (vector['ratio'] * ease.depth) + ease.hole;
        ratioA *= vector['ratio'] * vector['ratio'] * vector['ratio'] * vector['ratio'];
        vector.y = ratioA * -150;
        vector.y = Math.max(vector.y, -100);
        vector.y += Math.sin(-(vector['dist'] * 0.4) + (a * 0.004));
        // vector.y = Math.sin(-(vector['dist'] * 0.4) + (a * 0.004));
    }

    dots.geometry.verticesNeedUpdate = true;
    plane.geometry.verticesNeedUpdate = true;

    // camera.lookAt(new THREE.Vector3(0, -20, 0));

    renderer.render(scene, camera);
}
createDots();
requestAnimationFrame(render);

window.addEventListener('resize', onResize);

function onResize() {
    ww = window.innerWidth;
    wh = window.innerHeight;
    camera.aspect = ww / wh;
    camera.updateProjectionMatrix();
    renderer.setSize(ww, wh);
}
