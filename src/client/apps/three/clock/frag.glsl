
uniform sampler2D u_texture1;
uniform sampler2D u_texture2;
uniform float u_time;
uniform float u_mixFactor;
uniform bool u_Red;
uniform bool u_Noise;

varying vec2 vUv;

<perlin-noise>

void main () {
    vec2 newUv = vUv;

    newUv.x += snoise(vec2(cos(newUv.x * 0.25 + newUv.y * 0.2) * 60.0, 1.0 + u_time)) * (0.02 + u_mixFactor * 0.05);
    newUv.y += snoise(vec2(sin(newUv.x * 20.0 + newUv.y * 0.6) * 20.0, u_time)) * (0.002 + u_mixFactor * 0.05) * 3.0;

    vec4 texColor1 = texture2D(u_texture1, newUv);
    vec4 texColor2 = texture2D(u_texture2, newUv);
    if (u_Red) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    } else if (u_Noise) {
        gl_FragColor = mix(texColor1, texColor2, u_mixFactor);
        // gl_FragColor = texColor1;
        // gl_FragColor = texColor2;
    } else {
        gl_FragColor = texture2D(u_texture2, vUv);
    }
}
