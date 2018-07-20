
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//
require('./style.scss');

import * as THREE from '../three';
import { TimelineMax, Power0 } from 'gsap';
import { CannonDebugRenderer } from './CannonDebugRenderer';
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
};

let gui = new dat.GUI();
gui.add(CONFIG, 'wireframe');

//////////
// CODE //
//////////

const global = {
    scene: null,
    camera: null,
    renderer: null,
    world: null,
    loadManager: null,
    jsonLoader: null,
    light: null,
    debugger: null,
    debug: false,
    count: 0,
    max: 0,
};

type ObjPair = [CANNON.Body, THREE.Mesh] | [THREE.Mesh, CANNON.Body];

const physix: {
    body: CANNON.Body;
    updates: ObjPair[];
} = {
    body: null,
    updates: []
};

const mesh: {
    container: THREE.Group;
    jsonData: string;
    geometry: THREE.Geometry;
    plus: THREE.Mesh;
} = {
    container: null,
    jsonData: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/304639/plus-skin.json',
    geometry: null,
    plus: null,
};

const init = () => {
    initScene();
    initLight();
    initWorld();
    clonePlus();
    initLoader();
    loadModel();
};

const initScene = () => {
    global.scene = new THREE.Scene();

    global.camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      1,
      800
    );
    global.camera.position.set(-7, -3, 20);
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

const initLight = () => {
    global.light = new THREE.PointLight( 0xd5d5d5, 0.6, 30);
    global.light.position.set(-10, 10, 10);
    global.scene.add(global.light);

    const hemi = new THREE.HemisphereLight( 0xffffff, 0xd5d5d5, 0.1 );
    global.scene.add( hemi );
};

const initLoader = () => {
    global.loadManager = new THREE.LoadingManager();
    global.jsonLoader = new THREE.JSONLoader( global.loadManager );
    global.loadManager.onLoad = function() {
        createPlus(animate);
    };
};

const loadModel = () => {
    global.jsonLoader.load( mesh.jsonData, function (geometry) {
        mesh.geometry = geometry;
    });
};

const initWorld = () => {
    global.world = new CANNON.World();
    global.world.broadphase = new CANNON.NaiveBroadphase();
    global.world.gravity.set( -8, 0, 0);
    global.world.solver.iterations = 10;

    global.debugger = new CannonDebugRenderer( global.scene, global.world );
};

const getRandomArbitrary = (min, max) => {
    return Math.random() * (max - min) + min;
};

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const createBall = () => {
    let mass = 0.8;
    let radius = 0.3;
    let lat = Math.tan( global.camera.fov * 1 / 360 * 2 * Math.PI ) * global.camera.position.z;
    let x = lat * global.camera.aspect;
    let y = Math.random() * 0.001;
    let z = Math.random() * 0.001;

    let shape = new CANNON.Sphere(radius * 1.1);
    let body = new CANNON.Body({mass: mass, shape: shape});
    body.position.set(x, y, z);
    global.world.add(body);

    const colors = [0x47debd, 0x2e044e, 0x7821ec, 0xfff95d];
    const color = colors[getRandomInt(0, 3)];

    let material = new THREE.MeshLambertMaterial({
        emissive: color,
        emissiveIntensity: 0.8,
        color: 0x7821ec
    });

    let ball = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 16, 16),
        material
    );
    ball.position.set(x, y, z);
    global.scene.add(ball);

    physix.updates.push([body, ball]);
};

const updatePhysix = () => {
    for (let i = 0; i < physix.updates.length; i++) {
        const [source, target] = physix.updates[i] as any;
        target.position.copy( source.position );
        target.quaternion.copy ( source.quaternion );
    }
};

const clonePlus = () => {
    const offset = 3;
    const radius = 1;

    physix.body = new CANNON.Body({ mass: 0 });
    let sphere = new CANNON.Sphere(radius);

    const pos = [
        [-offset, 0, 0],
        [offset, 0, 0],
        [0, -offset, 0],
        [0, offset, 0],
        [0, 0, -offset],
        [0, 0, offset]
    ];

    for (let i = 0; i < pos.length; i++) {
        physix.body.addShape(sphere, new CANNON.Vec3(
            pos[i][0], pos[i][1], pos[i][2]
        ));
    }

    const rot = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];

    for (let i = 0; i < rot.length; i++) {
        let cylinder = new CANNON.Cylinder(radius, radius, radius * 6, 16);
        let q = new CANNON.Quaternion();
        q.setFromAxisAngle(
            new CANNON.Vec3(rot[i][0], rot[i][1], rot[i][2]),
            Math.PI * 0.5
        );
        cylinder.transformAllPoints(new CANNON.Vec3(), q);
        physix.body.addShape(cylinder);
    }

    physix.body.position.set(0, 0, 0);
    global.world.add( physix.body );
};

const createPlus = (callback) => {
    mesh.container = new THREE.Group();
    global.scene.add(mesh.container);

    const material = new THREE.MeshPhongMaterial({
        emissive: 0xc0c0c0,
        emissiveIntensity: 0.8,
        specular: 0xfefefe,
        shininess: 0,
        color: 0xebebeb
    });

    mesh.plus = new THREE.Mesh(mesh.geometry, material);
    mesh.container.add(mesh.plus);

    physix.updates.push([mesh.plus, physix.body]);

    callback();
};

const animate = () => {
    const time = 4;
    const timeStep = 1.0 / 60.0;

    const tl = new TimelineMax({
        repeat: -1,
        onUpdate: () => {
            global.world.step(timeStep);
            render();
        }
    });

    tl.to(mesh.plus.rotation, time, {
            y: Math.PI * 2,
            x: Math.PI * 2,
            ease: Power0.easeNone
        });

};

window.addEventListener('resize', resizeHandler);
window.addEventListener('mousedown', createBall);

const render = () => {
    updatePhysix();

    global.count ++;
    if (global.count >= 20 && global.max <= 3000) {
        global.max ++;
        global.count = 0;
        createBall();
    }

    if (global.max === 3000) {
        global.max ++;
    }

    if (global.debug) global.debugger.update();

    global.renderer.render(global.scene, global.camera);
};

function resizeHandler() {
    global.renderer.setSize(window.innerWidth, window.innerHeight);
    global.camera.aspect = window.innerWidth / window.innerHeight;
    global.camera.updateProjectionMatrix();
}

init();
