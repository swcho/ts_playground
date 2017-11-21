
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/clindsey/pen/PjLEdN

import * as THREE from '../../three/three';
import {GeoGenPattern} from './geogenpattern';
import {GeoGenTilemap, TileFinder} from './geogentilemap';
import {alea} from './alea';

const tileSize = 4;
const seed = 5625463739; // + +(new Date());

function sampleFn(index: number, x: number, y: number, seed: number) {
    console.log(index, x, y, seed);
    return alea(index)();
}

// length 16
const tileColors = [
    '#000',
    '#000',
    '#000',
    '#000',
    '#000',
    '#000',
    '#000',
    '#000',
    '#000',
    '#ff0',
    '#000',
    '#000',
    '#000',
    '#000',
    '#000',
    '#000'
];

const worldOptions = {
    chunkTileHeight: tileColors.length * 4,
    chunkTileWidth: tileColors.length * 4,
    maxHeight: tileColors.length * 2,
    worldChunkHeight: 4,
    worldChunkWidth: 4
};

function testTexture() {
    return new Promise<HTMLCanvasElement>((resolve, reject) => {
        const canvasEl = document.createElement('canvas');
        const ctx = canvasEl.getContext('2d');
        const img = new Image();
        img.src = require('./album.jpg');
        img.onload = () => {
            console.log('image loaded');
            const width = worldOptions.worldChunkWidth * worldOptions.chunkTileWidth;
            const height = worldOptions.worldChunkHeight * worldOptions.chunkTileHeight;
            canvasEl.width = width * tileSize;
            canvasEl.height = height * tileSize;
            ctx.drawImage(img, 0, 0);
            resolve(canvasEl);
        };
        img.onerror = (err) => reject(err);
    });
}

