
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import * as THREE from '../three';
import {TweenLite, Elastic, TweenMax} from 'gsap';

/*
 * Noel Delgado - @pixelia_me
 * Inspiration: https://dingundding.tumblr.com/post/99836716906
 */

if (!THREE.Detector.webgl) THREE.Detector.addGetWebGLMessage();

const debug = false;
let _width = window.innerWidth;
let  _height = window.innerHeight;
const PI = Math.PI;

const CUBE_SIZE = 100; /* width, height */
const GRID = 6; /* cols, rows */
const TOTAL_CUBES = (GRID * GRID);
const WALL_SIZE = (GRID * CUBE_SIZE);
const HALF_WALL_SIZE = (WALL_SIZE / 2);
const MAIN_COLOR = 0xFFFFFF;
const SECONDARY_COLOR = 0x222222;
const cubes: THREE.Mesh[] = [];

const renderer = new THREE.WebGLRenderer({ antialias: false });
const camera = new THREE.PerspectiveCamera(45, (_width / _height), 0.1, 10000);
const scene = new THREE.Scene();
const group = new THREE.Object3D();

new THREE.OrbitControls(camera);

const Utils = {
    randomInRange: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

/* -- -- */
setupCamera(800, -800, 800);
setupBox(group);
setupFloor(group);
setupCubes(group);
setupLights(group);
// group.position.y = 50
// group.rotation.set(-60 * (PI / 180), 0, -45 * (PI / 180))
const axes = new THREE.AxisHelper(100);
scene.add(axes);
scene.add(group);
setupRenderer(document.body);

/* -- -- */
// if (debug) render();
TweenLite.ticker.addEventListener('tick', render);
window.addEventListener('resize', resizeHandler, false);

/* -- -- */
function resizeHandler() {
    _width = window.innerWidth;
    _height = window.innerHeight;
    renderer.setSize(_width, _height);
    camera.aspect = _width / _height;
    camera.updateProjectionMatrix();
}

/* -- CAMERA -- */
function setupCamera(x, y, z) {
    camera.up.set(0, 0, 1);
    camera.position.set(x, y, z);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);
}

/* -- BOX -- */
function setupBox(parent) {
    let i, boxesArray, geometry, material;

    boxesArray = [];
    geometry = new THREE.BoxGeometry(WALL_SIZE, WALL_SIZE, 0.05);
    geometry.faces[8].color.setHex(SECONDARY_COLOR);
    geometry.faces[9].color.setHex(SECONDARY_COLOR);
    geometry.colorsNeedUpdate = true;
    material = new THREE.MeshBasicMaterial({
        // color: MAIN_COLOR,
        color: '#ff0000',
        vertexColors: THREE.FaceColors
    });

    for (i = 0; i < 5; i++) {
        boxesArray.push(new THREE.Mesh(geometry, material));
    }

    // back
    boxesArray[0].position.set(0, HALF_WALL_SIZE, -HALF_WALL_SIZE);
    boxesArray[0].rotation.x = 90 * (PI / 180);

    // right
    boxesArray[1].position.set(HALF_WALL_SIZE, 0, -HALF_WALL_SIZE);
    boxesArray[1].rotation.y = -90 * (PI / 180);

    // front
    boxesArray[2].position.set(0, -HALF_WALL_SIZE, -HALF_WALL_SIZE);
    boxesArray[2].rotation.x = -90 * (PI / 180);

    // left
    boxesArray[3].position.set(-HALF_WALL_SIZE, 0, -HALF_WALL_SIZE);
    boxesArray[3].rotation.y = 90 * (PI / 180);

    // bottom
    boxesArray[4].position.set(0, 0, -WALL_SIZE);

    boxesArray.forEach(function (box) {
        parent.add(box);
    });
}

/* -- FLOOR -- */
function setupFloor(parent) {
    let i, tilesArray, geometry;

    tilesArray = [];
    geometry = new THREE.PlaneBufferGeometry(WALL_SIZE, WALL_SIZE);

    for (i = 0; i < 8; i++) {
        const base = Math.ceil(0xf * i / 8).toString(16);
        const color = `0x${[base, base, base, base, base, base, base, base].join('')}`;
        tilesArray.push(new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
            // color: MAIN_COLOR,
            color: parseInt(color, 16),
        })));
    }

    tilesArray[0].position.set(-WALL_SIZE, WALL_SIZE, 0);
    tilesArray[1].position.set(0, WALL_SIZE, 0);
    tilesArray[2].position.set(WALL_SIZE, WALL_SIZE, 0);
    tilesArray[3].position.set(-WALL_SIZE, 0, 0);
    tilesArray[4].position.set(WALL_SIZE, 0, 0);
    tilesArray[5].position.set(-WALL_SIZE, -WALL_SIZE, 0);
    tilesArray[6].position.set(0, -WALL_SIZE, 0);
    tilesArray[7].position.set(WALL_SIZE, -WALL_SIZE, 0);

    tilesArray.forEach(function (tile) {
        tile.receiveShadow = true;
        parent.add(tile);
    });
}

