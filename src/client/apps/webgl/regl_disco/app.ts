
/// <reference path="../regl.d.ts"/>

import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
import reglCamera = require('regl-camera');
console.log(__filename);

//

function createPoints(nu) {
    let pts = [];
    let tris = [];
    let normals = [];
    let uv = [];

    function fudge(xyz) {
        let dx = 0.025;
        return [
            xyz[0] * (1 - dx * 0.5) + dx * Math.random(),
            xyz[1] * (1 - dx * 0.5) + dx * Math.random(),
            xyz[2] * (1 - dx * 0.5) + dx * Math.random()
        ];
    }
    function xyz(phi, theta) {
        return [
            Math.sin(theta) * Math.cos(phi),
            Math.sin(phi),
            Math.cos(theta) * Math.cos(phi),
        ];
    }

    for (let i = 0; i < nu; i++) {
        let phi = (-0.5 + (i + 0.5) / nu) * Math.PI;
        let phiL = (-0.5 + (i) / nu) * Math.PI;
        let phiU = (-0.5 + (i + 1) / nu) * Math.PI;

        let rad = 2 * Math.PI * Math.cos(phi);
        let nv = Math.round(rad / (Math.PI * 2.0) * nu);
        let rand = Math.random();
        for (let j = 0; j < 2 * nv; j++) {
            let theta = (j + rand) / (2 * nv) * Math.PI * 2;
            let thetaL = (j - 0.5 + rand) / (2 * nv) * Math.PI * 2;
            let thetaU = (j + 0.5 + rand) / (2 * nv) * Math.PI * 2;
            let col = Math.random();
            // var pCen = xyz(phi, theta, col);
            let pCen = xyz(phi, theta);
            pts.push(pCen);

            // C D
            // A B
            let pA = xyz(phiL, thetaL);
            let pB = xyz(phiU, thetaL);
            let pC = xyz(phiL, thetaU);
            let pD = xyz(phiU, thetaU);

            let norm = normalize([], cross([], subtract([], fudge(pD), fudge(pA)), subtract([], fudge(pC), fudge(pB))));

            tris.push(pA);
            tris.push(pB);
            tris.push(pC);
            normals.push(norm);
            normals.push(norm);
            normals.push(norm);
            uv.push([-1, -1]);
            uv.push([1, -1]);
            uv.push([-1, 1]);

            tris.push(pD);
            tris.push(pC);
            tris.push(pB);
            normals.push(norm);
            normals.push(norm);
            normals.push(norm);
            uv.push([1, 1]);
            uv.push([-1, 1]);
            uv.push([1, -1]);
        }
    }
    return { pts: pts, tris: tris, normals: normals, uv: uv };
}

function createMatcap(n) {
    let data = new Uint8Array(n * n * 4);
    let hue = Math.random();
    for (let i = 0; i < n * n; i++) {
        let c = hsl2rgb([
            (hue + 0.4 * Math.random()) % 1.0,
            0.5,
            Math.random()
        ]);
        data[4 * i] = c[0] * 256;
        data[4 * i + 1] = c[1] * 256;
        data[4 * i + 2] = c[2] * 256;
        data[4 * i + 3] = 1.0;
    }
    return data;
}

