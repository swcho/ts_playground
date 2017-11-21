
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import * as THREE from '../three';

// setup three.js

var renderer = new THREE.WebGLRenderer({
    antialias: true
});
var camera = new THREE.PerspectiveCamera(80);
var scene = new THREE.Scene();

document.querySelector('#three').appendChild(renderer.domElement);

// camera config

var controls = new THREE.OrbitControls(camera, renderer.domElement);

camera.position.z = 200;

// lights

var light;

light = new THREE.DirectionalLight(0xff0000, 1);
light.position.set(-1, 1, 1);
scene.add(light);

light = new THREE.DirectionalLight(0x0000ff, 1);
light.position.set(1, 1, 1);
scene.add(light);

light = new THREE.PointLight(0x00ff00, 1, 200);
scene.add(light);

// create meshes

var cubes;
var geometry;
var material;

var config = {
    // size of the grid in world units
    gridSize: 100,
    // length of each axis
    gridLength: 12,
    // translation delta on the x axis
    deltaX: 300,
    // animation duration for each mesh
    duration: 2.0,
    // startTime for each mesh will be based on the total delay
    totalDelay: 1.0
}

function createCubes() {
    // dispose previous cubes
    dispose();

    // determine size of each cube based size and length
    var cubeSize = config.gridSize / (config.gridLength * 1.125);
    var gridHalfSize = config.gridSize * 0.5;

    // total cubes based on grid length on each axis
    var cubeCount = config.gridLength * config.gridLength * config.gridLength;

    console.log('CREATING ' + cubeCount + ' CUBES');

    // create the geometry that will be repeated in the buffer geometry
    // I refer to this 'base' geometry as a prefab
    var prefab = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    // create the buffer geometry where a set number of prefabs are repeated
    // PrefabBufferGeometry offers some utility methods for working with such geometries
    geometry = new THREE.BAS.PrefabBufferGeometry(prefab, cubeCount);

    // create a buffer for start positions per prefab, with an item size of 3 (x, y, z)
    var startPositionBuffer = geometry.createAttribute('startPosition', 3);
    // create a buffer for end positions per prefab, with an item size of 3 (x, y, z)
    var endPositionBuffer = geometry.createAttribute('endPosition', 3);
    // create a buffer for duration per prefab, with the item size of 1
    var durationBuffer = geometry.createAttribute('duration', 1);
    // create a buffer for start time per prefab, with the item size of 1
    var startTimeBuffer = geometry.createAttribute('startTime', 1);

    // create a buffer for rotation with 4 components per vertex
    // we use x, y and z to store an axis
    // and w to store the rotation around that axis
    var rotationBuffer = geometry.createAttribute('rotation', 4);

    // populate the buffers

    var cubeIndex = 0;
    // reuse the same array and vector each loop iteration
    var tmpa = [];
    var tmpv = new THREE.Vector3();

    for (var x = 0; x < config.gridLength; x++) {
        for (var y = 0; y < config.gridLength; y++) {
            for (var z = 0; z < config.gridLength; z++) {

                // calculate start position spread around the x, y, and z axes, offset by half delta on the x axis
                // the x, y and z values are stored in the temporary array
                tmpa[0] = THREE.Math.mapLinear(x, 0, config.gridLength - 1, gridHalfSize, -gridHalfSize) - config.deltaX * 0.5;
                tmpa[1] = THREE.Math.mapLinear(y, 0, config.gridLength - 1, gridHalfSize, -gridHalfSize);
                tmpa[2] = THREE.Math.mapLinear(z, 0, config.gridLength - 1, gridHalfSize, -gridHalfSize);
                // geometry.setPrefabData will use the array to set the same values for each vertex in a prefab based on an index
                geometry.setPrefabData(startPositionBuffer, cubeIndex, tmpa);

                // repeat the same steps for the end position
                tmpa[0] = THREE.Math.mapLinear(x, 0, config.gridLength - 1, gridHalfSize, -gridHalfSize) + config.deltaX * 0.5;
                tmpa[1] = THREE.Math.mapLinear(y, 0, config.gridLength - 1, gridHalfSize, -gridHalfSize);
                tmpa[2] = THREE.Math.mapLinear(z, 0, config.gridLength - 1, gridHalfSize, -gridHalfSize);

                geometry.setPrefabData(endPositionBuffer, cubeIndex, tmpa);

                // repeat the same steps for duration
                // in this example, the duration is the same for each prefab, so it could be set as a uniform
                tmpa[0] = config.duration;

                geometry.setPrefabData(durationBuffer, cubeIndex, tmpa);

                // repeat the sa5me steps for start time
                tmpa[0] = (config.totalDelay / cubeCount) * cubeIndex;

                geometry.setPrefabData(startTimeBuffer, cubeIndex, tmpa);

                // calculate rotation using a random axis and a rotation of 360 degrees around that axis

                // get a random axis
                THREE.BAS.Utils.randomAxis(tmpv);
                // store the x, y and z values in the array
                tmpv.toArray(tmpa);
                // set the rotation to 2 PI (can be anything)
                tmpa[3] = Math.PI * 4;

                geometry.setPrefabData(rotationBuffer, cubeIndex, tmpa);

                // increment the cubeIndex for the next iteration
                cubeIndex++;
            }
        }
    }

    // create the animation material
    // it 'extends' THREE.MeshPhongMaterial by injecting arbitrary GLSL code at key places in the shader code
    material = new THREE.BAS.PhongAnimationMaterial({
        shading: THREE.FlatShading,
        // define a time uniform that will control the state of the animation
        // the uniform will be the same for each vertex
        uniforms: {
            time: { value: 0 }
        },
        // add GLSL definitions for the uniform and the 4 attributes we defined on the geometry
        // the names and types must be the same as defined above
        // we use vec3 for attributes with an item size of 3
        // we use float for attributes with an item size of 1
        vertexParameters: [
            'uniform float time;',

            'attribute vec3 startPosition;',
            'attribute vec3 endPosition;',
            'attribute float startTime;',
            'attribute float duration;',
            // don't forget to add the new rotation attribute here!
            // also note the type vec4
            'attribute vec4 rotation;',
        ],
        // add definitions for functions to be used in the vertex shader
        vertexFunctions: [
            // the ease functions follow an underscore deliminated naming convention.
            THREE.BAS.ShaderChunk['ease_cubic_in_out'],
            // quatFromAxisAngle and rotateVector functions
            THREE.BAS.ShaderChunk['quaternion_rotation']
        ],
        // add the GLSL animation update logic
        vertexPosition: [
            // progress is calculated based on the time uniform, and the duration and startTime attributes
            'float progress = clamp(time - startTime, 0.0, duration) / duration;',

            // use the single argument variant of the easing function to ease the progress
            // the function names are camel cased by convention
            'progress = easeCubicInOut(progress);',

            // calculate the quaternion representing the desired rotation
            // we use the axis stored in the attribute and calculate rotation based on progress
            'vec4 quat = quatFromAxisAngle(rotation.xyz, rotation.w * progress);',

            // 'transformed' is a variable defined by THREE.js.
            // it is used throughout the vertex shader to transform the vertex position

            // rotate the vertex by applying the quaternion
            'transformed = rotateVector(quat, transformed);',

            // scale based on progress
            // progress 0.0 = scale 0.0
            // progress 0.5 = scale 1.0
            // progress 1.0 = scale 0.0
            'float scl = progress * 2.0 - 1.0;',
            'scl = 1.0 - scl * scl;',
            'transformed *= scl;',

            // 'mix' is a built-in GLSL method that performs linear interpolation
            'transformed += mix(startPosition, endPosition, progress);'
        ]
    });

    // once the geometry and metrials are defined we can use them to create one single mesh, and add it to the scene
    cubes = new THREE.Mesh(geometry, material);
    scene.add(cubes);
}

