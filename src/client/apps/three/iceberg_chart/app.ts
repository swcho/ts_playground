
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import * as _ from 'lodash-es';
import * as THREE from '../three';
import Stats = require('stats.js');
import dat = require('dat-gui');
import { TweenMax, TimelineMax, TweenLite, Elastic, Power2, Power4 } from 'gsap';

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

let renderer, scene, camera, controls, light;

let waterSettings = {
    base: 0.001,
    size: {
        x: 8,
        y: 0,
        z: 8
    },
    maxValue: 8,
    selected: 0,
    oldlevel: 1,
    level: 1,
    slosh: 0,
    sloshRange: [0.3, 0.7],
    sections: 10,
    range: 0.05,
    ranges: [0.06, 0.05],
    spaceBetween: 25,
    speed: 0.1
};

let sceneSettings = {
    cameraZ: 0
};

let timeline = new TimelineMax();
let sloshAnimation = new TimelineMax();

type WaterBlock = {
    title: string;
    bars: { color: number, value: number; }[];
    group?: THREE.Group;
    water?: THREE.BoxGeometry;
    waterMesh?: THREE.Mesh;
    sloshOffsets?: number[];
    topVertices?: (THREE.Vector3 & {zPos?: number})[];
    angles?: number[];
    wireframe?: THREE.WireframeHelper;
};

let waterBlocks: WaterBlock[]  = [{
    title: 'One',
    bars: [
        { color: 0xEF3740, value: 5 },
        { color: 0xEA962E, value: 4 },
        { color: 0x6FA272, value: 3 },
        { color: 0xEFF270, value: 3 },
        { color: 0x6DE57E, value: 2 },
    ]
}, {
    title: 'Two',
    bars: [
        { color: 0xEF3740, value: 6 },
        { color: 0xEA962E, value: 2 },
        { color: 0x6FA272, value: 3 },
        { color: 0xEFF270, value: 1 },
        { color: 0x6DE57E, value: 4 },
    ]
}, {
    title: 'Three',
    bars: [
        { color: 0xEF3740, value: 2 },
        { color: 0xEA962E, value: 2 },
        { color: 0x6FA272, value: 2 },
        { color: 0xEFF270, value: 2 },
        { color: 0x6DE57E, value: 2 },
    ]
}, {
    title: 'Four',
    bars: [
        { color: 0xEF3740, value: 7 },
        { color: 0xEA962E, value: 2 },
        { color: 0x6FA272, value: 1.4 },
        { color: 0xEFF270, value: 2 },
        { color: 0x6DE57E, value: 4 },
    ]
}, {
    title: 'Five',
    bars: [
        { color: 0xEF3740, value: 5 },
        { color: 0xEA962E, value: 5 },
        { color: 0x6FA272, value: 4 },
        { color: 0xEFF270, value: 2 },
        { color: 0x6DE57E, value: 2 },
    ]
}];

