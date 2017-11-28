
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import * as THREE from '../three';
import * as BlurShader from './blurshader';
import {ColorMatrixShader} from './colormatrixshader';

import Stats = require('stats.js');
import { BufferAttribute } from '../three';
import dat = require('dat-gui');
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
gui.add(CONFIG, 'bloom');
gui.add(CONFIG, 'fxaa');
gui.add(CONFIG, 'copy');
gui.add(CONFIG, 'horizontalBlur');
gui.add(CONFIG, 'verticalBlur');
gui.add(CONFIG, 'colorMatrix');

///////////
// STATS //
///////////
const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.bottom = '0px';
stats.domElement.style.zIndex = '100';
document.body.appendChild(stats.domElement);

const blurFactor = 6; // make it an even integer
const blurThreshold = 0.05;
const colorMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 15
];
const colorMultiplier = [0, 0, 0, -13];

setTimeout(() => {
    const size = 64;
    const particleCount = 100;
    const lettersData = generateLetterTextures(size);
    const particleText = new ParticleText(particleCount, lettersData, size) as any;
    new Simulation('js-app', [particleText], 0, 0, 60);
}, 0);

class ParticleText extends THREE.Mesh<THREE.BAS.BasicAnimationMaterial, THREE.BAS.PrefabBufferGeometry> {
    static createMaterial(count: number) {
        const aLetterData = [];
        for (let i = 0; i < count; i++) {
            aLetterData.push(`attribute vec3 aLetterData${i};`);
        }
        return new THREE.BAS.BasicAnimationMaterial({
            // shading: THREE.FlatShading,
            flatShading: true,
            side: THREE.FrontSide,
            uniforms: {
                uTime: { value: 0 },
                uDuration: { value: 20 }
            },
            uniformValues: {},
            varyingParameters: [],
            vertexFunctions: [
                THREE.BAS.ShaderChunk['ease_cubic_in_out']
            ],
            vertexParameters: [
                'uniform float uTime;',
                'uniform float uDuration;',
                ...aLetterData
            ],
            vertexInit: [
                'float seed = 5625463739.0;'
            ],
            vertexNormal: [],
            vertexPosition: [
                `
          float progress = mod(uTime, uDuration) / uDuration;
          float easeProgress = fract(progress * 10.0);
          if (progress >= 0.9) {        transformed += mix(aLetterData9, aLetterData0, easeCubicInOut(easeProgress));
          } else if (progress >= 0.8) { transformed += mix(aLetterData8, aLetterData9, easeCubicInOut(easeProgress));
          } else if (progress >= 0.7) { transformed += mix(aLetterData7, aLetterData8, easeCubicInOut(easeProgress));
          } else if (progress >= 0.6) { transformed += mix(aLetterData6, aLetterData7, easeCubicInOut(easeProgress));
          } else if (progress >= 0.5) { transformed += mix(aLetterData5, aLetterData6, easeCubicInOut(easeProgress));
          } else if (progress >= 0.4) { transformed += mix(aLetterData4, aLetterData5, easeCubicInOut(easeProgress));
          } else if (progress >= 0.3) { transformed += mix(aLetterData3, aLetterData4, easeCubicInOut(easeProgress));
          } else if (progress >= 0.2) { transformed += mix(aLetterData2, aLetterData3, easeCubicInOut(easeProgress));
          } else if (progress >= 0.1) { transformed += mix(aLetterData1, aLetterData2, easeCubicInOut(easeProgress));
          } else {                      transformed += mix(aLetterData0, aLetterData1, easeCubicInOut(easeProgress));
          }
        `
            ],
            vertexColor: [],
            fragmentFunctions: [],
            fragmentParameters: [],
            fragmentInit: [],
            fragmentMap: [],
            fragmentDiffuse: []
        });
    }

