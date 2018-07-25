
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

require('./style.scss');

import * as THREE from '../three';
import Stats = require('stats.js');
import dat = require('dat-gui');
import { TimelineMax, Power0 } from 'gsap';

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

const global: {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.Renderer;
    world: any;
    loadManager: THREE.LoadingManager;
    jsonLoader: THREE.JSONLoader;
    texLoader: THREE.TextureLoader;
    texture?: THREE.Texture;
    orbits: THREE.Object3D;
    container: any;
    jsonData: string;
    texSrc: string;
    geometry: any;
} = {
    scene: null,
    camera: null,
    renderer: null,
    world: null,
    loadManager: null,
    jsonLoader: null,
    texLoader: null,
    orbits: null,
    container: null,
    jsonData: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/304639/plus-skin.json',
    texSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/304639/birch.jpg',
    geometry: null,
};

const init = () => {
    initScene();
    initOrbits();
    initLoader();
    loadModel();
    loadTexture();
};

const initScene = () => {
    global.scene = new THREE.Scene();

    global.camera = new THREE.PerspectiveCamera(
        10,
        window.innerWidth / window.innerHeight,
        0.0001,
        10000
    );
    // global.camera.position.set(-7, -3, 20);
    global.camera.position.set(0, 0, 70);
    global.camera.lookAt(global.scene.position);
    global.scene.add(global.camera);

    global.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        logarithmicDepthBuffer: true
    });
    global.renderer.setSize(window.innerWidth, window.innerHeight);

    document.querySelector('[data-stage]').appendChild(global.renderer.domElement);
};

const initOrbits = () => {

    const geometry = new THREE.IcosahedronGeometry(0.35, 1);
    const colors = [ 0xfff95d, 0x7821ec, 0x47debd ];
    // global.orbits = new THREE.Object3D( 0, 0, 0 );
    global.orbits = new THREE.Object3D();

    const radius = 4;
    const theta = ((Math.PI * 2) / colors.length);

    for ( let i = 0; i < colors.length; i++ ) {
        const color = colors[i];

        // const orbiter = new THREE.Object3D( 3, 0, 0 );
        const orbiter = new THREE.Object3D();
        orbiter.rotation.set( 0, 0, 0 );
        global.scene.add( orbiter );

        let angle = (theta * i);
        let y = (radius * Math.cos(angle));
        let z = (radius * Math.sin(angle));
        const light = new THREE.PointLight( color, 1, 6 );
        light.position.set(0, y, z);

        // for debugging
        let geometry = new THREE.SphereGeometry(0.1, 0.1, 0.1);
        let material = new THREE.MeshBasicMaterial({ color: color });
        let sphere = new THREE.Mesh(geometry, material);
        light.add(sphere);
        // for debugging

        orbiter.add( light );

        global.orbits.add(orbiter);
    }
    global.scene.add(global.orbits);


    // for debug
    const light = new THREE.PointLight( 0xd5d5d5, 0.6, 30);
    light.position.set(-10, 10, 10);
    global.scene.add(light);

    const hemi = new THREE.HemisphereLight( 0xffffff, 0xd5d5d5, 0.1 );
    global.scene.add( hemi );
    // for debug
};

const initLoader = () => {
    global.loadManager = new THREE.LoadingManager();
    global.jsonLoader = new THREE.JSONLoader( global.loadManager );
    global.texLoader = new THREE.TextureLoader( global.loadManager );
    global.texLoader.setCrossOrigin('anonymous');
    global.loadManager.onLoad = function() {
        createPlus(animate);
    };

};

const loadModel = () => {
    global.jsonLoader.load( global.jsonData, function (geometry) {
        global.geometry = geometry;
    });
};

const loadTexture = () => {
  global.texLoader.load( global.texSrc, function (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    global.texture = texture;
  });
};

const createPlus = (callback) => {
    global.container = new THREE.Group();
    global.scene.add(global.container);

    for (let i = 0; i < 2; i++) {
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            // color: 0x000000,
            bumpMap: global.texture,
            roughnessMap: global.texture,
            bumpScale: 1.9,
            roughness: 0.2,
            metalness: 1.0,
            // metalnessMap: global.texture,
        });
        const plus = new THREE.Mesh<THREE.MeshStandardMaterial>(
            global.geometry, material);
        if (i === 1) {
            plus.material.wireframe = true;
            plus.position.set(0, 0, 0);
        }
        global.container.add(plus);
    }

    callback();
};

const animate = () => {
    const time = 10.8;

    const tl = new TimelineMax({
        repeat: -1,
        onUpdate: () => {
            render();
        }
    });

    tl.to(global.container.rotation, time, {
            x: Math.PI * 2,
            y: Math.PI * 2,
            ease: Power0.easeNone,
        }, 0)
    .to(global.orbits.rotation, time, {
            x: Math.PI * 8,
            ease: Power0.easeNone,
        }, 0);
};

window.addEventListener('resize', resizeHandler);

const render = () => {
    global.renderer.render(global.scene, global.camera);
};

function resizeHandler() {
    global.renderer.setSize(window.innerWidth, window.innerHeight);
    global.camera.aspect = window.innerWidth / window.innerHeight;
    global.camera.updateProjectionMatrix();
}

init();
