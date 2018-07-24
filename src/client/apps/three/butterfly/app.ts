import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//
require('./style.scss');

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

//////////
// CODE //
//////////

const debounce = (callback, duration?) => {
    let timer;
    return function (event) {
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback(event);
        }, duration);
    };
};

class ConsoleSignature {
    private message: string;
    private url: string;
    constructor() {
        this.message = `created by yoichi kobayashi`;
        this.url = `http://www.tplh.net`;
        this.show();
    }
    show() {
        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
            const args = [
                `\n%c ${this.message} %c%c ${this.url} \n\n`,
                'color: #fff; background: #222; padding:3px 0;',
                'padding:3px 1px;',
                'color: #fff; background: #47c; padding:3px 0;',
            ];
            console.log.apply(console, args);
        } else if (window.console) {
            console.log(`${this.message} ${this.url}`);
        }
    }
}

const SIZE = 280;
// const SIZE = 100;

type Uniforms = {
    [name: string]: {
        type: 'f' | 't';
        value: number | any;
    }
};

class Butterfly {
    private uniforms: Uniforms;
    private physicsRenderer;
    obj: THREE.Mesh;
    constructor(index: number, texture: THREE.Texture) {
        this.uniforms = {
            index: {
                type: 'f',
                value: index
            },
            time: {
                type: 'f',
                value: 0
            },
            size: {
                type: 'f',
                value: SIZE
            },
            texture: {
                type: 't',
                value: texture
            },
        };
        this.physicsRenderer = null;
        this.obj = this.createObj();
    }
    createObj() {
        const geometry = new THREE.PlaneBufferGeometry(SIZE, SIZE / 2, 24, 12);
        const mesh = new THREE.Mesh(
            geometry,
            // new THREE.MeshBasicMaterial({
            //     wireframe: true,
            // }),
            new THREE.RawShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: require('./vert.glsl'),
                fragmentShader: require('./frag.glsl'),
                depthWrite: false,
                side: THREE.DoubleSide,
                transparent: true
            }),
        );
        mesh.rotation.set(-45 * Math.PI / 180, 0, 0);
        return mesh;
    }
    render(renderer, time) {
        this.uniforms.time.value += time;
        this.obj.position.z = (this.obj.position.z > -900) ? this.obj.position.z - 4 : 900;
    }
}

const resolution = {
    x: 0,
    y: 0
};
const canvas = document.getElementById('canvas-webgl') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({
    antialias: false,
    canvas: canvas,
});
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 10000);
const clock = new THREE.Clock();
const loader = new THREE.TextureLoader();

const vectorTouchStart = new THREE.Vector2();
const vectorTouchMove = new THREE.Vector2();
const vectorTouchEnd = new THREE.Vector2();

const CAMERA_SIZE_X = 640;
const CAMERA_SIZE_Y = 480;

const BUTTERFLY_NUM = 7;
const butterflies: Butterfly[] = [];

const resizeCamera = () => {
    const x = Math.min((resolution.x / resolution.y) / (CAMERA_SIZE_X / CAMERA_SIZE_Y), 1.0) * CAMERA_SIZE_X;
    const y = Math.min((resolution.y / resolution.x) / (CAMERA_SIZE_Y / CAMERA_SIZE_X), 1.0) * CAMERA_SIZE_Y;
    camera.left = x * -0.5;
    camera.right = x * 0.5;
    camera.top = y * 0.5;
    camera.bottom = y * -0.5;
    camera.updateProjectionMatrix();
};
const resizeWindow = () => {
    resolution.x = window.innerWidth;
    resolution.y = window.innerHeight;
    canvas.width = resolution.x;
    canvas.height = resolution.y;
    resizeCamera();
    renderer.setSize(resolution.x, resolution.y);
};
const render = () => {
    const time = clock.getDelta();
    for (let i = 0; i < butterflies.length; i++) {
        butterflies[i].render(renderer, time);
    }
    renderer.render(scene, camera);
};
const renderLoop = () => {
    render();
    requestAnimationFrame(renderLoop);
};
const on = () => {
    window.addEventListener('resize', debounce(resizeWindow));
};

const init = () => {
    resizeWindow();
    on();

    renderer.setClearColor(0xeeeeee, 1.0);
    camera.position.set(250, 500, 1000);
    camera.lookAt(new THREE.Vector3());

    loader.crossOrigin = 'anonymous';
    loader.load('http://ykob.github.io/sketch-threejs/img/sketch/butterfly/tex.png', (texture) => {
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        for (let i = 0; i < BUTTERFLY_NUM; i++) {
            butterflies[i] = new Butterfly(i, texture);
            butterflies[i].obj.position.set(((i + 1) % 3 - 1) * i * 50, 0, 1800 / BUTTERFLY_NUM * i);
            scene.add(butterflies[i].obj);
        }
        renderLoop();
    });
};
init();

new ConsoleSignature();
