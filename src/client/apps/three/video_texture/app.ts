
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

class VideoTexture {

    private video: HTMLVideoElement;
    private videoLoaded: boolean;

    canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private width: number;
    private height: number;

    texture: THREE.Texture;

    constructor(width = 256, height = 128) {
        this.video = document.createElement('video');
        this.videoLoaded = false;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.width = this.canvas.width = width;
        this.height = this.canvas.height = height;

        this.canvas.style.transform = 'scale(0.85, 0.85)';
        this.canvas.style.transformOrigin = '0 0 0';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = this.canvas.style.left = '1rem';
        document.body.appendChild(this.canvas);

        this.ctx.fillStyle = '#111';
        this.ctx.textAlign = 'center';
        this.ctx.font = '30px Helvetica';
        this.ctx.fillText('loading video', this.canvas.width / 2, this.canvas.height / 2 + 10);

        this.video.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/144379/ninja.mp4';
        // this.video.src = 'https://www.quirksmode.org/html5/videos/big_buck_bunny.mp4';
        // this.video.src = 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4';
        this.video.onloadedmetadata = e => {
            this.video.play();
            this.video.loop = true;
            this.videoLoaded = true;
            let loadText = document.querySelector('#loading');
            loadText.parentNode.removeChild(loadText);
        };
        this.video.width = this.width;
        this.video.height = this.height;
        this.video.crossOrigin = 'Anonymous';
    }

    updateFrame() {
        if (this.videoLoaded === true) {
            this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
        }
    }
}

let w = window.innerWidth;
let h = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const clock = new THREE.Clock();
const controls = new THREE.OrbitControls(camera, renderer.domElement);

const cameraTexture = new VideoTexture();
cameraTexture.texture = new THREE.Texture(cameraTexture.canvas);

let geometry = new THREE.PlaneBufferGeometry(130, 65, 60, 60);
let material = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 },
        cameraTexture: { value: cameraTexture.texture }
    },
    vertexShader: `
    uniform float time;
    uniform sampler2D cameraTexture;

    // varying vec2 vUv;
    // varying vec3 vPosition;
    varying float maskValue;

    void main () {
      vec3 newPosition = position;
      vec4 sampler = texture2D(cameraTexture, uv);
      float averaged = (sampler.r + sampler.g + sampler.b) / 3.0;
      newPosition.z = ((averaged - 0.5) * 150.0 - newPosition.z) * 0.8;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

      // vUv = uv;
      // vPosition = newPosition;
      maskValue = sampler.g;
    }
  `,
    fragmentShader: `
    uniform float time;
    uniform sampler2D cameraTexture;

    // varying vec2 vUv;
    // varying vec3 vPosition;
    varying float maskValue;

    void main () {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 0.5 - maskValue);
    }
  `,
    transparent: true
});

const plane = new THREE.LineSegments(geometry, material);
// const plane = new THREE.Line(geometry, material);
// const plane = new THREE.Mesh(geometry, material);
// const plane = new THREE.Points(geometry, material);
scene.add(plane);

let elapsedTime = 0;

renderer.setSize(w, h);
renderer.setClearColor(0x111111);
renderer.setPixelRatio(window.devicePixelRatio || 1);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 0, 100);
camera.lookAt(new THREE.Vector3());

// let helper = new THREE.GridHelper(200, 20);

renderFrame();

function renderFrame() {
    window.requestAnimationFrame(renderFrame);
    renderer.render(scene, camera);

    elapsedTime += clock.getDelta();

    cameraTexture.updateFrame();
    plane.material['uniforms'].time.value = elapsedTime;
    cameraTexture.texture.needsUpdate = true;
}
