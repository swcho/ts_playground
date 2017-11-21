
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import * as THREE from '../three';
import {TweenMax, Power0, Power1} from 'gsap';

console.clear();

var ww = window.innerWidth,
    wh = window.innerHeight;

var renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("canvas"),
    antialias: true
});
renderer.setSize(ww, wh);
renderer.setClearColor(0x000000);

var scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 100, 160);

var camera = new THREE.PerspectiveCamera(45, ww / wh, 0.1, 1000);
camera.position.y = 30;
camera.position.z = 100;
TweenMax.to(camera.position, 6, {
    z: 50,
    y: 80,
    yoyo: true,
    ease: Power1.easeInOut,
    repeatDelay: 0.5,
    repeat: -1
} as any);

var container = new THREE.Object3D();
scene.add(container);

TweenMax.to(container.rotation, 48, {
    y: Math.PI * 2,
    ease: Power0.easeNone
} as any);

var loader = new THREE.TextureLoader();
loader.crossOrigin = 'Anonymous';
/* Options */
var dots, plane;
var width = 150,
    height = 150;
var center = new THREE.Vector3(0, 0, 0);
var maxDistance = new THREE.Vector3(width * 0.5, height * 0.5).distanceTo(center);

function createDots() {
    var geom = new THREE.Geometry();

    var planeGeom = new THREE.PlaneGeometry(width * 2, height * 2, width, height);
    var m = new THREE.Matrix4();
    m.makeRotationX(-Math.PI * 0.5);
    planeGeom.applyMatrix(m);
    for (var i = 0; i < planeGeom.vertices.length; i++) {
        var vector = planeGeom.vertices[i];
        vector['dist'] = vector.distanceTo(center);
        vector['ratio'] = (maxDistance - vector['dist']) / (maxDistance * 0.9);
    }
    var planeMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    plane = new THREE.Mesh(planeGeom, planeMat);
    container.add(plane);

    for (var x = (-width * 0.5); x < width * 0.5; x++) {
        for (var z = (-height * 0.5); z < height * 0.5; z++) {
            var vector = new THREE.Vector3(x * 1.2, 0, z * 1.2);
            vector['dist'] = vector.distanceTo(center);
            vector['ratio'] = (maxDistance - vector['dist']) / (maxDistance * 0.9);
            geom.vertices.push(vector);
        }
    }
    var mat = new THREE.PointsMaterial({
        color: 0xffffff,
        map: loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/127738/dotTexture.png'),
        transparent: true,
        alphaTest: 0.4
    });
    dots = new THREE.Points(geom, mat);
    container.add(dots);
}

var ease = {
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

    for (var i = 0; i < dots.geometry.vertices.length; i++) {
        var vector = dots.geometry.vertices[i];
        let ratioA = (vector.ratio * ease.depth) + ease.hole;
        ratioA *= vector.ratio * vector.ratio * vector.ratio * vector.ratio;
        vector.y = ratioA * -150;
        vector.y = Math.max(vector.y, -100);
        vector.y += Math.sin(-(vector.dist * 0.4) + (a * 0.004));
    }
    for (var i = 0; i < plane.geometry.vertices.length; i++) {
        var vector = plane.geometry.vertices[i];
        let ratioA = (vector.ratio * ease.depth) + ease.hole;
        ratioA *= vector.ratio * vector.ratio * vector.ratio * vector.ratio;
        vector.y = ratioA * -150;
        vector.y = Math.max(vector.y, -100);
        vector.y += Math.sin(-(vector.dist * 0.4) + (a * 0.004));
    }

    dots.geometry.verticesNeedUpdate = true;
    plane.geometry.verticesNeedUpdate = true;

    camera.lookAt(new THREE.Vector3(0, -20, 0));

    renderer.render(scene, camera);
}
createDots();
requestAnimationFrame(render);

window.addEventListener("resize", onResize);

function onResize() {
    ww = window.innerWidth;
    wh = window.innerHeight;
    camera.aspect = ww / wh;
    camera.updateProjectionMatrix();
    renderer.setSize(ww, wh);
}