    static assignProps(geometry: THREE.BAS.PrefabBufferGeometry, prefabCount: number, lettersData: number[][], size: number) {
        const aLettersData: BufferAttribute[] = [];
        for (let j = 0; j < lettersData.length; j++) {
            aLettersData.push(geometry.createAttribute(`aLetterData${j}`, 3));
        }
        const radius = 300;
        const offsetX = size / 2;
        const offsetY = -size / 2;
        for (let i = 0; i < prefabCount; i++) {
            for (let k = 0; k < lettersData.length; k++) {
                const letterIndex = k;
                const letterData = lettersData[letterIndex];
                const letterPartIndex = Math.floor(letterData.length * Math.random());
                const xPos = letterData[letterPartIndex] % size;
                const yPos = Math.floor(letterData[letterPartIndex] / size);
                const position = new THREE.Vector3(xPos - offsetX, 0 - yPos - offsetY, Math.random() * 5);
                geometry.setPrefabData(aLettersData[letterIndex], i, position.toArray());
            }
        }
    }

    constructor(prefabCount: number, lettersData: number[][], size: number) {
        const model = new THREE.TetrahedronGeometry(1, 0);
        const geometry = new THREE.BAS.PrefabBufferGeometry(model, prefabCount);
        geometry.computeVertexNormals();
        geometry.bufferUvs();
        ParticleText.assignProps(geometry, prefabCount, lettersData, size);
        const material = ParticleText.createMaterial(lettersData.length);
        super(geometry, material);
        this.frustumCulled = false;
    }

    get time() {
        return this.material.uniforms.uTime.value;
    }

    set time(newTime) {
        this.material.uniforms.uTime.value = newTime;
    }
}

class Simulation {
    constructor(domId: string, private entities: THREE.Mesh[], x = 0, y = 0, z = 0) {
        const camera = this.createCamera(80, x, y, z, window.innerWidth, window.innerHeight);
        const target = new THREE.Vector3(0, 0, 0);
        camera.lookAt(target);
        const scene = new THREE.Scene();
        this.createLights(scene);
        const renderer = this.createRenderer(0x666666);
        document.getElementById(domId).appendChild(renderer.domElement);
        const {
            composer,
            effects
        } = this.createComposerAndEffects(scene, camera, renderer);
        const handleWindowResize = this.onWindowResize(camera, renderer, composer, effects);
        handleWindowResize();
        window.addEventListener('resize', handleWindowResize, false);
        entities.map(e => scene.add(e));
        const controls = this.addControls(camera, target);
        this.animate(composer, effects, renderer, scene, camera, controls, entities, +(new Date()));
    }

