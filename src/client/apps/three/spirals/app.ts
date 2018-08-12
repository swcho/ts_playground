
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import * as THREE from '../three';
import Stats = require('stats.js');
import dat = require('dat-gui');
import { Power2, Power0, TweenMax, TimelineMax } from 'gsap';

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

console.clear();
let ww = window.innerWidth,
  wh = window.innerHeight;

const elScene = document.getElementById('scene') as HTMLCanvasElement;

let renderer = new THREE.WebGLRenderer({
  canvas: elScene,
  antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.setSize(ww, wh);
renderer.setClearColor(0xA5DEE5);

let radius = 10;
let length = 200;
let amount = 1000;
let currentSpeed = 1;

let camera = new THREE.PerspectiveCamera(45, ww / wh, 0.1, 10000);
camera.position.z = length * 0.5;
camera.position.x = 200;
if (ww < 900) {
  camera.position.x = 400;
}
camera.lookAt(new THREE.Vector3(0, 0, length * 0.5));

let scene = new THREE.Scene();
let light = new THREE.HemisphereLight( 0xeeeecc, 0x72a6ad, 1 );
scene.add( light );
let light2 = new THREE.AmbientLight( 0x111111 );
scene.add( light2 );

let geometry = new THREE.Geometry();
for (let i = 0; i < amount; i++) {
  let x = Math.cos(i * 0.03) * radius;
  let y = Math.sin(i * 0.03) * radius;
  let z = i / amount * length;
  let vector = new THREE.Vector3(x, y, z);
  geometry.vertices.push(vector);
}

let slices = 200;
let rseg = 18;
let tubeRadius = 8;
let curve = new THREE.CatmullRomCurve3(geometry.vertices);
let tubeGeom = new THREE.Geometry();
tubeGeom.vertices = curve.getPoints(slices);
let geometryTube = new THREE.TubeGeometry(curve, slices, tubeRadius, rseg, false);
let material2 = new THREE.MeshPhongMaterial({
  color: 0xFFCFDF,
  emissive: 0x4e001a,
  wireframe: false
});

let circles = geometryTube.vertices.length / rseg;
for (let i = 0; i < circles; i++) {
  let color = new THREE.Color(
    'hsl(' + Math.floor(Math.random() * 360) + ',50%,50%)'
  );
  let ratio = Power2.easeIn.getRatio(i / slices);
  let center = tubeGeom.vertices[i];
  ratio = Math.max(
    0,
    Math.min(1, Math.abs((center.z - length * 0.5) / (length * 0.5)))
  );
  for (let j = 0; j < rseg; j++) {
    geometryTube.colors[i * rseg + j] = color;
    let vector = geometryTube.vertices[i * rseg + j];
    vector.x -= (vector.x - center.x) * ratio;
    vector.y -= (vector.y - center.y) * ratio;
    vector.z -= (vector.z - center.z) * ratio;
  }
}
let spirals = new THREE.Object3D();
scene.add(spirals);
let spiral = new THREE.Mesh(geometryTube, material2);
spirals.add(spiral);

let material = new THREE.MeshPhongMaterial({
  color: 0xE0F9B5,
  emissive: 0x1f2f04,
  wireframe: false
});
let spiral2 = new THREE.Mesh(geometry, material);
spiral2.rotation.z = Math.PI;
spirals.add(spiral2);

let boxGeom = new THREE.BoxGeometry(length * 5, length, length);
let boxMat = new THREE.MeshBasicMaterial({
  color: 0xA5DEE5,
  side: THREE.BackSide
});
let mesh = new THREE.Mesh(boxGeom, boxMat);
mesh.position.z = length * 0.5;
scene.add(mesh);

let duration = 3;
let ease = Power0.easeNone;
let radToDegree = 180 / Math.PI;
TweenMax.set(spiral, {
  three: {
    z: -length
  }
});
let tl = new TimelineMax({
  repeat: -1,
  onReverseComplete: function() {
    tl.totalTime(tl.duration() * 100).resume();
  },
  repeatDelay: 0
});
tl.to(
  spiral2,
  duration,
  {
    three: {
      rotationZ: Math.PI * 5 * radToDegree
    },
    ease: ease
  },
  0
);
tl.to(
  spiral,
  duration,
  {
    three: {
      z: length,
      rotationZ: Math.PI * 24 * radToDegree
    },
    ease: ease
  },
  0
);

let forward = true;
let prevDirection = true;
function render() {
  requestAnimationFrame(render);

  if (currentSpeed < 0) {
    currentSpeed = Math.min(-0.7, Math.max(-10, currentSpeed + 0.06));
  } else {
    currentSpeed = Math.max(0.7, Math.min(10, currentSpeed - 0.06));
  }
  forward = currentSpeed < 0;
  if (forward !== prevDirection) {
    tl.reversed(forward);
    prevDirection = forward;
  }

  tl.timeScale(Math.abs(currentSpeed));

  renderer.render(scene, camera);
}

function onResize() {
  ww = window.innerWidth;
  wh = window.innerHeight;
  camera.aspect = ww / wh;
  camera.updateProjectionMatrix();
  renderer.setSize(ww, wh);
  camera.position.x = 200;
  if (ww < 900) {
    camera.position.x = 400;
  }
}

function onScroll(e) {
  console.log(e);
  if (e.type === 'DOMMouseScroll') {
    currentSpeed += (e.detail * 0.5);
  } else {
    currentSpeed += (e.deltaY * 0.01);
  }
}
let mouseDown = false;
let prevMouse = null;
function onMouseMove(e) {
  e.preventDefault();
  let y = e.clientY;
  if (e.touches) {
    y = e.touches[0].clientY;
  }
  if (mouseDown) {
    if (prevMouse === null ){
      prevMouse = y;
      return;
    }
    currentSpeed += (y - prevMouse) * 0.03;
    prevMouse = y;
  }
  return false;
}
function onMouseDown(e) {
  e.preventDefault();
  mouseDown = true;
  return false;
}
function onMouseUp(e) {
  e.preventDefault();
  mouseDown = false;
  prevMouse = null;
  return false;
}

window.addEventListener('resize', onResize);
window.addEventListener('mousewheel', onScroll, false);
window.addEventListener('DOMMouseScroll', onScroll, false);
renderer.domElement.addEventListener('mousemove', onMouseMove, false);
renderer.domElement.addEventListener('touchmove', onMouseMove, false);
renderer.domElement.addEventListener('mousedown', onMouseDown, false);
renderer.domElement.addEventListener('touchstart', onMouseDown, false);
renderer.domElement.addEventListener('mouseup', onMouseUp, false);
renderer.domElement.addEventListener('touchend', onMouseUp, false);
document.addEventListener('mouseleave', onMouseUp);
requestAnimationFrame(render);
