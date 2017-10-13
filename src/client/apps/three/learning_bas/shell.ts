
import * as THREE from '../three';

function createMaterial() {
    return new THREE.BAS.PhongAnimationMaterial({
        // ? https://github.com/mrdoob/three.js/issues/347
        shading: THREE.SmoothShading,

        // https://threejs.org/docs/#api/materials/Material.side
        side: THREE.FrontSide,

        // https://threejs.org/docs/#api/materials/ShaderMaterial.uniforms
        uniforms: {
            uTime: {value: 0},
            uScalingFactor: {value: 4.9},
            uFreqMin: {value: 0.62},
            uFreqMax: {value: 0.72},
            uNoiseAmplitude: {value: 1},
            uNoiseFrequency: {value: 0.08},
            uQWidth: {value: 0},
            uAnimation: {value: new THREE.Vector3(0, -3, 0.16)},
            uColor1: {value: new THREE.Vector4(1, 1, 1, 1)},
            uColor2: {value: new THREE.Vector4(1, 0.8, 0.2, 1)},
            uColor3: {value: new THREE.Vector4(1, 0.03, 0, 1)},
            uColor4: {value: new THREE.Vector4(0.05, 0.02, 0.02, 1)},
        },

        // https://github.com/zadvorsky/three.bas/wiki/02.-Material-Overview#threebas-material-constructors
        vertexFunctions: [
            require('./noise.orig.vert'),
        ],

        vertexParameters: [
            'uniform float uTime;',
            'uniform float uScalingFactor;',
            'uniform float uFreqMin;',
            'uniform float uFreqMax;',
            'uniform float uNoiseAmplitude;',
            'uniform float uNoiseFrequency;',
            'uniform float uQWidth;',
            'uniform vec3 uAnimation;',
            'attribute vec3 aPosition;',
            'varying vec3 vRawNormal;',
        ],

        vertexInit: [
            'vec3 newPosition = aPosition;',
        ],

        vertexNormal: [
            'objectNormal += newPosition;'
        ],

        vertexPosition: [
            'transformed += newPosition;',
            'transformed *= 1.0 - saturate(abs(turbulence(transformed * uNoiseFrequency + uAnimation * uTime, uFreqMin, uFreqMax, uQWidth) * (uNoiseAmplitude * (uNoiseFrequency * uScalingFactor))));',
            'vRawNormal = objectNormal;'
        ],

        fragmentFunctions: [
            require('./noise.orig.vert'),
            'uniform vec4 uColor1;',
            'uniform vec4 uColor2;',
            'uniform vec4 uColor3;',
            'uniform vec4 uColor4;',
            `
            vec4 fireShade(float distance) {
                float c1 = saturate(distance * 5.0 + 0.5);
                float c2 = saturate(distance * 5.0);
                float c3 = saturate(distance * 3.4 - 0.5);
                vec4 a = mix(uColor1, uColor2, c1);
                vec4 b = mix(a, uColor3, c2);
                return mix(b, uColor4, c3);
            }
            `
        ],

        fragmentParameters: [
            'uniform float uFreqMin;',
            'uniform float uFreqMax;',
            'uniform float uQWidth;',
            'uniform float uTime;',
            'uniform float uNoiseAmplitude;',
            'uniform vec3 uAnimation;',
            'uniform float uNoiseFrequency;',
            'varying vec3 vRawNormal;',
        ],

        fragmentDiffuse: [
            'float noise = saturate(abs(turbulence(vRawNormal * uNoiseFrequency + uAnimation * uTime, uFreqMin, uFreqMax, uQWidth) * uNoiseAmplitude));',
            'diffuseColor.rgb = fireShade(1.0 - noise).rgb;',
        ]

    });
}

function assignPosition(geometry: THREE.BAS.ModelBufferGeometry) {
    geometry.createAttribute('aPosition', 3, (data, i) => {
        geometry.centroids[i].toArray(data);
    });
}

export class Shell extends THREE.Mesh {

    constructor(radius: number, detail: number) {
        const model = new THREE.IcosahedronGeometry(radius, detail);
        THREE.BAS.Utils.separateFaces(model);
        const geometry = new THREE.BAS.ModelBufferGeometry(model, {
            localizeFaces: true,
            computeCentroids: true,
        });
        geometry.bufferUVs();
        assignPosition(geometry);
        const material = createMaterial();
        super(geometry, material);
    }

    get time() {
        return (this.material as THREE.ShaderMaterial).uniforms['uTime'].value;
    }

    set time(newTime) {
        (this.material as THREE.ShaderMaterial).uniforms['uTime'].value = newTime;
    }
}
