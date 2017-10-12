
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// ref: https://codepen.io/calvrix/pen/RgvvWK
import * as THREE from '../../three/three';
import * as $ from 'jquery';

(function () {
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    window['THREE'] = THREE;
    window['scene'] = scene;

    let renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('webGLwrapper').appendChild(renderer.domElement);
    let warp = false;
    window.setTimeout(function () {
        warp = true;
    }, 2000);

    let light = new THREE.AmbientLight(0xFFFFFF, .75); // soft white light
    scene.add(light);

    let pointLight = new THREE.PointLight(0xffffff, 1, 50);
    pointLight.position.set(0, 10, 0);
    pointLight.castShadow = true;
    // pointLight.shadowCameraVisible = true;
    scene.add(pointLight);

    const particleSystem = createParticleSystem();
    scene.add(particleSystem);
    let time = 0.0;
    let target = 10.0;
    let distance = 10;
    let assignedposition = 2;
    camera.position.z = assignedposition;
    let frame;
    const pendingBlow = { x: 0.0, y: 0.0 };
    camera.up = new THREE.Vector3(0, 1, 0);
    let animating;
    let animate = function () {
        frame = requestAnimationFrame(animate);
        animating = false;
        if (warp) {
            animating = true;
            time += (target - time) / 25;
        }
        (particleSystem.material as THREE.ShaderMaterial).uniforms.time.value = time;

        (particleSystem.material as THREE.ShaderMaterial).uniforms.mx.value += (pendingBlow.x - (particleSystem.material as THREE.ShaderMaterial).uniforms.mx.value) / 100;
        (particleSystem.material as THREE.ShaderMaterial).uniforms.my.value += (pendingBlow.y - (particleSystem.material as THREE.ShaderMaterial).uniforms.my.value) / 100;
        $('.frame').text('' + frame);
        $('.animating').text('' + animating);
        $('.distance').text('' + distance);
        $('.time').text('' + time);
        $('.target').text('' + target);
        $('.mx').text('' + (particleSystem.material as THREE.ShaderMaterial).uniforms.mx.value);
        $('.my').text('' + (particleSystem.material as THREE.ShaderMaterial).uniforms.my.value);
        $('.pendingBlowX').text('' + pendingBlow.x);
        $('.pendingBlowY').text('' + pendingBlow.y);
        // camera.position.z = distance;
        // camera.lookAt(new THREE.Vector3(0, 0, 0));
        // distance += (assignedposition - distance) / 100;
        renderer.render(scene, camera);
    };

    animate();
    document.onclick = function (e) {
        if (animating)
            target += 5.0;
        else {
            time = 0.0;
            target = 10.0;
        };
    };
    document.onmousemove = function (e) {
        pendingBlow.x = (e.pageX - window.innerWidth / 2) / window.innerWidth;
        pendingBlow.y = (e.pageY - window.innerHeight / 2) / window.innerHeight;
    };
})();

function createParticleSystem() {

    let icosa = new THREE.PlaneBufferGeometry(2, 2, 100, 100);
    // let icosa = new THREE.PlaneGeometry(1.0, 1.0);
    let vertexShader = `
        varying vec3 pos;
        float posY;
        uniform float radius;
        uniform float time;
        uniform float mx;
        uniform float my;
        void main() {
            // pos = position + normal * vec3(sin(time * 0.2) * 3.0);
            pos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
        `;

    // http://www.aclockworkberry.com/shader-derivative-functions/
    let fragmentShader = `#extension GL_OES_standard_derivatives : enable
        varying vec3 pos;
        uniform float time;
        uniform sampler2D texture;
        uniform float mx;
        uniform float my;
        float dProd;
        uniform vec3 highlight;
        uniform vec3 shadow;
        uniform vec3 light;
        float rand(float n)
        {
            return fract(sin(n) * 43758.5453123);
        }
        void main() {
            vec3 N = normalize( cross( dFdx( pos.xyz ), dFdy( pos.xyz ) ) );
            float level = max(0.0, pow(2.71, -0.1 * distance(pos, light)) * dot(normalize(N), normalize(light)));
            vec3 col = (highlight * level + (1.0 - level) * shadow) / (level + 1.0);
            gl_FragColor = vec4(col,1.0);
        }
        `;

    let uniforms = THREE.UniformsUtils.merge([
        THREE.UniformsLib['ambient'],
        THREE.UniformsLib['lights'], {
            time: { type: 'f', value: 1.0 },
            radius: { type: 'f', value: 1.0 },
            light: { type: 'v3', value: [1.0, 0.0, 4.0] },
            highlight: { type: 'v3', value: [1.0, 0.0, 0.0] },
            shadow: { type: 'v3', value: [0.0, 0.0, 1.0] },
            mx: { type: 'f', value: 0.0 },
            my: { type: 'f', value: 0.0 }
        }
    ]);

    // Create the material that will be used to render each vertex of the geometry
    let particleMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });
    // var particleMaterial = new THREE.MeshPhongMaterial(0xFF0000);

    // Create the particle system
    const particleSystem = new THREE.Mesh(icosa, particleMaterial);
    return particleSystem;
}

