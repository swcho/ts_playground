
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

console.clear();

class HairyBall {
    private size: number;
    private hairCount: number;
    private mesh;
    private hair;
    constructor(size, hairCount) {
        this.size = size;
        this.hairCount = hairCount;

        this.mesh = null;
        this.hair = null;
    }
    init(parentNode) {
        const geometry = new THREE.SphereBufferGeometry(this.size, 20, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0xFFFF00, wireframe: true });
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, this.size, 0));
        const count = geometry.attributes['position'].count;
        console.log(count);

        let hairGeometry = new THREE.InstancedBufferGeometry();
        hairGeometry.maxInstancedCount = count;

        let hairPositions = new Float32Array(count * 3);
        let hairRotations = new Float32Array(count * 3);

        let hairVertices = new Float32Array([
            0.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            20.0, 0.5, 0.0
        ]);

        for (let i = 0; i < count * 3; i += 3) {
            hairPositions[i + 0] = geometry.attributes['position'].array[i + 0];
            hairPositions[i + 1] = geometry.attributes['position'].array[i + 1];
            hairPositions[i + 2] = geometry.attributes['position'].array[i + 2];

            hairRotations[i + 0] = geometry.attributes['normal'].array[i + 0];
            hairRotations[i + 1] = geometry.attributes['normal'].array[i + 1];
            hairRotations[i + 2] = geometry.attributes['normal'].array[i + 2];
        }

        hairGeometry.addAttribute('position', new THREE.BufferAttribute(hairVertices, 3));
        hairGeometry.addAttribute('position_offset', new THREE.InstancedBufferAttribute(hairPositions, 3));
        hairGeometry.addAttribute('rotation', new THREE.InstancedBufferAttribute(hairRotations, 3));

        let hairMaterial = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: `
        attribute vec3 position_offset;
        attribute vec3 rotation;

void main () {
vec3 new_position = position;
new_position += cross( rotation, cross( rotation, position ) + position);
new_position += position_offset;
gl_Position = projectionMatrix * modelViewMatrix * vec4(new_position, 1.0);
}
      `,
            fragmentShader: `
        void main () {
          gl_FragColor = vec4(0.9, 0.9, 0.9, 1.0);
        }
      `
        });

        let hair = new THREE.Line(hairGeometry, hairMaterial);
        parentNode.add(hair);

        this.mesh = new THREE.Mesh(geometry, material);

        // parentNode.add(this.mesh)
        return this;
    }
}

let w = window.innerWidth;
let h = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const controls = new THREE.OrbitControls(camera, renderer.domElement);

camera.position.set(0, 20, 100);
camera.lookAt(new THREE.Vector3());

renderer.setSize(w, h);
renderer.setClearColor(0x111111);
renderer.setPixelRatio(window.devicePixelRatio || 1);
document.body.appendChild(renderer.domElement);

let help = new THREE.GridHelper(200, 5);
scene.add(help);

let ball = new HairyBall(20, 1).init(scene);

renderFrame();
function renderFrame() {
    window.requestAnimationFrame(renderFrame);
    renderer.render(scene, camera);
}
