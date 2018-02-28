
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

declare const regl;
declare const reglCamera;
declare const icosphere;
declare const failNicely;
declare const glVec3;

regl({
    extensions: ['oes_standard_derivatives'],
    onDone: failNicely(regl => {
        const camera = reglCamera(regl, { damping: 0, distance: 3 });
        const ico = icosphere(1);
        const draw = regl({
            vert: `
        precision mediump float;
        uniform mat4 projection, view;
        varying vec3 p;
        varying float z;
        attribute vec3 xyz;
        void main () {
          p = xyz;
          vec4 vp = view * vec4(xyz, 1);
          z = vp.z;
          gl_Position = projection * vp;
        }
      `,
            frag: `
        #extension GL_OES_standard_derivatives : enable
        precision mediump float;
        varying vec3 p;
        varying float z;
        uniform float dist, time;

        float gridFactor (vec2 parameter, float width, float feather) {
          float w1 = width - feather * 0.5;
          vec2 d = fwidth(parameter);
          vec2 looped = 0.5 - abs(mod(parameter, 1.0) - 0.5);
          vec2 a2 = smoothstep(d * w1, d * (w1 + feather), looped);
          return min(a2.x, a2.y);
        }

        #define TODEG (180.0 / 3.1415926 / 10.0)

        void main () {
          // Rotating spherical coords:
          float f = gridFactor(vec2(atan(p.y, length(p.xz)) * TODEG, (atan(p.z, p.x) - time * 0.2) * TODEG), 2.0, 1.0);
          // Use the screen-space depth to add 'fog':
          gl_FragColor = vec4(vec3(0.8, 0.9, 1.0) * smoothstep(dist + 2.0, dist - 2.0, -z), 1.0 - f);
        }
      `,
            blend: {
                enable: true,
                func: { srcRGB: 'src alpha', srcAlpha: 1, dstRGB: 1, dstAlpha: 1 },
                equation: { rgb: 'add', alpha: 'add' },
            },
            uniforms: {
                time: regl.context('time'),
                dist: ctx => glVec3.length(ctx.eye),
            },
            depth: { enable: false },
            attributes: { xyz: ico.positions },
            elements: ico.cells
        });

        regl.frame(({ tick }) => {
            regl.clear({ color: [0.1, 0.09, 0.08, 1] });
            camera(draw);
        });
    })
});
