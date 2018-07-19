
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

///////////
// CODE  //
///////////
declare const chroma;
let cam, scene, root, renderer, controls,
    objects = [], cubeSize = 100, dotSize = 1.5,
    width = window.innerWidth + 1,
    height = window.innerHeight + 1,
    $select = document.querySelector('select'),
    cDark = '#212121', cLight = '#dddddd',
    bg = cDark, colorMode = 'rgb', spaceCube, isDark = true;

document.querySelector('body').classList.add('isDark');

type ModeName = 'hsv' | 'hsi' | 'hsl' | 'rgb' | 'lab' | 'lch' | 'yuv';

type Mode = {
    func: ModeName;
    x: [number, number] | [number, number, number];
    y: [number, number] | [number, number, number];
    z: [number, number] | [number, number, number];
};

const colorModes: { [name in ModeName]: Mode } = {
    hsv: {
        func: 'hsv',
        x: [0, 360],
        y: [1, 1],
        z: [2, 1]
    },
    hsi: {
        func: 'hsi',
        x: [0, 360],
        y: [1, 1],
        z: [2, 1]
    },
    hsl: {
        func: 'hsl',
        x: [0, 360],
        y: [1, 1],
        z: [2, 1]
    },
    rgb: {
        func: 'rgb',
        x: [0, 255],
        y: [1, 255],
        z: [2, 255]
    },
    lab: {
        func: 'lab',
        z: [0, 100],
        y: [1, 127, -128],
        x: [2, 127, -128]
    },
    lch: {
        func: 'lch',
        z: [0, 100],
        y: [1, 140],
        x: [2, 0, 360]
    },
    yuv: {
        func: 'yuv',
        z: [0, 255],
        y: [1, 255],
        x: [2, 255]
    }
};

init();

function onWindowResize() {
    width = window.innerWidth + 1;
    height = window.innerHeight + 1;
    cam.aspect = width / height;
    cam.updateProjectionMatrix();
    renderer.setSize(width, height);
}

let colorList = [];

const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://unpkg.com/color-name-list/dist/colornames.json');
xhr.onload = e => {
    if (xhr.status === 200) {
        colorList = JSON.parse(xhr.responseText);
        addParticles(colorList, colorMode);
    } else {
        console.log(xhr.status);
    }
};
xhr.send();

let part;

function createCanvasMaterial(color, size = 256) {
    let matCanvas = document.createElement('canvas');
    matCanvas.width = matCanvas.height = size;
    let matContext = matCanvas.getContext('2d');
    // create exture object from canvas.
    let texture = new THREE.Texture(matCanvas);
    // Draw a circle
    let center = size / 2;

    matContext.beginPath();
    matContext.arc(center, center, size / 2, 0, 2 * Math.PI, false);
    matContext.closePath();
    matContext.fillStyle = color;
    matContext.fill();
    // need to set needsUpdate
    texture.needsUpdate = true;
    // return a texture made from the canvas
    return texture;
}

function addParticles(colorNames, cMode) {
    // create the particle variables
    const particleCount = colorNames.length,
        particles = new THREE.Geometry(),
        pMaterial = new THREE.PointsMaterial({
            vertexColors: THREE.VertexColors,
            size: dotSize,
            /*
            map: createCanvasMaterial('#fff'),
            //blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: true,
            alphaTest: .5*/
        });


    let colors = []; ;

    const mode = colorModes[cMode];
    colorNames.forEach(col => {
        let colorComp;

        if (mode.func === 'yuv') {
            colorComp = yuv(chroma(col.hex).rgb());
        } else {
            colorComp = chroma(col.hex)[mode.func]();
        }

        const pX = translate(colorComp[mode.x[0]], mode.x[2] || 0, mode.x[1], -cubeSize * .5, cubeSize * .5),
            pZ = translate(colorComp[mode.z[0]], mode.z[2] || 0, mode.z[1], -cubeSize * .5, cubeSize * .5),
            pY = translate(colorComp[mode.y[0]], mode.y[2] || 0, mode.y[1], -cubeSize * .5, cubeSize * .5),
            particle = new THREE.Vector3(pX, pY, pZ),
            Tcolor = new THREE.Color(col.hex);

        colors.push(Tcolor);

        // add it to the geometry
        particles.vertices.push(particle);
    });

    // create the particle system
    const particleSystem = new THREE.Points(
        particles,
        pMaterial);

    particleSystem.name = 'colors';
    particles.colors = colors;

    // add it to the scene
    objects.push(particleSystem);
    scene.add(particleSystem);
    part = particleSystem;
}

renderer.render(scene, cam);


animate();

function setSceneColor(color) {
    scene.background = new THREE.Color(color);
    scene.fog = new THREE.Fog(color, 150, 200);
}

function init() {
    cam = new THREE.PerspectiveCamera(60, width / height, 1, 200);
    cam.position.z = cubeSize * 1.5;
    scene = new THREE.Scene();
    setSceneColor(bg);
    root = new THREE.Object3D();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    addCube();

    controls = new THREE.OrbitControls(cam, renderer.domElement);
    // controls.addEventListener( 'change', render ); // remove when using animation loop
    // enable animation loop when using damping or autorotation
    controls.enableDamping = true;
    controls.dampingFactor = .75;
    controls.enableZoom = true;
    controls.zoomSpeed = .25;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    controls.maxDistance = cubeSize * 1.75;
    controls.maxPolarAngle = Math.PI * 4;
    // controls.minPolarAngle = 0;
    controls.maxAzimuthAngle = Infinity;
    controls.minAzimuthAngle = - Infinity;


    let container = document.querySelector('#container');
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
    document.querySelector('button').addEventListener('click', toggleDarkMode, false);

}

