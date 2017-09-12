
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import * as THREE from '../../three/three';
import {GPUComputationRenderer} from './GPUComputationRenderer';

const shaderSortFragment = `
	const vec4  kRGBToYPrime = vec4(0.299, 0.587, 0.114, 0.0);
	const vec4  kRGBToI = vec4(0.596, -0.275, -0.321, 0.0);
	const vec4  kRGBToQ = vec4(0.212, -0.523, 0.311, 0.0);

	// Based on https://github.com/genekogan/Processing-Shader-Examples/blob/master/TextureShaders/data/hue.glsl
	vec4 getYIQC(vec4 color) {
		float YPrime = dot(color, kRGBToYPrime);
    float I = dot(color, kRGBToI);
    float Q = dot(color, kRGBToQ);

    float chroma = sqrt(I * I + Q * Q);

		return vec4(YPrime, I, Q, chroma);
	}

	// Compare colors by light intensity and color intensity
	bool compareColor(vec4 a, vec4 b) {
		vec4 aYIQC = getYIQC(a);
		vec4 bYIQC = getYIQC(b);

		if (aYIQC.x > bYIQC.x) {
			return true;
		}

		if (aYIQC.x == bYIQC.x && aYIQC.w > bYIQC.w) {
			return true;
		}

		return false;
	}

	uniform float uIteration;

	void main() {
		vec2 coord = gl_FragCoord.xy;
		bool checkPrevious = mod(coord.x + uIteration, 2.0) < 1.0;
		vec2 pixel = vec2(-1.0, 0.0) / resolution.xy;

		vec2 uv = coord / resolution.xy;
		vec4 current = texture2D(uTexture, uv);
		vec4 reference = texture2D(uTexture, checkPrevious ? uv - pixel : uv + pixel);

		if (checkPrevious) {
			if (compareColor(reference, current)) {
				gl_FragColor = reference;
				return;
			}
		} else {
			if (compareColor(current, reference)) {
				gl_FragColor = reference;
				return;
			}
		}

		gl_FragColor = current;
	}`;

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

let gpuCompute,
    textureSorted,
    variableSorted;

const initGpuCompute = (initialTextureData = null, dispose = false) => {
    if (dispose) {
        variableSorted.renderTargets.forEach(rt => rt.dispose());
        textureSorted.dispose();
    }

    gpuCompute = new GPUComputationRenderer(gpuComputeTextureSize, gpuComputeTextureSize, renderer);
    textureSorted = gpuCompute.createTexture();

    const rowColors = new Array(gpuComputeTextureSize).fill(0).map((n, i) => ({
        r: (Math.sin(i) * .124 + 1) / 2,
        g: (Math.sin(i + .234) * .563 + 1) / 2,
        b: (Math.sin(i + .988) * .348 + 1) / 2,
    }));

    if (initialTextureData) {
        textureSorted.image.data.set(initialTextureData);
    } else {
        for (let i = 0, channels = 4; i < textureSorted.image.data.length; i += channels) {
            const pixelIndex = Math.floor(i / channels);
            const y = Math.floor(pixelIndex / gpuComputeTextureSize);

            const color = rowColors[(pixelIndex + y * 15838) % rowColors.length];

            textureSorted.image.data[i + 0] = color.r;
            textureSorted.image.data[i + 1] = color.g;
            textureSorted.image.data[i + 2] = color.b;
            textureSorted.image.data[i + 3] = 1;
        }
    }

    variableSorted = gpuCompute.addVariable('uTexture', shaderSortFragment, textureSorted);
    gpuCompute.setVariableDependencies(variableSorted, [variableSorted]);

    const gpuComputeCompileError = gpuCompute.init();

    variableSorted.material.uniforms.uIteration = { value: 0 };

    if (gpuComputeCompileError !== null) {
        console.error(gpuComputeCompileError);
    }
};

const getImageData = (image, size = 1) => {
    const canvas = document.createElement('canvas');
    canvas.height = size;
    canvas.width = size;

    const context = canvas.getContext('2d');
    context.scale(1, -1);
    context.drawImage(image, 0, 0, size, -size);

    return context.getImageData(0, 0, size, size).data;
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

const render = () => {
    gpuCompute.compute();

    const texture = gpuCompute.getCurrentRenderTarget(variableSorted).texture;
    (plane.material as THREE.MaterialMissing).uniforms.uMap.value = texture;
    variableSorted.material.uniforms.uIteration.value++;

    renderer.render(scene, camera);
};

animate(render);