function init() {
    // renderer

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x222428, 1);
    document.body.appendChild(renderer.domElement);

    // scene

    scene = new THREE.Scene();

    // camera

    let aspect = window.innerWidth / window.innerHeight;
    let d = 20;
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, -100, 1000);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // materials

    let waterSides = new THREE.MeshPhongMaterial({
        color: 0x4DBFE1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        // shading: THREE.FlatShading,
        specular: 0x4DBFE1,
        shininess: 5,
    });

    let waterTop = new THREE.MeshPhongMaterial({
        color: 0x14435C,
        side: THREE.DoubleSide,
        shading: THREE.FlatShading,
        transparent: true,
        opacity: 0.9,
        specular: 0xFFFFFF,
        shininess: 10,
    });

    let materials = [waterSides, waterSides, waterTop, waterSides, waterSides, waterSides];


    // light

    light = new THREE.PointLight(0xffffff, 2, 600, 5);
    light.position.set(waterSettings.size.x + 1.5, waterSettings.maxValue * 2, (waterSettings.size.z + 1) - (waterSettings.spaceBetween * waterSettings.selected));
    scene.add(light);

    // grid

    let grid = new THREE.GridHelper(200, 1);
    grid.setColors(0x2B2A2F, 0x2B2A2F);
    scene.add(grid);

    // water blocks

    for (let j = 0; j < waterBlocks.length; j++) {
        let group = new THREE.Group();

        waterBlocks[j].group = group;
        waterBlocks[j].water = null;
        waterBlocks[j].waterMesh = null;
        waterBlocks[j].sloshOffsets = [];
        waterBlocks[j].topVertices = [];
        waterBlocks[j].angles = [];

        // floor

        let floorGeometry = new THREE.BoxGeometry(waterSettings.size.x, 0.5, waterSettings.size.z);
        floorGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.25, 0));

        let floor = new THREE.Mesh(
            floorGeometry,
            new THREE.MeshLambertMaterial({
                color: 0x333333
            })
        );
        floor.position.y = 0;
        floor.position.x = 0;
        floor.position.z = 0;

        group.add(floor);

        // sphere

        /*     var geometry = new THREE.SphereGeometry( 2, 15, 15 );
            var material = new THREE.MeshLambertMaterial( {color: 0xff5555} );
            var sphere = new THREE.Mesh( geometry, material );
            sphere.position.y = 5;
            group.add( sphere ); */

        // geometry
        waterBlocks[j].water = new THREE.BoxGeometry(waterSettings.size.x, waterSettings.maxValue, waterSettings.size.z, waterSettings.sections, 1, waterSettings.sections);

        let count = 0;
        let pos = 0 - Math.floor(waterSettings.sections / 2);
        let zeds = [];

        for (let i = waterBlocks[j].water.vertices.length - 1; i >= 0; i--) {

            if (waterBlocks[j].water.vertices[i].y >= (waterSettings.maxValue / 2)) {
                waterBlocks[j].topVertices.push(waterBlocks[j].water.vertices[i]);
                zeds.push(waterBlocks[j].water.vertices[i].z);
                waterBlocks[j].angles.push(count + waterSettings.speed + (Math.random() * 2));
                waterBlocks[j].sloshOffsets.push(Math.random() / 2);
                count++;
            }
        };

        zeds = _.uniq(zeds);
        zeds.sort(function (a, b) {
            return a - b;
        });

        for (let i = waterBlocks[j].topVertices.length - 1; i >= 0; i--) {
            waterBlocks[j].topVertices[i].zPos = zeds.indexOf(waterBlocks[j].topVertices[i].z) - Math.floor(zeds.length / 2);
        }

        waterBlocks[j].water.applyMatrix(new THREE.Matrix4().makeTranslation(0, (waterSettings.maxValue / 2) - waterSettings.base, 0));

        // mesh
        waterBlocks[j].waterMesh = new THREE.Mesh(waterBlocks[j].water, new THREE.MeshFaceMaterial(materials));
        waterBlocks[j].waterMesh.position.y = 0.51;
        waterBlocks[j].waterMesh.position.x = 0;
        waterBlocks[j].waterMesh.position.z = 0;
        group.add(waterBlocks[j].waterMesh);

        waterBlocks[j].wireframe = new THREE.WireframeHelper(waterBlocks[j].waterMesh, 0x00ff00);
        group.add(waterBlocks[j].wireframe);

        for (let i = 0; i < waterBlocks[j].bars.length; i++) {
            let height = waterBlocks[j].bars[i].value;
            let color = waterBlocks[j].bars[i].color;

            let row = Math.floor(i / 2);
            let col = i % 2 === 0 ? 0 : 1;

            let dataBar = new THREE.BoxGeometry(0.8 * 2, height * 2, 0.8 * 2, 10, 10, 10);
            dataBar.applyMatrix(new THREE.Matrix4().makeTranslation(0, height, 0));

            let dataBarMesh = new THREE.Mesh
                (
                dataBar,
                new THREE.MeshLambertMaterial({ color: color, transparent: false, opacity: 0.9 })
                );
            dataBarMesh.position.y = 0;
            dataBarMesh.position.x = -0 + (2.1 * col);
            dataBarMesh.position.z = -2 + (2.1 * row);

            group.add(dataBarMesh);

            let dataBarMeshOutline = new THREE.EdgesHelper( dataBarMesh, 0xdddddd );
            // dataBarMeshOutline.material.linewidth = 2;
            dataBarMeshOutline.material.transparent = true;
            dataBarMeshOutline.material.opacity = 0.75;
            group.add( dataBarMeshOutline );

            dataBarMesh.scale.y = 0.1;
            TweenLite.to(dataBarMesh.scale, 2, { y: 1, delay: 0.1 + (i / 6), ease: Elastic.easeOut });

            dataBarMeshOutline.scale.y = 0.1;
            TweenLite.to(dataBarMeshOutline.scale, 2, {y: 0.1, delay: 1 + (i / 6), ease: Elastic.easeOut});
        }

        scene.add(group);

        group.position.z = 0 - j * waterSettings.spaceBetween;
    };
}

