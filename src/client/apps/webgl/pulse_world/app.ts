
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import {mat4} from 'gl-matrix';

var canvas = document.getElementById('display') as HTMLCanvasElement;
var gl = canvas.getContext('webgl', { depth: true, antialias: true, alpha: false });

var w, h;
var resize = function () {
    w = canvas.width = window.innerWidth - 5;
    h = canvas.height = window.innerHeight - 5;
    gl.viewport(0, 0, w, h);
};
resize();
window.addEventListener('resize', resize);

// set up instanced drawing extension
var instanced = gl.getExtension('ANGLE_instanced_arrays');
if (instanced === null) {
    throw "Missing ANGLE_instanced_arrays extension";
}

function compileShader(vertid, fragid) {
    var vshader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vshader, document.getElementById(vertid).innerHTML);
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
        console.log('bad vertex shader', gl.getShaderInfoLog(vshader));
    }
    var fshader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, document.getElementById(fragid).innerHTML);
    gl.compileShader(fshader);
    if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
        console.log('bad fragment shader', gl.getShaderInfoLog(fshader));
    }

    var prog = gl.createProgram();
    gl.attachShader(prog, vshader);
    gl.attachShader(prog, fshader);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.log('couldnt link shaders', gl.getProgramInfoLog(prog));
    }

    return prog;
}

var sprog = compileShader('vert', 'frag');

// yes this could be indexed by an element array to cut 12 rows.
// not necessary, imo.
var cubevertices = new Float32Array([
    // +Y face
    // 0 1 2
    0.5, 0.5, 0.5, 0.0, 1.0, 0.0,// 0
    -0.5, 0.5, 0.5, 0.0, 1.0, 0.0,// 1
    -0.5, 0.5, -0.5, 0.0, 1.0, 0.0,// 2
    // 0 2 3
    0.5, 0.5, 0.5, 0.0, 1.0, 0.0,// 0
    -0.5, 0.5, -0.5, 0.0, 1.0, 0.0,// 2
    0.5, 0.5, -0.5, 0.0, 1.0, 0.0,// 3

    // +X face
    // 0 3 7
    0.5, 0.5, 0.5, 1.0, 0.0, 0.0, // 0
    0.5, 0.5, -0.5, 1.0, 0.0, 0.0, // 3
    0.5, -0.5, -0.5, 1.0, 0.0, 0.0, // 7
    // 0 7 4
    0.5, 0.5, 0.5, 1.0, 0.0, 0.0, // 0
    0.5, -0.5, -0.5, 1.0, 0.0, 0.0, // 7
    0.5, -0.5, 0.5, 1.0, 0.0, 0.0, // 4

    // +Z face
    // 0 4 5
    0.5, 0.5, 0.5, 0.0, 0.0, 1.0, // 0
    0.5, -0.5, 0.5, 0.0, 0.0, 1.0, // 4
    -0.5, -0.5, 0.5, 0.0, 0.0, 1.0, // 5
    // 0 5 1
    0.5, 0.5, 0.5, 0.0, 0.0, 1.0, // 0
    -0.5, -0.5, 0.5, 0.0, 0.0, 1.0, // 5
    -0.5, 0.5, 0.5, 0.0, 0.0, 1.0, // 1

    // -Z face
    // 6 3 2
    -0.5, -0.5, -0.5, 0.0, 0.0, -1.0, // 6
    0.5, 0.5, -0.5, 0.0, 0.0, -1.0, // 3
    -0.5, 0.5, -0.5, 0.0, 0.0, -1.0, // 2
    // 6 7 3
    -0.5, -0.5, -0.5, 0.0, 0.0, -1.0, // 6
    0.5, -0.5, -0.5, 0.0, 0.0, -1.0, // 7
    0.5, 0.5, -0.5, 0.0, 0.0, -1.0, // 3

    // -X face
    // 6 2 1
    -0.5, -0.5, -0.5, -1.0, 0.0, 0.0, // 6
    -0.5, 0.5, -0.5, -1.0, 0.0, 0.0, // 2
    -0.5, 0.5, 0.5, -1.0, 0.0, 0.0, // 1
    // 6 1 5
    -0.5, -0.5, -0.5, -1.0, 0.0, 0.0, // 6
    -0.5, 0.5, 0.5, -1.0, 0.0, 0.0, // 1
    -0.5, -0.5, 0.5, -1.0, 0.0, 0.0, // 5

    // -Y face
    // 6 5 4
    -0.5, -0.5, -0.5, 0.0, -1.0, 0.0, // 6
    -0.5, -0.5, 0.5, 0.0, -1.0, 0.0, // 5
    0.5, -0.5, 0.5, 0.0, -1.0, 0.0, // 4
    // 6 4 7
    -0.5, -0.5, -0.5, 0.0, -1.0, 0.0, // 6
    0.5, -0.5, 0.5, 0.0, -1.0, 0.0, // 4
    0.5, -0.5, -0.5, 0.0, -1.0, 0.0 // 7

]);

// generate instance data (1 entry per voxel)

