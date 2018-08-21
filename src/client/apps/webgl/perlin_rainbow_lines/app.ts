
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

// Function to make the canvas retina ready
const retinaFy = function retinaFy(canvas) {
    const height = document.body.clientHeight;
    const width = document.body.clientWidth;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
};

// Define the canvas and webgl context
const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
retinaFy(canvas);

window.addEventListener('resize', () => {
    retinaFy(canvas);
});

// Retinafy the canvas before getting the webgl context
const gl = canvas.getContext('webgl');

// Define the time, which is used to calculate progression
let lastUpdate = new Date().getTime();
let timer = 0.0;

const uniformPreset = 'u_';
const uniforms = [
    'time',
    'resolution',
] as any;

// Function to compile the shader
const compileShader = function compileShader(type, shaderString, gl) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, shaderString);
    gl.compileShader(shader);

    return shader;
};

// Function to create the program
const createProgram = function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    uniforms.map((uniform) => (
        uniforms[uniform] = gl.getUniformLocation(program, `${uniformPreset}${uniform}`)
    ));

    return program;
};

const vertex = `
    attribute vec4 a_position;

    void main () {
      gl_Position = vec4(a_position);
    }
  `;

const fragment = `
    precision highp float;

    uniform vec2 u_resolution;
    uniform float u_time;

    //
    // Description : Array and textureless GLSL 2D/3D/4D simplex
    //               noise functions.
    //      Author : Ian McEwan, Ashima Arts.
    //  Maintainer : stegu
    //     Lastmod : 20110822 (ijm)
    //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
    //               Distributed under the MIT License. See LICENSE file.
    //               https://github.com/ashima/webgl-noise
    //               https://github.com/stegu/webgl-noise
    //

    vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 permute(vec4 x) {
        return mod289(((x*34.0)+1.0)*x);
    }

    vec4 taylorInvSqrt(vec4 r)
    {
        return 1.79284291400159 - 0.85373472095314 * r;
    }

    float snoise(vec3 v)
    {
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

        // First corner
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 =   v - i + dot(i, C.xxx) ;

        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );

        //   x0 = x0 - 0.0 + 0.0 * C.xxx;
        //   x1 = x0 - i1  + 1.0 * C.xxx;
        //   x2 = x0 - i2  + 2.0 * C.xxx;
        //   x3 = x0 - 1.0 + 3.0 * C.xxx;
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

        // Permutations
        i = mod289(i);
        vec4 p = permute( permute( permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

        // Gradients: 7x7 points over a square, mapped onto an octahedron.
        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );

        //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
        //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);

        //Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
        dot(p2,x2), dot(p3,x3) ) );
    }

    float perlin3( vec3 coord ) {
        float n = 0.0;
        n = 140.0 * abs( snoise( coord ));
        return n;
    }

    void main( void ) {

      float ab = 50.0;

      vec2 uv = gl_FragCoord.xy / vec2(ab, ab);
      vec3 coord = vec3(uv.xy, u_time / 2.0);
      float n = perlin3(coord);

      vec2 st = gl_FragCoord.xy/u_resolution.xy;
      st.x *= u_resolution.x/u_resolution.y;

      // color = vec3(st.x * n, st.y * n, abs(cos(u_time)));
      vec3 color = vec3(st.x * n, st.y * n, 0.9);

      // vec2 uv = ( gl_FragCoord.xy + u_resolution.xy );
      // gl_FragColor = vec4((cos(u_time))  * 0.05 + 0.1, 0.0, cos(u_time)    * 0.05 + 0.1, 1.0);
      gl_FragColor = vec4(
        color,
        1.0
      );
    }
  `;

// Create the shaders
const vertexShader = compileShader(gl.VERTEX_SHADER, vertex, gl);
const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragment, gl);

const program = createProgram(gl, vertexShader, fragmentShader);

const array = [
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
];

// Create array for buffer
const bufferArray = new Float32Array(array);

// Create a buffer
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, bufferArray, gl.STATIC_DRAW);

// look up where the vertex data needs to go.
const positionLocation = gl.getAttribLocation(program, 'a_position');
const dimensionCount = 2; // 2D

gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, dimensionCount, gl.FLOAT, false, 0, 0);

const draw = function draw() {
    gl.useProgram(program);

    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);

    const currentTime = new Date().getTime();
    const timeSinceLastUpdate = currentTime - lastUpdate;
    lastUpdate = currentTime;

    timer += (timeSinceLastUpdate ? timeSinceLastUpdate / 1000 : 0.05);

    // console.log((Math.cos(timer)) * 0.1 + 0.1);
    // Pass time to the vertex and fragment shader
    gl.uniform1fv(uniforms.time, [timer]);

    gl.drawArrays(gl.TRIANGLES, 0, array.length / dimensionCount);

    // Requestanimationframe
    window.requestAnimationFrame(draw);
};

// draw
draw();
