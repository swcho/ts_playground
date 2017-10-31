
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

// https://codepen.io/gbnikolov/pen/bRypZa

import * as THREE from '../three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const control = new THREE.OrbitControls(camera);
const clock = new THREE.Clock();

const perlinNoiseShaderFrag = require('./noise.frag');

const uniforms = {
    uTime: { value: 0.0 }
};

const vertexShader = `
  uniform float vOffset;
  uniform float uTime;

  varying vec4 vNewPosition;
  varying vec3 vNormal;

  ${perlinNoiseShaderFrag}

  void main () {
    vec4 newPosition = vec4(position, 1.0);

    vec4 displacement = vec4(0.0);
    displacement.x = snoise(vec2(normal.x * 0.15, uTime)) * 10.0;
    displacement.y = snoise(vec2(normal.x * 0.2,  2.5 + uTime)) * 20.0;
    displacement.z = snoise(vec2(normal.x * 0.25, 5.0 + uTime)) * 30.0;

    newPosition += displacement;
    vec4 mvPosition = modelViewMatrix * newPosition;
    gl_Position = projectionMatrix * mvPosition;

    vNewPosition = newPosition;
    vNormal = normal;
  }
`;
const fragmentShader = `
  varying vec4 vNewPosition;
  varying vec3 vNormal;

  void main () {
    vec4 center = vec4(0.5);
    float dist = distance(vNewPosition, center);
    // gl_FragColor = vec4(vNormal.x * 2.0 + sin(dist * 0.2) * 0.4, vNormal.y * 0.8 + cos(dist * 0.45) * 0.5, vNormal.z * 0.8, 1.0);
    gl_FragColor = vec4(vNormal.x, vNormal.y, vNormal.z, 1.0);
  }
`;

let sphereMesh;

function init() {
    setScene();
    renderFrame();
}

function setScene() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    document.body.appendChild(renderer.domElement);

    camera.position.set(0, 50, 100);
    camera.lookAt(new THREE.Vector3());

    // let geo = new THREE.SphereBufferGeometry(20, 20, 50);
    let geo = new THREE.SphereBufferGeometry(20, 50, 50);
    let mat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        wireframe: true,
    });
    sphereMesh = new THREE.Mesh(geo, mat);
    scene.add(sphereMesh);
}

let time = 0;
function renderFrame() {
    window.requestAnimationFrame(renderFrame);

    time += clock.getDelta();
    uniforms.uTime.value = time;
    renderer.render(scene, camera);
}

init();