// var voxelmin = -5, voxelmax = 6;
let voxelmin = -15, voxelmax = 16;
let voxelside = voxelmax - voxelmin;
let numinstances = Math.pow(voxelside, 3);

let voxeldata = function (t) {
    let x, y, z, r, g, b;
    let voxeldataElementLength = 6; // 1 for each of the above vars per element
    let out = new Float32Array(numinstances * voxeldataElementLength);
    let isExtent = function (x, y, z, min, max) {
        return x === min || x === max || y === min || y === max || z === min || z === max;
    };
    for (x = voxelmin; x < voxelmax; ++x) {
        for (y = voxelmin; y < voxelmax; ++y) {
            for (z = voxelmin; z < voxelmax; ++z) {
                if (isExtent(x, y, z, voxelmin, voxelmax - 1)) {
                    r = 0; g = 0; b = 0.8;
                } else {
                    let distance = Math.sqrt(x * x + y * y + z * z);
                    if (distance < 6) {
                        r = 1; g = 1; b = 0;
                    } else if (distance < 13) {
                        r = 1; g = 0.2; b = 0;
                    } else {
                        r = 0.3; g = 0.25; b = 0.25;
                    }
                }
                let offset = voxeldataElementLength * ((z - voxelmin) * voxelside * voxelside + (y - voxelmin) * voxelside + x - voxelmin);
                out.set([x, y, z, r, g, b], offset);
            }
        }
    }
    return out;
}();

let frame;

let cubemap_image, cubemap_counter, cubemap_texture;

function setupCubemapTextures() {
    cubemap_texture = gl.createTexture();
    let cubesides = [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemap_texture);
    for (let i = 0; i < 6; ++i) {
        gl.texImage2D(cubesides[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubemap_image[i]);
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    requestAnimationFrame(frame);
}

function cubemap_onload() {
    ++cubemap_counter;
    if (cubemap_counter >= 6) setupCubemapTextures();
}

function load_cubemap(src) {
    cubemap_counter = 0;
    cubemap_image = [];
    for (let i = 0; i < 6; ++i) {
        cubemap_image[i] = new Image();
        cubemap_image[i].onload = cubemap_onload;
        cubemap_image[i].crossOrigin = 'Anonymous';
        cubemap_image[i].src = src[i];
    }
}

let vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, cubevertices, gl.STATIC_DRAW);
// position
let loc = gl.getAttribLocation(sprog, 'a_position');
gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 24, 0);
gl.enableVertexAttribArray(loc);
// normal
loc = gl.getAttribLocation(sprog, 'a_normal');
gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 24, 12);
gl.enableVertexAttribArray(loc);

// stuff we want to change per instance (offset, color, t-offset)
let instanceBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
gl.bufferData(gl.ARRAY_BUFFER, voxeldata, gl.STATIC_DRAW);
loc = gl.getAttribLocation(sprog, 'a_offset');
gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 24, 0);
instanced.vertexAttribDivisorANGLE(loc, 1);
gl.enableVertexAttribArray(loc);
loc = gl.getAttribLocation(sprog, 'a_color');
gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 24, 12);
instanced.vertexAttribDivisorANGLE(loc, 1);
gl.enableVertexAttribArray(loc);

gl.clearColor(0, 0, 0.1, 1); // clear to white
gl.enable(gl.DEPTH_TEST); // depth test is important

let getCameraMatrix = function (radius, elevation, t) {
    return mat4.lookAt(
        mat4.create(),
        [radius * Math.cos(t), elevation - 1.5, radius * Math.sin(t)],
        [0, -1.5, 0], // kinda hacky
        [0, 1, 0]
    );
};

// the cool thing here is we do very little work in JS per frame;
// most of the lifting is in the shader for this one.
frame = function (t) {
    let t2 = t / 200.0;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // clear buffer

    gl.useProgram(sprog);
    gl.uniformMatrix4fv(gl.getUniformLocation(sprog, 'u_modelview'), false, getCameraMatrix(48, 30, t2 / 10));
    gl.uniformMatrix4fv(gl.getUniformLocation(sprog, 'u_projection'), false,
        mat4.perspective(mat4.create(), Math.PI / 3.0, w / h, 1.0, 500.0)
    );
    gl.uniform1f(gl.getUniformLocation(sprog, 'u_tval'), t2 / 4.0);
    gl.uniform1i(gl.getUniformLocation(sprog, 'u_cubemap'), 0);
    gl.uniform3fv(gl.getUniformLocation(sprog, 'u_reverseLightDirection'),
        [Math.cos(t2 / 10), Math.asin(8 / 12), Math.sin(t2 / 10)]);

    // and draw
    instanced.drawArraysInstancedANGLE(gl.TRIANGLES, 0, cubevertices.length / 6, numinstances);

    requestAnimationFrame(frame);
};


load_cubemap([
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/747189/world_right.png?v=1234567890',
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/747189/world_left.png?v=1234567890',
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/747189/world_top.png?v=1234567890',
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/747189/world_down.png?v=1234567890',
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/747189/world_front.png?v=1234567890',
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/747189/world_back.png?v=1234567890'
]);
