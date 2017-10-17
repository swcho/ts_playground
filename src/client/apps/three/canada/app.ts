
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/Mamboleoo/pen/EXbXQe

import * as THREE from '../three';
import {TweenMax, TimelineMax, Power0, Elastic, Back} from 'gsap';

console.clear();

let ww = window.innerWidth,
    wh = window.innerHeight;

let renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas')
});
renderer.setSize(ww, wh);
renderer.setClearColor(0x9eecff);

let scene = new THREE.Scene();

window['THREE'] = THREE;
window['scene'] = scene;

let camera = new THREE.PerspectiveCamera(45, ww / wh, 0.1, 10000);
camera.position.z = 1500;
// var controls = new THREE.TrackballControls(camera);

let items = new THREE.Object3D();
scene.add(items);
TweenMax.to(items.rotation, 1, {
    y: -Math.PI / 2,
    // repeat: -1,
    ease: Power0.easeNone
} as any);

let tl = new TimelineMax({
    // repeat: -1,
    repeatDelay: 2
});

let svgs = [].slice.call(document.querySelectorAll('.canada g'));
svgs.forEach(addSVG);

function addSVG(svg, i) {
    // let mat = new THREE.MeshBasicMaterial({
    //     vertexColors: THREE.FaceColors,
    //     side: THREE.DoubleSide
    // });

    let polygons: SVGPolygonElement[] = svg.querySelectorAll('polygon');
    let z = parseFloat(svg.getAttribute('z')) || 0;
    // let geometry = new THREE.Geometry();
    let group = new THREE.Object3D();
    let speed = Math.random() * 2 + 2;
    let isLetter = svg.getAttribute('id').indexOf('letter') === 0;
    items.add(group);
    polygons.forEach(function (polygon, index) {
        if (polygon.getAttribute('z')) {
            z = parseFloat(polygon.getAttribute('z'));
        }
        const points = polygon.getAttribute('points');
        const path = points.split(' ').map(Number);
        let styles = window.getComputedStyle(polygon);
        let color = new THREE.Color(styles.fill);
        // Check more top & left
        let v1 = new THREE.Vector3(path[0], path[1]);
        let v2 = new THREE.Vector3(path[2], path[3]);
        let v3 = new THREE.Vector3(path[4], path[5]);

        let shape = new THREE.Shape();
        shape.moveTo(v1.x - 1125 * 0.5, -v1.y + 642.9 * 0.5);
        shape.lineTo(v2.x - 1125 * 0.5, -v2.y + 642.9 * 0.5);
        shape.lineTo(v3.x - 1125 * 0.5, -v3.y + 642.9 * 0.5);

        let extrudeSettings = {
            steps: 2,
            amount: 40,
            bevelEnabled: false
        };

        // https://threejs.org/docs/#api/geometries/ExtrudeGeometry
        let geomExtrue = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        let material = new THREE.MeshBasicMaterial({ color: color, transparent: true } as any);
        let mesh = new THREE.Mesh(geomExtrue, material);
        tl.from(mesh.material, speed, {
            opacity: 0,
            delay: i / 4
        }, 0);
        mesh.position.z = z * 10;
        group.add(mesh);
    });

    if (isLetter) {
        tl.from(group.scale, 4, {
            x: 0.001,
            y: 0.001,
            z: 0.001,
            ease: Elastic.easeOut.config(1, 0.2),
            delay: (i - 10) / 10
        }, 5);
        tl.from(group.rotation, 4, {
            z: Math.PI * 0.5,
            y: Math.PI * 0.5,
            ease: Elastic.easeOut.config(0.8, 0.2),
            delay: (i - 10) / 10
        }, 5);
    } else {
        tl.from(group.position, speed, {
            x: (Math.random() - 0.5) * 1000,
            z: (Math.random() - 0.5) * 1000,
            ease: Back.easeOut,
            delay: i / 4
        }, 0);
        tl.from(group.rotation, speed, {
            x: (Math.random() - 0.5) * Math.PI * 4,
            z: (Math.random() - 0.5) * Math.PI * 4,
            ease: Back.easeOut,
            delay: i / 4
        }, 0);
    }

}

window.addEventListener('resize', onResize);

function onResize() {
    ww = window.innerWidth;
    wh = window.innerHeight;
    camera.aspect = ww / wh;
    camera.updateProjectionMatrix();
    renderer.setSize(ww, wh);
}

function render() {
    // controls.update();

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}
requestAnimationFrame(render);