function render() {
    renderer.render(scene, camera);
}

function animate() {
    camera.position.set(20, 20, 20 + sceneSettings.cameraZ);
    camera.lookAt(new THREE.Vector3(0, 5.6, sceneSettings.cameraZ));

    requestAnimationFrame(animate);

    for (let i = 0; i < waterBlocks.length; i++) {
        waterBlocks[i].waterMesh.scale.y = waterSettings.size.y / 100;

        for (let j = waterBlocks[i].topVertices.length - 1; j >= 0; j--) {
            let sloshAmount = waterBlocks[i].topVertices[j].zPos * waterSettings.slosh * waterBlocks[i].sloshOffsets[j];
            waterBlocks[i].topVertices[j].y = sloshAmount + (waterSettings.maxValue + Math.sin(waterBlocks[i].angles[j]) * waterSettings.range);
            waterBlocks[i].angles[j] += waterSettings.speed;
        }

        waterBlocks[i].water.verticesNeedUpdate = true;
    }

    render();
}

function next() {
    let toSelect = waterSettings.selected + 1;
    if (toSelect >= waterBlocks.length) toSelect = 0;
    selectBlock(toSelect, waterSettings.selected);
}

window['next'] = next;

function prev() {
    let toSelect = waterSettings.selected - 1;
    if (toSelect < 0) toSelect = waterBlocks.length - 1;
    selectBlock(toSelect, waterSettings.selected);
}

window['prev'] = prev;

function selectBlock(newPos, oldPos) {
    waterSettings.selected = newPos;
    let targetSlosh = 0;
    let sloshAmount = (((waterSettings.sloshRange[0] - waterSettings.sloshRange[1]) / 100) * (100 - waterSettings.size.y)) + waterSettings.sloshRange[1];
    if (newPos > oldPos) targetSlosh = -sloshAmount;
    else if (newPos < oldPos) targetSlosh = sloshAmount;

    sloshAnimation.clear();
    sloshAnimation.add(TweenMax.to(waterSettings, 0.4, {
        slosh: targetSlosh,
        ease: Power2.easeIn
    } as any));
    sloshAnimation.add(TweenMax.to(waterSettings, 2.5, {
        slosh: 0,
        ease: Elastic.easeOut
    } as any));
    sloshAnimation.restart();

    TweenMax.to(sceneSettings, 1, {
        cameraZ: 0 - (waterSettings.spaceBetween * newPos),
        ease: Power4.easeInOut
    } as any);
    TweenMax.to(light.position, 1, {
        z: (waterSettings.size.z + 0.5) - (waterSettings.spaceBetween * waterSettings.selected),
        ease: Power4.easeInOut
    } as any);
}

function setWaterLevel(percent) {
    waterSettings.oldlevel = waterSettings.level;

    let level = (waterSettings.maxValue / 100) * percent;
    let p = percent === 100 ? 105 : percent;
    TweenLite.to(waterSettings.size, 0.5, {
        y: level > 0.5 ? p : ((0.5 / waterSettings.maxValue) * 100),
        ease: Power2.easeInOut
    });

    let diff = percent - waterSettings.level;
    let disturbAmount = (diff / 100) * 0.5;
    timeline.clear();
    let r = (((waterSettings.ranges[0] - waterSettings.ranges[1]) / 100) * (100 - waterSettings.size.y)) + waterSettings.ranges[1];
    timeline.add(TweenMax.to(waterSettings, 0.5, {
        range: r + disturbAmount,
        ease: Power2.easeIn
    } as any));
    timeline.add(TweenMax.to(waterSettings, 2.5, {
        range: r,
        ease: Elastic.easeOut
    } as any));

    timeline.restart();

    waterSettings.level = percent;
}

window['setWaterLevel'] = setWaterLevel;

function randomHeight() {
    setWaterLevel(Math.random() * 100);
}

window['randomHeight'] = randomHeight;

init();
render();
animate();
setWaterLevel(50);

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}, false);