function dispose() {
    cubes && scene.remove(cubes);
    geometry && geometry.dispose();
    material && material.dispose();
}

createCubes();

// loop

// var stats = new Stats();
// document.body.appendChild(stats.dom);

function tick() {
    // stats.begin();
    update();
    render();
    // stats.end();

    requestAnimationFrame(tick);
}

function update() {
    // instead of updating a global time variable, we update the time uniform defined on the material

    // increment global time
    cubes.material.uniforms.time.value += 1 / 60;
    // reset time when it exceeds the total duration
    cubes.material.uniforms.time.value %= (config.duration + config.totalDelay);
}

function render() {
    renderer.render(scene, camera);
}

requestAnimationFrame(tick);

// resize

function resize() {
    var w = window.innerWidth;
    var h = window.innerHeight;

    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);
resize();

// html controls

var btnIncr = document.querySelector('.btn.incr');
var btnDecr = document.querySelector('.btn.decr');
var counter = document.querySelector('.count');

btnIncr.addEventListener('click', function () {
    config.gridLength++;

    updateCount();
    createCubes();
});

btnDecr.addEventListener('click', function () {
    if (config.gridLength === 4) return;

    config.gridLength = Math.min(4, config.gridLength - 1);

    updateCount();
    createCubes();
});

function updateCount() {
    counter.innerHTML = 'grid: ' + config.gridLength + ', total: ' + (config.gridLength * config.gridLength * config.gridLength);
}

updateCount();