    private bloom: THREE.UnrealBloomPass;
    private fxaa: THREE.ShaderPass;
    private copy: THREE.ShaderPass;
    private horizontalBlur: THREE.ShaderPass;
    private verticalBlur: THREE.ShaderPass;
    private colorMatrix: THREE.ShaderPass;
    createComposerAndEffects(scene, camera, renderer) {
        const effects: any = {};
        const renderScene = new THREE.RenderPass(scene, camera);
        const strength = 0.5;
        const radius = 3.1;
        const threshold = 0.05;
        effects.bloom = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), strength, radius, threshold);
        this.bloom = effects.bloom;
        // fast anti alias shader
        effects.fxaa = new THREE.ShaderPass(THREE.FXAAShader);
        effects.fxaa.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);
        this.fxaa = effects.fxaa;
        // copy shader
        effects.copy = new THREE.ShaderPass(THREE.CopyShader);
        effects.copy.renderToScreen = true;
        this.copy = effects.copy;
        // horizontal blur shader
        effects.horizontalBlur = new THREE.ShaderPass(BlurShader.horizontal(blurFactor, blurThreshold));
        effects.horizontalBlur.uniforms.h.value = 1 / window.innerWidth;
        this.horizontalBlur = effects.horizontalBlur;
        // vertical blur shader
        effects.verticalBlur = new THREE.ShaderPass(BlurShader.vertical(blurFactor, blurThreshold));
        effects.verticalBlur.uniforms.v.value = 1 / window.innerHeight;
        this.verticalBlur = effects.verticalBlur;
        // color matrix shader
        effects.colorMatrix = new THREE.ShaderPass(ColorMatrixShader);
        effects.colorMatrix.uniforms.uMatrix.value = colorMatrix;
        effects.colorMatrix.uniforms.uMultiplier.value = colorMultiplier;
        this.colorMatrix = effects.colorMatrix;
        const composer = new THREE.EffectComposer(renderer);
        composer.setSize(window.innerWidth, window.innerHeight);
        composer.addPass(renderScene);
        composer.addPass(effects.fxaa);
        composer.addPass(effects.horizontalBlur);
        composer.addPass(effects.verticalBlur);
        composer.addPass(effects.colorMatrix);
        composer.addPass(effects.bloom);
        composer.addPass(effects.copy);
        return {
            composer,
            effects
        };
    }

    addControls(camera, target) {
        const controls = new THREE.OrbitControls(camera);
        controls.target = target;
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.rotateSpeed = 0.1;
        return controls;
    }

    onWindowResize(camera, renderer, composer, effects) {
        return (event?) => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            composer.setSize(width, height);
            effects.horizontalBlur.uniforms.h.value = 1 / window.innerWidth;
            effects.verticalBlur.uniforms.v.value = 1 / window.innerHeight;
            effects.fxaa.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);
        };
    }

    animate(composer, effects, renderer, scene, camera, controls, entities, lastTime) {
        const currentTime = +(new Date());
        const timeDelta = currentTime - lastTime;
        entities.forEach(e => e.time += timeDelta / 1000);
        this.bloom.enabled = CONFIG.bloom;
        this.fxaa.enabled = CONFIG.fxaa;
        this.copy.enabled = CONFIG.copy;
        this.horizontalBlur.enabled = CONFIG.horizontalBlur;
        this.verticalBlur.enabled = CONFIG.verticalBlur;
        this.colorMatrix.enabled = CONFIG.colorMatrix;
        this.entities.forEach(mash => mash.material['wireframe'] = CONFIG.wireframe);
        requestAnimationFrame(() => {
            this.animate(composer, effects, renderer, scene, camera, controls, entities, currentTime);
        });
        controls.update();
        composer.render();
        stats.update();
        // renderer.render(scene, camera)
    }

    createCamera(fov, x = 0, y = 0, z = 0, width, height) {
        const camera = new THREE.PerspectiveCamera(fov, width / height, 1, 1000);
        camera.position.x = x;
        camera.position.y = y;
        camera.position.z = z;
        return camera;
    }

    createLights(scene) {
        const light = new THREE.AmbientLight('#f8845e', 1.5);
        scene.add(light);
        const hemilight = new THREE.HemisphereLight('#b82d98', '#26688f', 0.5);
        scene.add(hemilight);
        let dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
        dirLight.color.setHSL(0.1, 1, 0.95);
        dirLight.position.set(-1, 1.75, 1);
        dirLight.position.multiplyScalar(50);
        scene.add(dirLight);
    }

    createRenderer(clearColor = 0x000000) {
        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.LinearToneMapping;
        renderer.autoClear = true;
        renderer.setClearColor(clearColor, 0);
        return renderer;
    }
}

function generateLetterTextures(size: number) {
    const lettersData: number[][] = [];
    for (let i = 0; i < 10; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.font = `${size - 5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('' + i, canvas.width / 2, canvas.height / 2);
        const canvasData = ctx.getImageData(0, 0, size, size);
        const letterData: number[] = [];
        for (let j = 0; j < canvasData.data.length / 4; j++) {
            const alpha = canvasData.data[j * 4 + 3];
            if (alpha > 0) {
                letterData.push(j);
            }
        }
        lettersData.push(letterData);
    }
    return lettersData;
}
