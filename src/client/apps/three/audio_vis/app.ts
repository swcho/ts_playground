
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import * as THREE from '../three';
import * as dat from 'dat-gui';

declare global {
    const SimplexNoise;

    interface HTMLInputElement extends HTMLElement {
        onchange: (this: HTMLInputElement, ev: Event) => any;
    }
}

// initialise simplex noise (replace with perlin noise in future if needed)
let noise = new SimplexNoise();
let context: AudioContext;

let vizInit = function () {

    let file = document.getElementById('thefile') as HTMLInputElement;
    let audio = document.getElementById('audio') as HTMLAudioElement;
    let fileLabel = document.querySelector('label.file');

    file.onchange = function () {
        fileLabel.classList.add('normal');
        audio.classList.add('active');
        let files = this.files;
        audio.src = URL.createObjectURL(files[0]);
        audio.load();
        audio.play();
        let context = new AudioContext();
        let src = context.createMediaElementSource(audio);
        let analyser = context.createAnalyser();
        src.connect(analyser);
        analyser.connect(context.destination);
        analyser.fftSize = 512;
        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);

        // here comes the webgl
        let scene = new THREE.Scene();
        let group = new THREE.Group();
        let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 100);
        camera.lookAt(scene.position);
        scene.add(camera);

        let renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        let planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);
        let planeMaterial = new THREE.MeshLambertMaterial({
            color: 0x6904ce,
            side: THREE.DoubleSide,
            wireframe: true
        });

        let plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -0.5 * Math.PI;
        plane.position.set(0, 30, 0);
        group.add(plane);

        let plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
        plane2.rotation.x = -0.5 * Math.PI;
        plane2.position.set(0, -30, 0);
        group.add(plane2);

        let icosahedronGeometry = new THREE.IcosahedronGeometry(10, 4);
        let lambertMaterial = new THREE.MeshLambertMaterial({
            color: 0xff00ee,
            wireframe: true
        });

        let ball = new THREE.Mesh<THREE.MeshLambertMaterial, THREE.IcosahedronGeometry>(icosahedronGeometry, lambertMaterial);
        ball.position.set(0, 0, 0);
        group.add(ball);

        let ambientLight = new THREE.AmbientLight(0xaaaaaa);
        scene.add(ambientLight);

        let spotLight = new THREE.SpotLight(0xffffff);
        spotLight.intensity = 0.9;
        spotLight.position.set(-10, 40, 20);
        spotLight.lookAt(ball.position);
        spotLight.castShadow = true;
        scene.add(spotLight);

        let orbitControls = new THREE.OrbitControls(camera);
        orbitControls.autoRotate = true;

        let gui = new dat.GUI();
        let guiControls = new function () {
            this.amp = 1.8;
            this.wireframe = true;
        }();

        gui.add(guiControls, 'amp', 0, ball.geometry.parameters.radius - 1);
        gui.add(guiControls, 'wireframe').onChange(function (e) {
            ball.material.wireframe = e;
        });

        scene.add(group);

        document.getElementById('out').appendChild(renderer.domElement);

        window.addEventListener('resize', onWindowResize, false);

        render();

        function render() {
            analyser.getByteFrequencyData(dataArray);

            let lowerHalfArray = dataArray.slice(0, (dataArray.length / 2) - 1);
            let upperHalfArray = dataArray.slice((dataArray.length / 2) - 1, dataArray.length - 1);

            let overallAvg = avg(dataArray);
            let lowerMax = max(lowerHalfArray);
            let lowerAvg = avg(lowerHalfArray);
            let upperMax = max(upperHalfArray);
            let upperAvg = avg(upperHalfArray);

            let lowerMaxFr = lowerMax / lowerHalfArray.length;
            let lowerAvgFr = lowerAvg / lowerHalfArray.length;
            let upperMaxFr = upperMax / upperHalfArray.length;
            let upperAvgFr = upperAvg / upperHalfArray.length;

            ball.rotation.y += 0.008;
            ball.rotation.x += 0.009;

            makeRoughGround(plane, modulate(upperAvgFr, 0, 1, 0.5, 4));
            makeRoughGround(plane2, modulate(lowerMaxFr, 0, 1, 0.5, 4));
            makeRoughBall(ball, modulate(Math.pow(lowerMaxFr, 0.5), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));

            group.rotation.y += 0.005;
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function makeRoughBall(mesh, bassFr, treFr) {
            mesh.geometry.vertices.forEach(function (vertex, i) {
                let offset = mesh.geometry.parameters.radius;
                let amp = guiControls.amp;
                let time = Date.now();
                vertex.normalize();
                let distance = (offset + bassFr) + noise.noise3D(vertex.x + time * 0.00007, vertex.y + time * 0.00008, vertex.z + time * 0.00009) * amp * treFr;
                vertex.multiplyScalar(distance);
            });
            mesh.geometry.verticesNeedUpdate = true;
            mesh.geometry.normalsNeedUpdate = true;
            mesh.geometry.computeVertexNormals();
            mesh.geometry.computeFaceNormals();
        }

        function makeRoughGround(mesh, distortionFr) {
            mesh.geometry.vertices.forEach(function (vertex, i) {
                let amp = 2;
                let time = Date.now();
                let distance = (noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
                vertex.z = distance;
            });
            mesh.geometry.verticesNeedUpdate = true;
            mesh.geometry.normalsNeedUpdate = true;
            mesh.geometry.computeVertexNormals();
            mesh.geometry.computeFaceNormals();
        }

        audio.play();
    };
};

window.onload = vizInit;

document.body.addEventListener('touchend', function (ev) { context.resume(); });

// some helper functions here
function fractionate(val, minVal, maxVal) {
    return (val - minVal) / (maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
    let fr = fractionate(val, minVal, maxVal);
    let delta = outMax - outMin;
    return outMin + (fr * delta);
}

function avg(arr) {
    let total = arr.reduce(function (sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr) {
    return arr.reduce(function (a, b) { return Math.max(a, b); });
}

// todos
// customize the audio controls
// provide mic input support
// change the background color based on the audio
// display song name inside the vizualization
// implement the same with Perlin noise
