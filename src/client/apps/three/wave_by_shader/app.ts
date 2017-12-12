
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import * as THREE from '../three';


function onResize() {
    let w = window.innerWidth;
    let h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}

// var scene, camera, material, renderer, controls, startTime;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(new THREE.Color(0x101010));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

const startTime = Date.now();
window.addEventListener('resize', onResize);
onResize();

let material: THREE.ShaderMaterial;
window.onload = function () {

    camera.position.x = 200;
    camera.position.y = 150;
    camera.position.z = -200;
    camera.lookAt(new THREE.Vector3());

    // create a custome material
    material = new THREE.ShaderMaterial({
        uniforms: {
            amplitude: { type: 'f', value: 10 },
            frequency: { type: 'f', value: 10 },
            time: { type: 'f', value: 0 }
        },
        vertexShader: document.getElementById('vs').innerText,
        fragmentShader: document.getElementById('fs').innerText,
        transparent: true,
        wireframe: true
    });

    // initializes a mesh with a bi-unit plane (-1/1) geometry & assign the material
    const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2, 100, 100), material);
    mesh.scale.multiplyScalar(100);
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
    update();

};

function update() {
    requestAnimationFrame(update);

    material.uniforms.amplitude.value = 0.05;
    material.uniforms.frequency.value = 30;
    material.uniforms.time.value = (Date.now() - startTime) * 0.001;

    renderer.render(scene, camera);
}
