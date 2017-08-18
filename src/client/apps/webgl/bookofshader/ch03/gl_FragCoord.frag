
// https://thebookofshaders.com/03/?lan=kr

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

bool within(float center, float range, float target) {
    return center - range <= target && target <= center + range;
}

void main() {
    float time = u_time;
    if (within(u_mouse.x, 10., gl_FragCoord.x) && within(u_mouse.y, 10., gl_FragCoord.y)) {
        gl_FragColor = vec4(0., 0., 1., 1.);
    } else {
        vec2 st = gl_FragCoord.xy / u_resolution;
        gl_FragColor = vec4(st.x, st.y, 0., 1.);
    }
}
