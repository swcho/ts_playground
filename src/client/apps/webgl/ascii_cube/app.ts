
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

// import { Matrix4 } from './cuon-matrix';
import { Matrix4 } from './cuon';

// programm start here

let gl: WebGLRenderingContext;

// let fontMapData = 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAAFOElEQVR42u2dW3YjIQxEx/vfWvbEnDNfGafdVJVKgOPSb0gbuDz0QPBnRDbJ1z/5k44IgADol8fjsf6bjyuZlgwA9IMIAIFZliAU50cDQOb1U0mqDPhf9lkIlplW76nAZWEdwNO3LA1bMFo76okMke8YDAC0Sco23jVa2cLCnJvOA/MSFAAUAP8e0AcA310D4M0AuEoeAaBpE36XksIm3K6GWmzRDvu26ZtsmVcl4wv6JF9QJAACIBIAARAJgJMBUAYLq4wjZgsVlsJ/1GWvCG5zzg5odTNQVrvLF2138FFu8/tf3wBgjY9F6yw7gGnJ/wBoSwrSU9o3jwWAzyoOwPYliO19LWYZAKhTDN97cQYWt93TIKjgf+8ZIChX9r19DwBhXmuA5c3Ntbx8EABKCzoBgEVfuraEkeWVVa7tdoBQgS1hTtoOEExH427BGtVUSbthT5nrp0TEVh78izMuAA4DkN7fAGDLufsAiARAAEROAdB0ho49m8bq7K6I2P5NWLOEKxZm3bK9T+dzaXftAIoeHtnHYvFAyIFGEcD3qafZ7r8MgGv+Ea4IPNDR4Y+U/TAdSxBYmPrpuTOuEm5uHWXaJqz9KHW+ptgiHYCgYwjMLKvwmow2rZdKAKiS3l7o2AO0KVjUABcBsHdBEQCoGhQBIB907gH2kq6IGA7Ae4buZ3MmACgbT7iCxJV7JVvCiMasqeB4c57KxxcUZ1wABEAABEAkAAIg8qsBPGnElKLtrQZoMdRtC6Ty646lUDVrOsAy7VnWXJ9azqcAWOM4QqrhdRm1AMC9C6DHQlumKC8IPqW8ISawABcRk8dpHYDcbIvbrgkAcTy9I0ViAYBiUFD7rGuszNNUDwQg9/6wBvhaAFRavh6AlnNhjHKvANARkBkNp0gsZzI2Axi1mNS91iTr464N8z0AjEJMqn47f58aOq2AcDWDRV+PLyjOuAAIgAAIgEgABEDkDAByMlfHxRJTdd51wyF1gK5y1BV9Q8Z7cR17Z5XRDO44mVup/x4AxgaMnniA8U0GAwDtLiiq2KV36NVyMe2dxTcLIavfzZrpByDM1vtOvP+4HLoyevmFCD66B+A9C/rXTgAw+u800zabEgDvDHgap/e56k0zoALJCaAytA8EYE/nawTQkaZqz0Dffiri/QDgdoB3ARy12DUV4zNswoLdKFiw+HRZ+USuYAnLamgiYnHGRQIgACIBEACRAPgYAGyOWN2kGIULLX4VACFHTHbICLboq2K/CkDFk+EFMHweVjOAVxer3Aeqpka58LwDuFJd1lPGL4S4W1wR9suVKkkfdrcd3kzqEa1hjIhprmMq8YqaK8VfpwAUXy5ZHREDt9O+FLOmznqbkOQJAIYaZcQj0hsACG1zLQJrlqC6GnoEACr/1rVl1TdhXFla0yLlZBylhiLbL6uGUkqwlsw1gOvrGw9mjWOeOzrz3Z9FRxMD4NMBHPvsVSOA7W9+nf/omFzDy39MPGCzBEAABMDUHY2sa6DRUM/nMh7Wm9YTbHKlni+vqxEu41r20gB1bV5FtymeDUXusrwG4L0w5n0BDOAYvVBsAqCSbVKMPgqobgbNzyCUcGPWagB9aRcIDBYAkspxSajoj0Pw//zrZeFFM8D+mKeQS4MAYLODWgCMQi7VgTOAAiA0s/jroha0fQ8YfDKTds0w2LN+APbR6i15DoDBBHk4AIOJCq20A5YBKEbuOAD3B7NAS7iee4W/VI1vqgO43bFiCd83nLCEZcvlcAdynHGRAAiAyB2Ar8hWCYDN8hdO6ayFlEpanwAAAABJRU5ErkJggg==';
const fontMapData = 'data:image/png;base64, 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';

