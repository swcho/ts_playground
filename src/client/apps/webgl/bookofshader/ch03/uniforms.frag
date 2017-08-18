
// https://thebookofshaders.com/03/?lan=kr

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    gl_FragColor = vec4(abs(sin(u_time)), abs(sin(u_time * 3.)), abs(sin(u_time * 6.)), 1.0);
}
