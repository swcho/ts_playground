
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

require('./style.scss');

import * as THREE from '../three';
import Stats = require('stats.js');
import dat = require('dat-gui');
import { THREERoot } from '../plus_fragile/threeroot';

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

/**
 #47debd (turquoise)
 #2e044e (dark purple)
 #7821ec (purle)
 #fff95d (yellow)
 */
const colors = {
    turquoise: 0x47debd,
    darkPurple: 0x2e044e,
    purple: 0x7821ec,
    yellow: 0xfff95d,
};

const root = new THREERoot({
    createCameraControls: true,
    zNear: 0.01,
    zFar: 100
});

root.renderer.setClearColor(0xffffff);
root.camera.position.set(0, 0, 3.3);
root.camera.lookAt(root.scene.position);
root.controls.autoRotate = true;

const bottomLight = new THREE.DirectionalLight(colors.purple);
bottomLight.position.set(0.25, -1, 0);
root.add(bottomLight);

const topLight = new THREE.DirectionalLight(colors.purple);
topLight.position.set(0, 1, 0.5);
root.add(topLight);

root.add(new THREE.AmbientLight(colors.purple));

const loader = new THREE.JSONLoader();

loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/304639/plus.json', (model) => {
    const plus = new THREE.Mesh(
        model,
        new THREE.MeshBasicMaterial({
            wireframe: true,
            color: colors.turquoise
        })
    );
    root.add(plus);

    const prefab = new THREE.SphereGeometry(0.05);
    const geometry = new THREE.BAS.PrefabBufferGeometry(prefab, model.vertices.length);

    geometry.computeVertexNormals();

    geometry.createAttribute('anim', 2, (data, i) => {
        data[0] = model.vertices[i].length();
        // data[0] = THREE.Math.mapLinear(model.vertices[i].y, -4, 4, 0, 1);
        // data[0] = Math.random();
        data[1] = 1.0;
    });

    geometry.createAttribute('aPosition', 3, (data, i) => {
        model.vertices[i].toArray(data);
    });

    const material = new THREE.BAS.StandardAnimationMaterial({
        uniformValues: {
            metalness: 0.25,
            roughness: 0.0,
        },
        uniforms: {
            time: { value: 0 },
        },
        vertexParameters: [`
            uniform float time;

            attribute vec2 anim;
            attribute vec3 aPosition;
        `],
        vertexPosition: [`
            float progress = mod(time + anim.x, anim.y) / anim.y;

            progress = abs(sin(progress * PI * 6.0));

            transformed *= progress;
            transformed += aPosition;
        `]
    });

    const mesh = new THREE.Mesh(geometry, material);
    root.add(mesh);

    root.addUpdateCallback(() => {
        material.uniforms.time.value += (1 / 360);
    });
});
