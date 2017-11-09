
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/clindsey/pen/zdYVNR

import * as THREE from '../three';

setTimeout(() => {
    const loader = new THREE.JSONLoader()
    loader.crossOrigin = 'Anonymous'
    const mobiusRot = new MobiusRot(3, 291, 100, 31, 5) // tileSize, ringSize, radius, layers, twists
    new Simulation('js-app', [mobiusRot], 0, 0, -320)
}, 0);

class MobiusRot extends THREE.Mesh {
    static createMaterial(radius, size) {
        return new THREE.BAS.BasicAnimationMaterial({
            shading: THREE.FlatShading,
            side: THREE.FrontSide,
            uniforms: {
                uTime: { value: 0 },
                uRadius: { value: radius * 2 },
                uSpacing: { value: new THREE.Vector3(size * 2, size * 2, size * 2) }
            },
            uniformValues: {},
            varyingParameters: [
                'varying vec3 vColor;'
            ],
            vertexFunctions: [
                THREE.BAS.ShaderChunk['quaternion_rotation']
            ],
            vertexParameters: [
                'uniform float uTime;',
                'uniform float uRadius;',
                'uniform vec3 uSpacing;',
                'attribute vec4 aRotation;',
                'attribute vec3 aVOffset;',
                'attribute vec4 aTwist;',
                'attribute vec4 aOrient;',
                'attribute vec3 aColor;'
            ],
            vertexInit: [
                'float timeScale = 0.333;',
                'float seed = 5625463739.0;',
                'float time = (uTime * timeScale);',
                'vec4 tQuatRotation = quatFromAxisAngle(aRotation.xyz, aRotation.w + time);',
                'vec4 tQuatOrient = quatFromAxisAngle(aOrient.xyz, aOrient.w + time);',
                'vec4 tQuatTwist = quatFromAxisAngle(aTwist.xyz, aTwist.w + time);'
            ],
            vertexNormal: [],
            vertexPosition: [
                'transformed += aVOffset * uSpacing;', // stack tiles into a column
                'transformed = rotateVector(tQuatTwist, transformed);', // twist columns
                'transformed = rotateVector(tQuatOrient, transformed);', // rotate column faces inwards
                'transformed += rotateVector(tQuatRotation, vec3(uRadius, 0.0, 0.0));' // place columns in a large circle
            ],
            vertexColor: [
                'vColor = aColor;'
            ],
            fragmentFunctions: [],
            fragmentParameters: [],
            fragmentInit: [],
            fragmentMap: [],
            fragmentDiffuse: [
                'diffuseColor.xyz = vColor;'
            ]
        });
    }

    static assignProps(geometry, prefabCount, radius, layers, twists, verticalSpacing) {
        const aRotation = geometry.createAttribute('aRotation', 4);
        const aColor = geometry.createAttribute('aColor', 3);
        const aVOffset = geometry.createAttribute('aVOffset', 3);
        const aTwist = geometry.createAttribute('aTwist', 4);
        const aOrient = geometry.createAttribute('aOrient', 4);
        const ringSize = prefabCount / layers;
        for (let i = 0; i < prefabCount; i++) {
            const y = Math.floor(i / ringSize);
            const x = i % ringSize;
            const range = Math.PI * 2;
            const theta = THREE.Math.mapLinear(x, 0, ringSize, -range / 2, range / 2);
            const w = (theta / 2) * twists;
            // place tiles in circle
            const position = new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta));
            geometry.setPrefabData(aRotation, i, [0, 1, 0, theta]);
            // stack the tiles vertically into columns
            const verticalOffset = new THREE.Vector3(0, (Math.ceil(y / 2) * (y % 2 ? 1 : -1)) / layers, 0);
            geometry.setPrefabData(aVOffset, i, verticalOffset.toArray());
            // set lean
            geometry.setPrefabData(aTwist, i, [0, 0, 1, w]);
            // set orient
            geometry.setPrefabData(aOrient, i, [0, 1, 0, theta]);
            const color = new THREE.Color();
            color.setHSL((theta + Math.PI) / (Math.PI * 2), 1.0, 0.5);
            geometry.setPrefabData(aColor, i, color.toArray());
        }
    }

    material: THREE.BAS.BasicAnimationMaterial;
    constructor(size, tileCount, radius, layers, twists) {
        const prefabCount = tileCount * layers;
        const boxGeometry = new THREE.BoxGeometry(size, size, size);
        const geometry = new THREE.BAS.PrefabBufferGeometry(boxGeometry, prefabCount);
        geometry.computeVertexNormals();
        geometry.bufferUvs();
        MobiusRot.assignProps(geometry, prefabCount, radius, layers, twists, size);
        const material = MobiusRot.createMaterial(radius, size * layers);
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
    constructor(domId, entities, x = 0, y = 0, z = 0) {
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
        this.animate(composer, renderer, scene, camera, controls, entities, +(new Date()));
    }

    addControls(camera: THREE.PerspectiveCamera, target) {
        const controls = new THREE.OrbitControls(camera);
        controls.target = target;
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.rotateSpeed = 0.1;
        return controls;
    }

    createComposerAndEffects(scene, camera, renderer) {
        const effects: any = {};
        const renderScene = new THREE.RenderPass(scene, camera);
        effects.fxaa = new THREE.ShaderPass(THREE.FXAAShader);
        effects.fxaa.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);
        effects.copy = new THREE.ShaderPass(THREE.CopyShader);
        effects.copy.renderToScreen = true;
        const strength = 0.5;
        const radius = 2.6;
        const threshold = 0.05;
        effects.bloom = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), strength, radius, threshold);
        effects.film = new THREE.ShaderPass(THREE.FilmShader);
        const composer = new THREE.EffectComposer(renderer);
        composer.setSize(window.innerWidth, window.innerHeight);
        composer.addPass(renderScene);
        // composer.addPass(effects.film)
        composer.addPass(effects.fxaa);
        composer.addPass(effects.bloom);
        composer.addPass(effects.copy);
        renderer.gammaInput = false;
        renderer.gammaOutput = true;
        return {
            composer,
            effects
        };
    }

    onWindowResize(camera, renderer, composer, effects) {
        return (event?) => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            composer.setSize(width, height);
            effects.fxaa.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);
        };
    }

    animate(composer, renderer, scene, camera, controls, entities, lastTime) {
        const currentTime = +(new Date());
        const timeDelta = currentTime - lastTime;
        entities.forEach(e => e.time += timeDelta / 1000);
        requestAnimationFrame(() => {
            this.animate(composer, renderer, scene, camera, controls, entities, currentTime);
        });
        controls.update();
        composer.render();
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
            antialias: true,
            alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.LinearToneMapping;
        renderer.autoClear = true;
        renderer.setClearColor(clearColor, 0);
        return renderer;
    }
}
