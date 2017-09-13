
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import * as THREE from '../../three/three';
import {Variable, GPUComputationRenderer} from './GPUComputationRenderer';

const shaderSortFragment = require<string>('./pixel_sorter.y.frag');

const readFile = (file) => {
    const reader = new FileReader();

    return new Promise<string>((resolve, reject) => {
        reader.addEventListener('load', () => resolve(reader.result));
        reader.readAsDataURL(file);
    });
};

const createPlane = () => {
    const fragmentShader = `uniform sampler2D uMap;
		varying vec2 vUv;

		void main() {
			gl_FragColor = texture2D(uMap, vUv);
		}`;

    const vertexShader = `varying vec2 vUv;
		void main() {
			vUv = uv;
			${THREE.ShaderChunk.begin_vertex}
			${THREE.ShaderChunk.project_vertex}
		}`;

    const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uMap: { value: null },
        },
        fragmentShader,
        vertexShader,
    });

    return new THREE.Mesh(geometry, material);
};

const outputContainer = document.querySelector('.js-output-container');

const gpuComputeTextureSize = 512;
const plane = createPlane();

const camera = new THREE.Camera();
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(gpuComputeTextureSize, gpuComputeTextureSize);

const scene = new THREE.Scene();
scene.add(plane);

let gpuCompute: GPUComputationRenderer;
let textureSorted: THREE.DataTexture;
let variableSorted: Variable;

const initGpuCompute = (initialTextureData: ArrayLike<number> = null, dispose = false) => {
    if (dispose) {
        variableSorted.renderTargets.forEach(rt => rt.dispose());
        textureSorted.dispose();
    }

    gpuCompute = new GPUComputationRenderer(gpuComputeTextureSize, gpuComputeTextureSize, renderer);

    // create empty texture(THREE.DataTexture) data with size of 512 x 512
    textureSorted = gpuCompute.createTexture();

    if (initialTextureData) {
        textureSorted.image.data.set(initialTextureData);
    } else {
        // create initial pixcel color data
        const rowColors = new Array(gpuComputeTextureSize).fill(0).map((n, i) => ({
            r: (Math.sin(i) * .124 + 1) / 2,
            g: (Math.sin(i + .234) * .563 + 1) / 2,
            b: (Math.sin(i + .988) * .348 + 1) / 2,
        }));

        for (let i = 0, channels = 4; i < textureSorted.image.data.length; i += channels) {
            const pixelIndex = Math.floor(i / channels);
            const y = Math.floor(pixelIndex / gpuComputeTextureSize);

            const color = rowColors[(pixelIndex + y * 15838) % rowColors.length];

            // fill in initial pixel data to texture data
            textureSorted.image.data[i + 0] = color.r;
            textureSorted.image.data[i + 1] = color.g;
            textureSorted.image.data[i + 2] = color.b;
            textureSorted.image.data[i + 3] = 1;
        }
    }

    variableSorted = gpuCompute.addVariable('uTexture', shaderSortFragment, textureSorted);
    gpuCompute.setVariableDependencies(variableSorted, [variableSorted]);

    const gpuComputeCompileError = gpuCompute.init();

    (variableSorted.material as THREE.ShaderMaterial).uniforms.uIteration = { value: 0 };

    if (gpuComputeCompileError !== null) {
        console.error(gpuComputeCompileError);
    }
};

const animate = (callback) => {
    const update = () => {
        requestAnimationFrame(update);
        callback();
    };

    update();
};

initGpuCompute();
outputContainer.appendChild(renderer.domElement);

const render = () => {
    gpuCompute.compute();

    const texture = gpuCompute.getCurrentRenderTarget(variableSorted).texture;
    (plane.material as THREE.ShaderMaterial).uniforms.uMap.value = texture;
    variableSorted.material.uniforms.uIteration.value++;

    renderer.render(scene, camera);
};

animate(render);

const getImageData = (image, size = 1) => {
    const canvas = document.createElement('canvas');
    canvas.height = size;
    canvas.width = size;

    const context = canvas.getContext('2d');
    context.scale(1, -1);
    context.drawImage(image, 0, 0, size, -size);

    return context.getImageData(0, 0, size, size).data;
};

const input = document.querySelector('.js-input-image') as HTMLInputElement;
input.addEventListener('change', () => {
    const file = input.files[0];
    const image = new Image();

    if (!file) return;

    readFile(file)
        .then(dataUrl => new Promise((resolve, reject) => {
            image.addEventListener('load', () => resolve());
            image.src = dataUrl;
        }))
        .then(() => {
            const textureData = new Float32Array(getImageData(image, gpuComputeTextureSize))
                .map(value => value / 256);

            initGpuCompute(textureData, true);
        });
});