/* -- CUBES --*/
function setupCubes(parent) {
    let i, x, y, row, col, minDuration, maxDuration, minDelay, maxDelay, attrOptions, attr, direction, config;

    const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, 0.05);
    const material = new THREE.MeshLambertMaterial({ color: MAIN_COLOR });
    x = 0;
    y = 0;
    row = 0;
    col = 0;
    minDuration = 3;
    maxDuration = 6;
    minDelay = 0.5;
    maxDelay = 6;
    attrOptions = ['x', 'y'];

    for (i = 0; i < TOTAL_CUBES; i++) {
        cubes.push(new THREE.Mesh(geometry, material));

        if ((i % GRID) === 0) {
            col = 1;
            row++;
        } else col++;

        x = -(((GRID * CUBE_SIZE) / 2) - ((CUBE_SIZE) * col) + (CUBE_SIZE / 2));
        y = -(((GRID * CUBE_SIZE) / 2) - ((CUBE_SIZE) * row) + (CUBE_SIZE / 2));

        cubes[i].position.set(x, y, 0);
    }

    cubes.forEach(function (cube) {
        cube.castShadow = true;
        cube.receiveShadow = true;

        if (debug) {
            cube.rotation.x = (Math.random() * 10);
        } else {
            config = {
                ease: Elastic.easeOut,
                delay: Utils.randomInRange(minDelay, maxDelay),
                repeat: -1
            };
            attr = attrOptions[~~(Math.random() * attrOptions.length)];
            direction = (Math.random() < 0.5 ? -PI : PI);
            config[attr] = direction;

            TweenMax.to(
                cube.rotation,
                Utils.randomInRange(minDuration, maxDuration),
                config
            );
        }

        parent.add(cube);
    });
}

/* -- LIGHTS -- */
function setupLights(parent: THREE.Object3D) {
    const light = new THREE.DirectionalLight(MAIN_COLOR, 1);

    light.position.set(-WALL_SIZE, -WALL_SIZE, CUBE_SIZE * GRID);
    // light.target.position.set(0, 0, 0);
    // light.position.set(0, 0, CUBE_SIZE * GRID);
    // light.lookAt(new THREE.Vector3(0, 0, 0));
    light.castShadow = true;
    // light.shadowDarkness = 0.5;
    // light.shadow.mapSize.width = 512;  // default
    // light.shadow.mapSize.height = 512; // default
    // light.shadow.camera['near'] = 100;    // default
    light.shadow.camera['far'] = 2000;     // default
    // light.shadow.camera['top'] = WALL_SIZE;     // default
    // light.shadow.camera['bottom'] = WALL_SIZE;     // default
    // light.shadow.camera['left'] = WALL_SIZE;     // default
    // light.shadow.camera['right'] = WALL_SIZE;     // default
    light.shadow.camera['zoom'] = 0.01;

    parent.add(light);
    parent.add(new THREE.CameraHelper(light.shadow.camera));

    const soft_light = new THREE.DirectionalLight(MAIN_COLOR);
    soft_light.position.set(WALL_SIZE, WALL_SIZE, CUBE_SIZE * GRID);
    parent.add(soft_light);

    // shadowMapViewer = new THREE.ShadowMapViewer(light);
    // shadowMapViewer.position.x = 10;
    // shadowMapViewer.position.y = 10;
    // shadowMapViewer.size.width = 2048 / 4;
    // shadowMapViewer.size.height = 1024 / 4;
    // shadowMapViewer.update();
    // scene.add(light);
    // scene.add(soft_light);
}

/* -- RENDERER -- */
function setupRenderer(parent) {
    renderer.setSize(_width, _height);
    renderer.setClearColor(MAIN_COLOR, 1.0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    // renderer.shadowMap.type = THREE.PCFShadowMap; // default THREE.PCFShadowMap

    parent.appendChild(renderer.domElement);
}

function render() {
    renderer.render(scene, camera);
}
