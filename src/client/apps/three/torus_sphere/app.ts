
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/mnmxmx/pen/BdjdMz

import * as THREE from '../three';
import dat = require('dat-gui');
const CONFIG = {
    wireframe: false,
    uMove: false,
    uSphere: true,
    uMobius: false,
    uRotation: false,
    uShapeRatio: 0.5,
};

let gui = new dat.GUI();
gui.add(CONFIG, 'wireframe');
gui.add(CONFIG, 'uMove');
gui.add(CONFIG, 'uSphere');
gui.add(CONFIG, 'uMobius');
gui.add(CONFIG, 'uRotation');
gui.add(CONFIG, 'uShapeRatio', -1, 2).step(0.1);

window.onload = () => {
    let webgl = new Webgl();
    window.onresize = () => {
        webgl.resize();
    };
};

class Webgl {

    vertShader: string;
    fragShader: string;

    constructor() {
        this.vertShader = require('./vert.1.glsl');
        this.fragShader = require('./frag.glsl');

        this.setProps();

        this.init();
    }

    scene: THREE.Scene;
    shaderMaterial: THREE.ShaderMaterial;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private div: HTMLDivElement;
    private obj: Obj;
    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.props.width / this.props.height, this.props.near, this.props.far);
        this.camera.position.set(10, -10, 10);
        this.camera.lookAt(this.scene.position);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        this.renderer.setPixelRatio(1.5);

        this.renderer.setClearColor(0xb7d3dc, 0.3);
        this.renderer.setSize(this.props.width, this.props.height);

        this.div = document.getElementById('wrapper') as HTMLDivElement;
        this.div.appendChild(this.renderer.domElement);

        this.obj = new Obj(this);

        this.render();

        let control = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    }

    private props: {
        width: number;
        height: number;
        aspect: number;
        left: number;
        right: number;
        top: number;
        bottom: number;
        near: number;
        far: number;
    };
    setProps() {
        let width = document.body.clientWidth;
        let height = window.innerHeight;
        let aspect = width / height;

        this.props = {
            width: width,
            height: height,
            aspect: aspect,
            left: -width / 2,
            right: width / 2,
            top: height / 2,
            bottom: -height / 2,
            near: 0.1,
            far: 10000
        };
    }

    resize() {
        this.setProps();
        this.renderer.setSize(this.props.width, this.props.height);

        this.camera.aspect = this.props.width / this.props.height;
        this.camera.updateProjectionMatrix();
    }

    render() {
        this.obj.uniforms.uTick.value += 1;
        this.obj.uniforms.uMove.value = CONFIG.uMove;
        this.obj.uniforms.uSphere.value = CONFIG.uSphere;
        this.obj.uniforms.uMobius.value = CONFIG.uMobius;
        this.obj.uniforms.uRotation.value = CONFIG.uRotation;
        this.obj.uniforms.uShapeRatio.value = CONFIG.uShapeRatio;

        this.shaderMaterial.wireframe = CONFIG.wireframe;
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    };
}


class Obj {
    private webgl: Webgl;
    constructor(webgl: Webgl) {
        this.webgl = webgl;
        this.init();
    }

    paramFunc(u: number, v: number, p: THREE.Vector3) {
        return new THREE.Vector3(0, 0, 0);
        // return new THREE.Vector3(v, u, 0);
        // return p;
    }

    uniforms;
    init() {
        let g = new THREE.ParametricBufferGeometry(this.paramFunc, 100, 100);
        // let g = new THREE.ParametricBufferGeometry(this.paramFunc, 10, 10);

        // const uvArray = [];

        // for(let i = 0; i < 100; i++){
        //   var _u = i / 99;
        //   for(let j = 0; j < 100; j++){
        //     var _v = j / 99;
        //     uvArray.push(_u, _v);
        //   }
        // }

        this.uniforms = {
            uTick: { type: 'f', value: 0 },
            uMove: { value: false },
            uSphere: { value: true },
            uMobius: { value: false },
            uRotation: { value: false },
            uShapeRatio: { value: 0.5 },
        };

        let m = new THREE.ShaderMaterial({
            vertexShader: this.webgl.vertShader,
            fragmentShader: this.webgl.fragShader,
            uniforms: this.uniforms,
            side: THREE.DoubleSide,
            shading: THREE.FlatShading,
            // wireframe: true
        });

        let mesh = new THREE.Mesh(g, m);
        this.webgl.scene.add(mesh);
        this.webgl.shaderMaterial = m;
    }
}