function ImageTexture (tilemap: GeoGenTilemap, tileFinder: TileFinder, tileSize, worldOptions) {
    const canvasEl = document.createElement('canvas');
    const width = worldOptions.worldChunkWidth * worldOptions.chunkTileWidth;
    const height = worldOptions.worldChunkHeight * worldOptions.chunkTileHeight;
    canvasEl.width = width * tileSize;
    canvasEl.height = height * tileSize;
    const tileCtx = canvasEl.getContext('2d');
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const [
                col,
                row
            ] = tileFinder(x, y);
            tileCtx.drawImage(tilemap.tileLibrary[row][col], 0, 0, tileSize, tileSize, x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
    return canvasEl;
}

class Simulation {
    constructor(domId, textureEl: HTMLCanvasElement, boatGroup) {
        const camera = this.createCamera(80, 8, 16, -16, window.innerWidth, window.innerHeight);
        camera['target'] = new THREE.Vector3(0, 0, 0);
        camera.lookAt(camera['target']);
        const scene = new THREE.Scene();
        this.createLights(scene);
        const renderer = this.createRenderer(0x666666);
        document.getElementById(domId).appendChild(renderer.domElement);
        const handleWindowResize = this.onWindowResize(camera, renderer);
        handleWindowResize();
        window.addEventListener('resize', handleWindowResize, false);
        const ocean = new Ocean(textureEl);
        scene.add(ocean);
        const boat = boatGroup; // new Boat()
        scene.add(boat);
        const controls = new THREE.OrbitControls(camera);
        controls.target = camera['target'];
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.rotateSpeed = 0.1;
        this.animate(renderer, scene, camera, controls, [boatGroup, ocean], +(new Date()));
    }

    onWindowResize(camera, renderer) {
        return (event?) => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
    }

    animate(renderer, scene, camera, controls, entities, lastTime) {
        const boatGroup = entities[0];
        const ocean = entities[1];
        const currentTime = +(new Date());
        const timeDelta = currentTime - lastTime;
        entities.forEach(e => e.time += timeDelta / 1000);
        requestAnimationFrame(() => {
            this.animate(renderer, scene, camera, controls, entities, currentTime);
        });
        const t = (currentTime / (1000 * 30)) % 1;
        const a = (Math.PI * 2) * t;
        const r = 3;
        boatGroup.rotation.y = -a + Math.PI;
        ocean.offset = [Math.sin(a) * r, Math.cos(a) * r];
        controls.update();
        renderer.render(scene, camera);
    }

    createCamera(fov, x = 0, y = 0, z = 0, width, height) {
        const camera = new THREE.PerspectiveCamera(fov, width / height, 1, 1000);
        camera.position.x = x;
        camera.position.y = y;
        camera.position.z = z;
        return camera;
    }

    createLights(scene) {
        const light = new THREE.DirectionalLight();
        light.position.set(0, 1, 1);
        scene.add(light);
    }

    createRenderer(clearColor = 0x000000) {
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.autoClear = false;
        renderer.setClearColor(clearColor, 0);
        return renderer;
    }
}

class Boat extends THREE.Mesh {
    static createMaterial() {
        return new THREE.BAS.BasicAnimationMaterial({
            shading: THREE.SmoothShading,
            side: THREE.DoubleSide,
            uniforms: {
                uTime: { value: 0 }
            },
            varyingParameters: [],
            vertexFunctions: [],
            vertexParameters: [],
            vertexInit: [],
            vertexNormal: [],
            vertexPosition: [],
            vertexColor: [],
            fragmentFunctions: [],
            fragmentParameters: [],
            fragmentInit: [],
            fragmentMap: [],
            fragmentDiffuse: []
        });
    }

    constructor() {
        const icosahedron = new THREE.IcosahedronGeometry(2, 2);
        const geometry = new THREE.BAS.ModelBufferGeometry(icosahedron);
        const material = Boat.createMaterial();
        super(geometry, material);
    }
}

class Ocean extends THREE.Mesh {
    static createMaterial(texture: THREE.Texture) {
        return new THREE.BAS.BasicAnimationMaterial({
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            uniforms: {
                uTime: { value: 0 },
                seed: { value: 5625463739 },
                uVertexScale: { value: 10 },
                uFragmentScale: { value: 4 },
                uColor: { value: new THREE.Color('#0051da') },
                uOffset: { value: new THREE.Vector2(0, 0) }
            },
            uniformValues: {
                map: texture
            },
            varyingParameters: [],
            vertexFunctions: [],
            vertexParameters: [
                'uniform float uTime;',
                'uniform float uVertexScale;',
                `
          float calculateSurface(float x, float z) {
              float y = 0.0;
              y += (sin(x * 1.0 / uVertexScale + uTime * 1.0) + sin(x * 2.3 / uVertexScale + uTime * 1.5) + sin(x * 3.3 / uVertexScale + uTime * 0.4)) / 3.0;
              y += (sin(z * 0.2 / uVertexScale + uTime * 1.8) + sin(z * 1.8 / uVertexScale + uTime * 1.8) + sin(z * 2.8 / uVertexScale + uTime * 0.8)) / 3.0;
              return y;
          }
        `
            ],
            vertexInit: [],
            vertexNormal: [],
            vertexPosition: [
                `
          vec3 pos = position;
          float strength = 1.0;
          pos.y += strength * calculateSurface(pos.x, pos.z);
          pos.y -= strength * calculateSurface(0.0, 0.0);
          transformed = pos;
        `
            ],
            vertexColor: [],
            fragmentFunctions: [],
            fragmentParameters: [
                'uniform float uTime;',
                'uniform float uFragmentScale;',
                'uniform vec2 uOffset;',
                'uniform vec3 uColor;'
            ],
            fragmentInit: [],
            fragmentMap: ['// this comment needs to be here'],
            fragmentDiffuse: [
                `
          vec2 uv = vUv * uFragmentScale + uOffset; // vec2(uTime * -0.02);
          uv.y += 0.01 * (sin(uv.x * 3.5 + uTime * 0.35) + sin(uv.x * 4.8 + uTime * 1.05) + sin(uv.x * 7.3 + uTime * 0.45)) / 3.0;
          uv.x += 0.12 * (sin(uv.y * 4.0 + uTime * 0.5) + sin(uv.y * 6.8 + uTime * 0.75) + sin(uv.y * 11.3 + uTime * 0.2)) / 3.0;
          uv.y += 0.12 * (sin(uv.x * 4.2 + uTime * 0.64) + sin(uv.x * 6.3 + uTime * 1.65) + sin(uv.x * 8.2 + uTime * 0.45)) / 3.0;
          vec4 tex1 = texture2D(map, uv * 1.0);
          vec4 tex2 = texture2D(map, uv * 1.0 + vec2(0.2));
        //   vec3 blue = uColor;
        //   diffuseColor = vec4(blue + vec3(tex1.r * 0.9 - tex2.g * 0.04), 1.0);
          diffuseColor = vec4(vec3(tex1.r * 0.9 - tex2.g * 0.04), 1.0);
        `
            ]
        });
    }

    constructor(textureEl: HTMLCanvasElement) {
        const {
            width,
            height
        } = textureEl;
        const w = width / 18;
        const h = height / 18;
        const plane = new THREE.PlaneGeometry(w, h, w / 2, h / 2);
        const geometry = new THREE.BAS.ModelBufferGeometry(plane);
        geometry.bufferUVs();
        geometry.rotateX(-Math.PI / 2);
        const texture = new THREE.Texture();
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.NearestFilter;
        const material = Ocean.createMaterial(texture);
        super(geometry, material);
        this.frustumCulled = false;
        this.setImage(textureEl);
    }

    getMaterial() {
        return this.material as THREE.BAS.BasicAnimationMaterial;
    }

    get time() {
        return this.getMaterial().uniforms.uTime.value;
    }

    set time(newTime) {
        this.getMaterial().uniforms.uTime.value = newTime;
    }

    get offset() {
        return this.getMaterial().uniforms.uOffset.value;
    }

    set offset([vX, vY]) {
        this.getMaterial().uniforms.uOffset.value = new THREE.Vector2(vX, vY);
    }

    setImage(image) {
        this.getMaterial().uniforms.map.value.image = image;
        this.getMaterial().uniforms.map.value.needsUpdate = true;
    }
}

setTimeout(async () => {
    const worldGenerator = new GeoGenPattern(sampleFn, seed, worldOptions);
    const tilemap = new GeoGenTilemap(tileSize, tileColors);
    const tileFinder = tilemap.tilePositionFinder(worldGenerator.tileCache);
    const textureEl = await testTexture();
    // const textureEl = ImageTexture(tilemap, tileFinder, tileSize, worldOptions);
    console.log(textureEl);
    const loader = new THREE.OBJLoader();
    // DEPRECATED FIND Proper API
    // loader.crossOrigin = 'Anonymous';
    loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/292951/Cannoe.obj', boatGroup => {
        const pivot = new THREE.Group();
        boatGroup.position.x = -3;
        boatGroup.position.y = -2.25;
        boatGroup.position.z = -1.5;
        pivot.add(boatGroup);
        new Simulation('js-app', textureEl, pivot);
    });
}, 0);
