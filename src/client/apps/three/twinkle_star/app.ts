
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import * as THREE from '../three';
import Stats = require('stats.js');
import dat = require('dat-gui');
import $ = require('jquery');

///////////
// STATS //
///////////
const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.bottom = '0px';
stats.domElement.style.zIndex = '100';
document.body.appendChild(stats.domElement);
// stats.update();

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

//////////
// CODE //
//////////

let _mouseX = 0 , _mouseY = 0;
let _mouseXOnMouseDownx = 0 , _mouseXOnMouseDowny = 0;
let _targetRotationOnMouseDownx = 0 , _targetRotationOnMouseDowny = 0;
let _targetRotationX = 0 , _targetRotationY = 0;
let _windowHalfX;
let _windowHalfY;
let _mesh , _renderer , _loader , _controls , _scene , _camera , _baseTime , _rayMaterial ,
    _Radar , _hearts , _material;
let _mx = 0.5 , _my = 0.5 , _heartsNumber = 50 ,  _mouseDown = false , _clock = new THREE.Clock();
let _json = 'model276_008.json' , _Angle = 0 , _timer = 0 , _scaleSw = false;
$(function(){
    _windowHalfX = window.innerWidth / 2;
    _windowHalfY = window.innerHeight / 2;
    init();
});
function init(){
    _scene = new THREE.Scene();
    _camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    _camera.position.set(0, 10, 20);
    _camera.lookAt({x: 0, y: 0, z: 0 });
    _baseTime = +new Date;
    _hearts = [];
    _material = [];
    let pos = -1000;
    _loader = new THREE.JSONLoader();
    let Lpos = 1000;
    let light1 = new THREE.DirectionalLight( 0xefefff, 0.8 );
    light1.position.set( 0, Lpos, Lpos ).normalize();
    _scene.add( light1 );
    let light2 = new THREE.DirectionalLight( 0xffefef, 0.8 );
    light2.position.set( 0, -Lpos, -Lpos ).normalize();
    _scene.add( light2 );
    _rayMaterial = new THREE.ShaderMaterial({
                               vertexShader: document.getElementById('vertexShader').textContent,
                               fragmentShader: document.getElementById('fragmentShader').textContent,
                               uniforms: {
                                     time: { type: 'f', value: 0 },
                                     mouse: {type: 'v2', value: new THREE.Vector2(0.5, 0.5)},
                                     resolution: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
                               },
                               transparent: false,
                               blending: THREE.NoBlending,
                               depthWrite: false,
                               depthTest: true
                       });
    let geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    let ray = new THREE.Mesh(geometry, _rayMaterial);
    _scene.add( ray );
    _renderer = new THREE.WebGLRenderer({antialias: true});
    _renderer.setSize( window.innerWidth, window.innerHeight );
    _renderer.setClearColor( new THREE.Color(0x555555) );
    document.body.appendChild( _renderer.domElement );
    $(document).bind('mousemove', function(event){
    	_mx = event.clientX / window.innerWidth;
        _my = 1.0 - event.clientY / window.innerHeight;
    });
    animate();
}

function animate(){
    requestAnimationFrame( animate );
    _rayMaterial.uniforms.time.value = (+new Date - _baseTime) / 1000;
    _rayMaterial.uniforms.mouse.value = new THREE.Vector2(_mx, _my);
    _renderer.render( _scene, _camera );
}
