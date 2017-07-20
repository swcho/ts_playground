attribute vec3 pos;
attribute vec3 rect;
uniform vec3 col;

void main() {
    gl_Position = vec4(pos, 1.0);
    // gl_Position = vec4(rect, 1.0);
}