function start() {
    createREGL<{}, {}, { matcap: any; intens: any; }>({
        attributes: { /*antialias: false*/ },
        pixelRatio: 1.0,
        onDone: (err, regl) => {
            const raySource = regl.framebuffer({
                color: regl.texture({
                    width: regl._gl.canvas.width / 2,
                    height: regl._gl.canvas.height / 2,
                    mag: 'linear',
                    min: 'linear',
                })
            });
            const rayAccum = regl.framebuffer({
                color: regl.texture({
                    width: regl._gl.canvas.width / 2,
                    height: regl._gl.canvas.height / 2,
                    mag: 'linear',
                    min: 'linear',
                })
            });
            const matcapRes = 9;
            const ballRes = 35;

            const matcaps = new Array(4).fill(0).map(() =>
                regl.texture({
                    data: createMatcap(matcapRes),
                    radius: matcapRes,
                    min: 'linear',
                    mag: 'linear'
                })
            );

            const geom = createPoints(ballRes);
            const camera = reglCamera(regl, {
                damping: 0,
                distance: 7,
                phi: -0.5
            });
            const ident = identity([]);

            const drawBall = regl({
                vert: `
            precision mediump float;
            attribute vec3 xyz, normal;
            varying vec3 color;
            uniform mat4 model, projection, view, iview;
            uniform vec3 eye;
            uniform sampler2D matcapTexture;

            // Source: https://github.com/hughsk/matcap
            vec2 matcap(vec3 veye, vec3 n) {
              vec3 reflected = reflect(veye, n);
              float m = 2.8284271247461903 * sqrt(reflected.z + 1.0);
              return reflected.xy / m + 0.5;
            }

            void main () {
              vec3 veye = normalize(xyz - eye);
              mat3 view3 = mat3(view);
              mat3 model3 = mat3(model);
              color = texture2D(matcapTexture, matcap(view3 * veye, view3 * model3 * normal)).xyz;
              gl_Position = projection * view * model * vec4(xyz, 1.0);
            }
          `,
                frag: `
            precision mediump float;
  uniform float intens;
            varying vec3 color;
            void main () {
              gl_FragColor = vec4(color * intens, 1.0);
            }
          `,
                cull: { enable: true, face: 'front' },
                blend: { enable: false },
                depth: { enable: true },
                attributes: {
                    xyz: geom.tris,
                    normal: geom.normals
                },
                uniforms: {
                    matcapTexture: regl.prop('matcap'),
                    intens: regl.prop('intens'),
                    iview: ctx => invert([], ctx.view),
                    model: ctx => rotateY([], ident, ctx.time * 0.7)
                },
                count: geom.tris.length
            });

            const drawReflections = regl({
                vert: `
            precision mediump float;
            attribute vec3 xyz, normal;
            attribute vec2 uv;
            varying vec3 color;
            varying vec2 vuv;
            varying float dp;
            uniform mat4 model, projection, view;
            uniform vec3 eye, origin;
            uniform sampler2D matcapTexture;

            // Source: https://github.com/hughsk/matcap
            vec2 matcap(vec3 veye, vec3 n) {
              vec3 reflected = reflect(veye, n);
              float m = 2.8284271247461903 * sqrt(reflected.z + 1.0);
              return reflected.xy / m + 0.5;
            }

            void main () {
              vuv = uv;
              mat3 view3 = mat3(view);
              mat3 model3 = mat3(model);

              vec3 p = model3 * xyz;
              vec3 i = normalize(p - origin);
              vec3 n = normalize(p);
              vec3 refl = reflect(i, n) * 20.0;

              dp = dot(i, n);

              vec3 veye = normalize(xyz - eye);
              color = texture2D(matcapTexture, matcap(view3 * veye, view3 * model3 * normal)).xyz;

              gl_Position = projection * view * vec4(refl, 1.0);
            }
          `,
                frag: `
            precision mediump float;
            varying vec3 color;
            varying float dp;
            varying vec2 vuv;
            void main () {
              if (dp > 0.0) discard;
              gl_FragColor = vec4(color, 0.1 * smoothstep(0.0, -0.2, dp) * (1.0 - dot(vuv, vuv)));
            }
          `,
                attributes: {
                    xyz: geom.tris,
                    normal: geom.normals,
                    uv: geom.uv
                },
                depth: { enable: false },
                blend: {
                    enable: true,
                    func: { srcRGB: 'src alpha', srcAlpha: 1, dstRGB: 1, dstAlpha: 1 },
                    equation: { rgb: 'add', alpha: 'add' },
                },
                uniforms: {
                    matcapTexture: regl.prop('matcap'),
                    model: ctx => rotateY([], ident, ctx.time * 0.7),
                    origin: regl.prop('origin')
                },
                count: geom.tris.length
            });

            const transferRays = regl({
                vert: `
            precision mediump float;
            attribute vec2 xy;
            varying vec2 uv;
            void main () {
              uv = xy * 0.5 + 0.5;
              gl_Position = vec4(xy, 0, 1);
            }
          `,
                frag: `
            precision mediump float;
            uniform sampler2D rayAccum;
            varying vec2 uv;

            void main () {
              gl_FragColor = vec4(texture2D(rayAccum, uv).xyz, 1);
            }
          `,
                depth: { enable: false },
                blend: {
                    enable: true,
                    func: { srcRGB: 'src alpha', srcAlpha: 1, dstRGB: 1, dstAlpha: 1 },
                    equation: { rgb: 'add', alpha: 'add' },
                },
                uniforms: { rayAccum: rayAccum },
                attributes: { xy: [-4, -4, 0, 4, 4, -4] },
                count: 3
            });

            const drawRays = regl({
                vert: `
            precision mediump float;
            attribute vec2 xy;
            varying vec2 uv;
            void main () {
              uv = xy * 0.5 + 0.5;
              gl_Position = vec4(xy, 0, 1);
            }
          `,
                frag: `
            precision mediump float;
            uniform sampler2D raySource;
            uniform float intens;
            varying vec2 uv;
            const int numSamples = 70;

            // Source: https://github.com/Erkaman/glsl-godrays
            vec3 godrays(
              float density,
              float weight,
              float decay,
              float exposure,
              vec2 pos,
              vec2 uv
            ) {
              vec3 fragColor = vec3(0.0);
              vec2 deltaTextCoord = vec2(uv - pos.xy);
              vec2 tc = uv.xy ;
              deltaTextCoord *= (1.0 /  float(numSamples)) * density;
              float illuminationDecay = 1.0;
              for(int i=0; i < numSamples ; i++){
                tc -= deltaTextCoord;
                vec3 samp = texture2D(raySource, tc).xyz;
                samp *= samp;
                samp *= samp;
                samp *= samp;
                samp *= illuminationDecay * weight;
                fragColor += samp;
                illuminationDecay *= decay;
              }
              fragColor *= exposure;
              return fragColor;
            }

            void main () {
              gl_FragColor = vec4(godrays(1.0, 0.15, 0.95, 1.8 / intens, vec2(0.5, 0.5), uv), 1);
            }
          `,
                depth: { enable: false },
                blend: {
                    enable: true,
                    func: { srcRGB: 'src alpha', srcAlpha: 1, dstRGB: 1, dstAlpha: 1 },
                    equation: { rgb: 'add', alpha: 'add' },
                },
                uniforms: { raySource: raySource, intens: regl.prop('intens') },
                attributes: { xy: [-4, -4, 0, 4, 4, -4] },
                count: 3
            });

            regl.frame(({ tick, time }) => {
                // if (tick % 5 !== 1) return;
                regl.clear({ color: [0, 0, 0, 1] });

                let m = (time * 1.7) % 4;
                let m0 = Math.floor(m);
                let matcap = matcaps[m0];
                let intens = Math.exp(-(m - m0) / 5.0);

                camera(() => {
                    raySource.use(() => {
                        regl.clear({ color: [0, 0, 0, 1], depth: 1 });
                        drawBall({ matcap: matcap, intens: intens });
                    });
                    rayAccum.use(() => {
                        regl.clear({ color: [0, 0, 0, 1], depth: 1 });
                        drawRays({ intens: intens });
                    });
                    drawReflections({ origin: [-10, -5, -5], matcap: matcap });
                    drawReflections({ origin: [8, -2, 12], matcap: matcap });
                    drawReflections({ origin: [4, 5, 6], matcap: matcap });
                    drawBall({ matcap: matcap, intens: intens });
                    transferRays();
                });
            });
        }
    });
}

