
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import { mat4 } from 'gl-matrix';

let canvas = document.getElementById('display') as HTMLCanvasElement;
let gl = canvas.getContext('webgl', { depth: true, antialias: true, alpha: false });

let w, h;
let resize = function () {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    gl.viewport(0, 0, w, h);
};
resize();
window.addEventListener('resize', resize);

let vshader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vshader, document.getElementById('vert').innerHTML);
gl.compileShader(vshader);
if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
    console.log('bad vertex shader', gl.getShaderInfoLog(vshader));
}
let fshader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fshader, document.getElementById('frag').innerHTML);
gl.compileShader(fshader);
if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
    console.log('bad fragment shader', gl.getShaderInfoLog(fshader));
}

let sprog = gl.createProgram();
gl.attachShader(sprog, vshader);
gl.attachShader(sprog, fshader);
gl.linkProgram(sprog);
if (!gl.getProgramParameter(sprog, gl.LINK_STATUS)) {
    console.log('couldnt link shaders', gl.getProgramInfoLog(sprog));
}

let meshTriStrip = (function (w, h) {
    w = w >> 1;
    let x, z;
    let output = new Float32Array(12 * (h + 1) * (w + 1));
    let i = 0;
    for (x = 0; x < w; x++) {
        for (z = 0; z <= h; z++) {
            output.set([2 * x, 0, z], 3 * i++);
            output.set([2 * x + 1, 0, z], 3 * i++);
        }
        for (z = h; z >= 0; z--) {
            output.set([2 * x + 1, 0, z], 3 * i++);
            output.set([2 * x + 2, 0, z], 3 * i++);
        }
    }
    return output;
})(1000, 1000);

let vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, meshTriStrip, gl.STATIC_DRAW);
// position
let loc = gl.getAttribLocation(sprog, 'a_position');
gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 12, 0);
gl.enableVertexAttribArray(loc);

gl.clearColor(0, 0, 0, 1); // clear to white
gl.enable(gl.DEPTH_TEST); // depth test is important

let waveOrigins = new Float32Array([
    100, 0, 100,
    900, 0, 900,
    100, 0, 900
]);

let frame = function (t) {
    let t2 = -t / 20.0;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(sprog);

    gl.uniform3fv(gl.getUniformLocation(sprog, 'u_waveorigins'), waveOrigins);

    gl.uniformMatrix4fv(gl.getUniformLocation(sprog, 'u_modelview'), false,
        mat4.multiply(
            mat4.create(),
            mat4.lookAt(mat4.create(), [0, 400, 700], [0, -200, 0], [0, 1, 0]),
            mat4.fromTranslation(mat4.create(), [-500, 0, -500])
        )
    );
    gl.uniformMatrix4fv(gl.getUniformLocation(sprog, 'u_projection'), false,
        mat4.perspective(mat4.create(), Math.PI / 3.0, w / h, 1.0, 5000.0)
    );
    gl.uniform1f(gl.getUniformLocation(sprog, 'u_tval'), t2 / 2.0);
    gl.uniform3fv(gl.getUniformLocation(sprog, 'u_reverseLightDirection'), [2, 15, 7]);

    // and draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, meshTriStrip.length / 3);

    requestAnimationFrame(frame);
};

requestAnimationFrame(frame);
