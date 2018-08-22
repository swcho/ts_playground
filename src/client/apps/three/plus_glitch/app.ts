
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

require('./style.scss');

import * as THREE from '../three';
import { THREERoot } from '../plus_fragile/threeroot';
import Stats = require('stats.js');
import dat = require('dat-gui');
import { TweenMax, Elastic, Back, Expo, Power3 } from 'gsap';

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
    createCameraControls: true
});

root.renderer.setClearColor(colors.yellow);
root.camera.position.set(0, 0, 16);
root.camera.lookAt(root.scene.position);
root.controls.autoRotate = true;

const loader = new THREE.JSONLoader();

let light;

light = new THREE.DirectionalLight(colors.darkPurple);
light.position.set(-1, 1, 1);
root.add(light);

light = new THREE.DirectionalLight(colors.purple);
light.position.set(1, 1, 1);
root.add(light);

loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/304639/plus.json', (model) => {
    const mesh = new THREE.Mesh(
        model,
        new THREE.MeshStandardMaterial({
        })
    );

    root.add(mesh);

    const glitchPass = new THREE.ShaderPass({
        uniforms: {
            tDiffuse: { value: null },

            wave0: { value: new THREE.Vector3() },
            wave1: { value: new THREE.Vector3() },
            wave2: { value: new THREE.Vector3() },

            offset0: { value: 0 },
            offset1: { value: 0 },
        },

        vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

        fragmentShader: `
        uniform sampler2D tDiffuse;

        uniform vec3 wave0;
        uniform vec3 wave1;
        uniform vec3 wave2;

        uniform float offset0;
        uniform float offset1;

        varying vec2 vUv;

        const vec2 ONE = vec2(1.0, 1.0);

        void main() {
          vec4 texel;
          vec2 rOffset;
          vec2 gOffset;
          vec2 bOffset;

          float s0 = sin(wave0.z + wave0.y * vUv.x) * wave0.x;
          float c0 = cos(wave0.z + wave0.y * vUv.y) * wave0.x;

          float s1 = sin(wave1.z + wave1.y * vUv.x) * wave1.x;
          float c1 = cos(wave1.z + wave1.y * vUv.y) * wave1.x;

          float s2 = sin(wave2.z + wave2.y * vUv.x) * wave2.x;
          float c2 = cos(wave2.z + wave2.y * vUv.y) * wave2.x;

          rOffset.x = s0 * c2 + offset0;
          rOffset.y = c0 + s1 + offset1;

          gOffset.x = s1 + c1 - offset1;
          gOffset.y = c1 + s2 + offset1;

          bOffset.x = (s2 / c2 - offset0) * 0.01;
          bOffset.y = (c2 * c0 * offset0) * 0.01;

          texel.r = texture2D(tDiffuse, mod(vUv + rOffset, ONE)).r;
          texel.g = texture2D(tDiffuse, mod(vUv + gOffset, ONE)).g;
          texel.b = texture2D(tDiffuse, mod(vUv + bOffset, ONE)).b;
          texel.a = 1.0;

          gl_FragColor = texel;
        }
      `
    });

    TweenMax.to(glitchPass.uniforms.wave0.value, 8, {
        x: 0.075,
        y: Math.PI * 8,
        z: 0,
        ease: Elastic.easeInOut,
        repeat: -1,
        yoyo: true
    } as any);

    TweenMax.to(glitchPass.uniforms.wave1.value, 16, {
        x: 0.1,
        y: Math.PI * 4,
        z: 0,
        ease: Back.easeOut,
        repeat: -1,
        yoyo: true
    } as any);

    TweenMax.to(glitchPass.uniforms.wave2.value, 12, {
        x: 2.0,
        y: Math.PI * 2,
        z: 0,
        ease: Expo.easeInOut,
        repeat: -1,
        yoyo: true
    } as any);

    TweenMax.to(glitchPass.uniforms.offset0, 6, {
        value: 4.0,
        ease: Power3.easeOut,
        repeat: -1,
        yoyo: true
    } as any);

    TweenMax.to(glitchPass.uniforms.offset1, 4, {
        value: 0.75,
        ease: Expo.easeInOut,
        repeat: -1,
        yoyo: true
    } as any);

    // const bloomPass = new THREE.BloomPass(1.0, 25, 4, 512);
    const copyPass = new THREE.ShaderPass(THREE.CopyShader);

    root.initPostProcessing([
        // bloomPass,
        glitchPass,
        copyPass
    ]);

});