function addCube(color?) {
    let geometryCube = cube(cubeSize);
    geometryCube.computeLineDistances();

    const colorspace = new THREE.LineSegments(geometryCube,
        new THREE.LineDashedMaterial(
            {
                color: color ||  0xffffff,
                dashSize: 1,
                gapSize: 1,
                linewidth: 1,
                // transparent: true,
                // blending: THREE.AdditiveBlending
            }
        )
    );

    colorspace.name = 'colorspace';

    objects.push(colorspace);
    scene.add(colorspace);

    spaceCube = colorspace;
}

function cube(size) {
    const h = size * 0.5;
    const geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(-h, -h, -h),
        new THREE.Vector3(-h, h, -h),
        new THREE.Vector3(-h, h, -h),
        new THREE.Vector3(h, h, -h),
        new THREE.Vector3(h, h, -h),
        new THREE.Vector3(h, -h, -h),
        new THREE.Vector3(h, -h, -h),
        new THREE.Vector3(-h, -h, -h),
        new THREE.Vector3(-h, -h, h),
        new THREE.Vector3(-h, h, h),
        new THREE.Vector3(-h, h, h),
        new THREE.Vector3(h, h, h),
        new THREE.Vector3(h, h, h),
        new THREE.Vector3(h, -h, h),
        new THREE.Vector3(h, -h, h),
        new THREE.Vector3(-h, -h, h),
        new THREE.Vector3(-h, -h, -h),
        new THREE.Vector3(-h, -h, h),
        new THREE.Vector3(-h, h, -h),
        new THREE.Vector3(-h, h, h),
        new THREE.Vector3(h, h, -h),
        new THREE.Vector3(h, h, h),
        new THREE.Vector3(h, -h, -h),
        new THREE.Vector3(h, -h, h)
    );
    return geometry;
}


function toggleDarkMode() {
    isDark = !isDark;

    document.querySelector('body').classList.toggle('isDark');
    const newColor = isDark ? cDark : cLight;

    setSceneColor(newColor);
    const colorspace = scene.getObjectByName('colorspace');
    scene.remove(colorspace);
    addCube(isDark ? '#ffffff' : cDark);

    document.documentElement.style.setProperty(`--background`, newColor);
    document.documentElement.style.setProperty(`--foreground`, isDark ? '#ffffff' : cDark);
}

function render() {
    const time = Date.now() * 0.0001;
    renderer.render(scene, cam);
    // controls.update();
    objects.forEach(object => {
        // object.rotation.x = 0.25 * time * ( i%2 == 1 ? 1 : -1);
        object.rotation.x = 0.25 * time;
        object.rotation.y = 0.25 * time;
    });
}

function animate() {
    requestAnimationFrame(animate);
    render();
}


$select.addEventListener('change', e => {
    colorMode = $select.value;
    objects = [];
    const colorspace = scene.getObjectByName('colorspace');
    scene.remove(colorspace);
    const colors = scene.getObjectByName('colors');
    scene.remove(colors);
    addParticles(colorList, colorMode);
    addCube(isDark ? cLight : cDark);
}, false);

function translate(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * ((value - low1) / (high1 - low1));
}

function yuv(rgb) {
    return [
    /*Y*/ rgb[0] * .299000 + rgb[1] * .587000 + rgb[2] * .114000,
    /*U*/ rgb[0] * -.168736 + rgb[1] * -.331264 + rgb[2] * .500000 + 128,
    /*V*/ rgb[0] * .500000 + rgb[1] * -.418688 + rgb[2] * -.081312 + 128
    ];
}

/* highlight a color name using a raycaster at some point*/
// function onDocumentMouseMove( event ) {

//    event.preventDefault();

//    // 'mouse' is of type Vector2

//    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
//    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

// }

// document.addEventListener('mousemove', onDocumentMouseMove);

// Highlight a color name using a raycaster at some point
let mousePosition = {} as any;
const rayCaster = new THREE.Raycaster();
function onDocumentMouseMove(event) {
    event.preventDefault();
    mousePosition.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mousePosition.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    rayCaster.setFromCamera(mousePosition, cam);
    let intersects = rayCaster.intersectObjects([scene.getObjectByName('colors')], false);
    if (intersects.length > 0) {
        let descriptions = [];
        for (let i = 0; i < intersects.length; i++) {
            // Only display those points we can SEE due to the near clipping plane.
            // Without this check, the ray caster will list them all, even if they're clipped by the near plane.
            // ".distance" is relative to the camera, not absolute world units.
            if (intersects[i].distance > cam.near) {
                let description = '  ' + colorList[intersects[i].index].name + ', ';
                description += '  ' + colorList[intersects[i].index].hex + ', ';
                description += '  Distance: ' + intersects[i].distance.toFixed(2) + ', ';
                description += '  Ray to point dist: ' + intersects[i].distanceToRay.toFixed(2) + ', ';
                description += '  Index: ' + intersects[i].index + ', ';
                description += '  Coords: [' + intersects[i].point.x.toFixed(2) + ', ' + intersects[i].point.y.toFixed(2) + ', ' + intersects[i].point.z.toFixed(2) + ']';
                descriptions.push(description);
            }
            if (descriptions.length > 0) {
                console.log('Mouse pointer intersected the following points, closest to furthest: ');
                for (let v = 0; v < descriptions.length; v++)
                    console.log(descriptions[v]);
            }
        }
    }
}

// document.addEventListener('mousedown', onDocumentMouseMove);