function main() {

    const scene = document.getElementById('scene') as HTMLCanvasElement;
    gl = scene.getContext('webgl');

    let canvas_program = createShaderProgram('canvas_vsh', 'canvas_fsh');
    gl.useProgram(canvas_program);

    let canvas_a_pos = gl.getAttribLocation(canvas_program, 'a_pos');
    let canvas_a_texcoord = gl.getAttribLocation(canvas_program, 'a_texcoord');

    let u_fontmap = gl.getUniformLocation(canvas_program, 'u_fontmap');
    gl.uniform1i(u_fontmap, 0); // texture0

    let u_tex = gl.getUniformLocation(canvas_program, 'u_tex');
    gl.uniform1i(u_tex, 1); // texture1

    let cube_program = createShaderProgram('cube_vsh', 'cube_fsh');
    gl.useProgram(cube_program);

    let cube_a_pos = gl.getAttribLocation(cube_program, 'a_pos');
    let cube_a_color = gl.getAttribLocation(cube_program, 'a_color');

    let u_p = gl.getUniformLocation(cube_program, 'u_P');

    let projection = new Matrix4();
    projection.perspective(30, 1, 0.1, 10);
    gl.uniformMatrix4fv(u_p, false, projection.elements);

    let u_v = gl.getUniformLocation(cube_program, 'u_V');
    let view = new Matrix4();
    view.lookAt(2, 2, 2, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_v, false, view.elements);

    let u_m = gl.getUniformLocation(cube_program, 'u_M');

    let canvas_vertices = new Float32Array([
        -1, -1, 0, 0,
        1, -1, 36 / 64, 0,
        1, 1, 36 / 64, 28 / 64,
        -1, 1, 0, 28 / 64
    ]);

    let canvas_indices = new Uint8Array([
        0, 1, 2, 2, 3, 0
    ]);

    let canvas_vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, canvas_vbo);
    gl.bufferData(gl.ARRAY_BUFFER, canvas_vertices, gl.STATIC_DRAW);

    let canvas_ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, canvas_ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, canvas_indices, gl.STATIC_DRAW);

    let vertices = [
        // 앞면(Front face)
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // 뒤면(Back face)
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // 위면(Top face)
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // 아래면(Bottom face)
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // 오른쪽면(Right face)
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // 왼쪽면(Left face)
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0
    ];
    let cubeVertexIndices = [
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // back
        8, 9, 10, 8, 10, 11,   // top
        12, 13, 14, 12, 14, 15,   // bottom
        16, 17, 18, 16, 18, 19,   // right
        20, 21, 22, 20, 22, 23    // left
    ];

    let cube_vertices = new Float32Array([
        0.5, 0.5, 0.5, 1, 0, 1,
        0.5, 0.5, -0.5, 0, 1, 1,
        -0.5, 0.5, -0.5, 1, 1, 0,
        -0.5, 0.5, 0.5, 1, 0, 0,
        0.5, -0.5, 0.5, 1, 1, 1,
        0.5, -0.5, -0.5, 1, 1, 1,
        -0.5, -0.5, -0.5, 1, 0, 1,
        -0.5, -0.5, 0.5, 1, 1, 1
    ]);

    let cube_indices = new Uint8Array([
        0, 4, 5,
        0, 5, 1,
        1, 5, 6,
        1, 6, 2,
        2, 6, 7,
        2, 7, 3,
        3, 7, 4,
        3, 4, 0,
        7, 6, 5,
        7, 5, 4,
        3, 0, 1,
        3, 1, 2,
    ] || [
        0, 1, 2,
        2, 3, 0,
        0, 4, 1,
        1, 4, 5,
        5, 6, 1,
        1, 6, 2,
        2, 6, 3,
        3, 6, 7,
        7, 6, 4,
        6, 5, 4,
        3, 4, 7,
        3, 4, 0
    ]);

    let cube_vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cube_vbo);
    gl.bufferData(gl.ARRAY_BUFFER, cube_vertices, gl.STATIC_DRAW);

    let cube_ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube_ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube_indices, gl.STATIC_DRAW);


    let fontMapImg = new Image();
    fontMapImg.src = fontMapData;
    fontMapImg.onload = function () {
        gl.activeTexture(gl.TEXTURE0);

        let fontMapTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fontMapTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fontMapImg);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    };

    gl.activeTexture(gl.TEXTURE1);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    const canvasTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, canvasTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, canvasTex, 0);

    let dbo = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, dbo);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 64, 64);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, dbo);

    gl.clearColor(1, 1, 1, 1);
    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LESS);

    function raf(fn) {
        const fun = requestAnimationFrame;
        // const fun = (fn) => setTimeout(fn, 1000);
        fun(fn);
    }

    let r = 0;
    function run() {

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        gl.viewport(0, 0, 36, 28);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, cube_vbo);

        gl.vertexAttribPointer(cube_a_pos, 3, gl.FLOAT, false, cube_vertices.BYTES_PER_ELEMENT * 6, 0);
        gl.enableVertexAttribArray(cube_a_pos);

        gl.vertexAttribPointer(cube_a_color, 3, gl.FLOAT, false, cube_vertices.BYTES_PER_ELEMENT * 6, cube_vertices.BYTES_PER_ELEMENT * 3);
        gl.enableVertexAttribArray(cube_a_color);

        gl.useProgram(cube_program);

        let model = new Matrix4();
        model.rotate(r++, 0, 1, 0);
        gl.uniformMatrix4fv(u_m, false, model.elements);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube_ebo);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.viewport(0, 0, 504, 504);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, canvas_vbo);

        gl.vertexAttribPointer(canvas_a_pos, 2, gl.FLOAT, false, canvas_vertices.BYTES_PER_ELEMENT * 4, 0);
        gl.enableVertexAttribArray(canvas_a_pos);

        gl.vertexAttribPointer(canvas_a_texcoord, 2, gl.FLOAT, false, canvas_vertices.BYTES_PER_ELEMENT * 4, canvas_vertices.BYTES_PER_ELEMENT * 2);
        gl.enableVertexAttribArray(canvas_a_texcoord);

        gl.useProgram(canvas_program);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, canvas_ebo);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

        raf(run);
    }
    raf(run);
}


function createShader(type, src) {
    let node = document.getElementById(src);
    let shader = gl.createShader(type);
    gl.shaderSource(shader, node.innerHTML);
    gl.compileShader(shader);
    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        let error = gl.getShaderInfoLog(shader);
        console.log('Failed to compile shader: ' + error);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createShaderProgram(vsh, fsh) {
    let vShader = createShader(gl.VERTEX_SHADER, vsh);
    let fShader = createShader(gl.FRAGMENT_SHADER, fsh);
    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vShader);
    gl.attachShader(shaderProgram, fShader);
    gl.linkProgram(shaderProgram);
    let linked = gl.getProgramParameter(shaderProgram, gl.LINK_STATUS);
    if (!linked) {
        let error = gl.getProgramInfoLog(shaderProgram);
        console.log('Failed to link shaderProgram: ' + error);
        gl.deleteProgram(shaderProgram);
        gl.deleteShader(vShader);
        gl.deleteShader(fShader);
        return null;
    }
    return shaderProgram;
}

main();
