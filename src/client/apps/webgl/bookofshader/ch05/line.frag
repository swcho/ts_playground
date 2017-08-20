
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float plot(float x, float y) {
    // return (abs(x - y) < 0.02) ? 1. : 0.;
    // return smoothstep(x - 0.02, x, y);
    // return smoothstep(x, x + 0.02, y);
    return smoothstep(x - 0.02, x, y) - smoothstep(x, x + 0.02, y);
}

void main() {
    vec2 temp = u_mouse;
    float temp2 = u_time;

    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(st.x);

    float pct = plot(st.x, st.y);
    color = (1.0 - pct) * color + pct * vec3(0., 1., 0.);

    gl_FragColor = vec4(color, 1.);
}