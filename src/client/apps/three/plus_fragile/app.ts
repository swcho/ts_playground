
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import * as THREE from '../three';
import Stats = require('stats.js');
import dat = require('dat-gui');
import { TimelineMax, Power3, Power4, TweenMax, Linear } from 'gsap';
import { THREERoot } from './threeroot';

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

function Animation(params) {
    const prefabRadius = 0.05;
    const plusPositions = params.positions;
    const prefab = new THREE.SphereGeometry(prefabRadius, 4, 3);
    const geometry = new THREE.BAS.PrefabBufferGeometry(prefab, plusPositions.length);

    geometry.computeVertexNormals();

    const maxDuration = 2.0;
    geometry.createAttribute('anim', 2, (data, i) => {
        const start = plusPositions[i];

        data[0] = 0.0;
        data[1] = THREE.Math.mapLinear(start.y, 0, 14, 0, maxDuration) * THREE.Math.randFloat(0.5, 1.0);
    });

    geometry.createAttribute('startPosition', 3, (data, i) => {
        plusPositions[i].toArray(data);
    });

    const spread = 2;
    geometry.createAttribute('endPosition', 3, (data, i) => {
        const start = plusPositions[i];
        let targetY;

        const length = Math.sqrt(start.x * start.x + start.z * start.z);

        if (length <= 1) {
            targetY = prefabRadius * (0.5 + (1 - length) * 4.0);
        }
        else {
            targetY = prefabRadius * 0.5;
        }

        data[0] = start.x + THREE.Math.randFloatSpread(spread);
        data[1] = targetY;
        data[2] = start.z + THREE.Math.randFloatSpread(spread);
    });

    const material = new THREE.BAS.StandardAnimationMaterial({
        flatShading: true,
        uniformValues: {
            // diffuse: new THREE.Color(colors.turquoise),
            metalness: 0.5,
            roughness: 0.5
        },
        uniforms: {
            time: { value: 0 }
        },
        vertexParameters: [`
        uniform float time;

        attribute vec2 anim;
        attribute vec3 startPosition;
        attribute vec3 endPosition;
      `],
        vertexFunctions: [
            THREE.BAS.ShaderChunk.ease_bounce_out,
            THREE.BAS.ShaderChunk.ease_quad_in
        ],
        vertexPosition: [`
        float progress = clamp(time - anim.x, 0.0, anim.y) / anim.y;
        float xzProgress = easeQuadIn(progress);
        float yProgress = easeBounceOut(progress);

        transformed.xz += mix(startPosition.xz, endPosition.xz, xzProgress);
        transformed.y += mix(startPosition.y, endPosition.y, yProgress);
      `]
    });

    THREE.Mesh.call(this, geometry, material);

    this.customDepthMaterial = THREE.BAS.Utils.createDepthAnimationMaterial(material);
}

Animation.prototype = Object.create(THREE.Mesh.prototype);
Animation.prototype.constructor = Animation;

Animation.prototype.animate = function (duration) {
    return TweenMax.to(this, duration, { time: 2, ease: Linear.easeNone } as any);
};
Object.defineProperty(Animation.prototype, 'time', {
    get() {
        return this.material.uniforms.time.value;
    },
    set(v) {
        this.material.uniforms.time.value = v;
        this.customDepthMaterial.uniforms.time.value = v;
    }
});

Animation.prototype.setColor = function (v) {
    this.material.uniforms.diffuse.value.set(v);
};

const colors = {
    turquoise: 0x47debd,
    // darkPurple: 0x2e044e,
    purple: 0x7821ec,
    yellow: 0xfff95d,
    // white: 0xffffff,
    // black: 0x000000
};
const colorKeys = Object.keys(colors);
let colorIndex = 0;

function nextColor() {
    const c = colors[colorKeys[colorIndex]];
    ++colorIndex > colorKeys.length - 1 && (colorIndex = 0);

    return c;
}

const root = new THREERoot({
    createCameraControls: false,
    zNear: 0.01,
    zFar: 1000
});

root.renderer.shadowMap.enabled = true;
root.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
root.renderer.setClearColor(0x000000);
root.camera.position.set(10, 10, 10);
root.camera.lookAt(new THREE.Vector3(0, 4, 0));

const light = new THREE.SpotLight(0xffffff, 4, 50, Math.PI * 0.25, 1.0, 2.0);
light.position.set(0, 14, 0);
light.castShadow = true;
light.shadow.mapSize.width = 512;
light.shadow.mapSize.height = 512;
// BUILD ERROR REMARK START
// light.shadow.camera.near = 0.5;
// light.shadow.camera.far = light.position.y + 1;
// BUILD ERROR REMARK END

root.add(light);
root.add(light.target);

// root.add(new THREE.AmbientLight(colors.darkPurple));

const light2 = new THREE.DirectionalLight(0xffffff, 0.125);
light2.position.set(0, 0, 1);
root.add(light2);

const light3 = new THREE.DirectionalLight(0xffffff, 0.125);
light3.position.set(1, 0, 0);
root.add(light3);

const allLights = [light, light2, light3];
const dirLights = [light2, light3];

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.1,
        roughness: 0.9
    })
);
floor.rotation.x = Math.PI * -0.5;
floor.receiveShadow = true;
root.add(floor);

const elMessage = document.querySelector('.message');
const messages = [
    'Don\'t click.',
    'Oh no!',

    'Please don\'t click.',
    'Oh no!',

    'Really, don\'t click this time.',
    '...',

    'Ok, go ahead, click. See if I care.',
    'This is fine.',

    'Happy now?'
];
let messageIndex = 0;

function nextMessage() {
    elMessage.innerHTML = messages[++messageIndex];
}

new THREE.JSONLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/304639/plus.json', (model) => {

    model.translate(0, 6, 0);

    const animation = new Animation({
        positions: model.vertices
    });
    animation.castShadow = true;
    animation.receiveShadow = true;
    root.add(animation);

    animation.setColor(nextColor());
    elMessage.innerHTML = messages[0];

    const proxy = {
        ry: 0.005
    };
    let resetting = false;
    let ruined = false;

    window.addEventListener('click', () => {
        if (resetting || ruined) return;
        resetting = true;

        const tl = new TimelineMax();

        tl.add(nextMessage);
        tl.add(animation.animate(4));
        tl.to(proxy, 4, { ry: 0, ease: Power4.easeOut }, 0);
        tl.to(allLights, 0.3, { intensity: 0, ease: Power3.easeOut }, '-=0.5');
        tl.add(() => {
            animation.time = 0;
            animation.setColor(nextColor());
            proxy.ry = 0.005;
            root.scene.rotation.y = 0;
        });
        tl.add('afterReset');
        tl.add(nextMessage);
        tl.add(() => {
            if (messageIndex === messages.length - 1) {
                ruined = true;
                root.remove(animation);
            }
        });
        tl.to(light, 0.2, { intensity: 4, ease: Power3.easeOut }, 'afterReset');
        tl.to(dirLights, 0.2, { intensity: 0.125, ease: Power3.easeOut }, 'afterReset');
        tl.add(() => {
            resetting = false;
        });
    });

    root.addUpdateCallback(() => {
        animation.rotation.y += proxy.ry;
    });
});