// Source: https://github.com/stackgl/gl-mat4/blob/master/invert.js
function invert(out, a) {
    let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};

// Source: https://github.com/stackgl/gl-mat4/blob/master/identity.js
function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

// Source: https://github.com/stackgl/gl-mat4/blob/master/rotateY.js
function rotateY(out, a, rad) {
    let s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};

// Source: https://github.com/stackgl/gl-vec3/blob/master/subtract.js
function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
}

// Source: https://github.com/stackgl/gl-vec3/blob/master/cross.js
function cross(out, a, b) {
    let ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
}

// Source: https://github.com/stackgl/gl-vec3/blob/master/normalize.js
function normalize(out, a) {
    let x = a[0],
        y = a[1],
        z = a[2];
    let len = x * x + y * y + z * z;
    if (len > 0) {
        // TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out;
}

// Source: https://github.com/mattdesl/float-hsl2rgb
function hsl2rgb(hsl) {
    let h = hsl[0],
        s = hsl[1],
        l = hsl[2],
        t1, t2, t3, rgb, val;

    if (s === 0) {
        val = l;
        return [val, val, val];
    }

    if (l < 0.5) {
        t2 = l * (1 + s);
    } else {
        t2 = l + s - l * s;
    }
    t1 = 2 * l - t2;

    rgb = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
        t3 = h + 1 / 3 * -(i - 1);
        if (t3 < 0) {
            t3++;
        }
        if (t3 > 1) {
            t3--;
        }

        if (6 * t3 < 1) {
            val = t1 + (t2 - t1) * 6 * t3;
        } else if (2 * t3 < 1) {
            val = t2;
        } else if (3 * t3 < 2) {
            val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
        } else {
            val = t1;
        }

        rgb[i] = val;
    }

    return rgb;
}

// regl-camera, bundled:

start();
