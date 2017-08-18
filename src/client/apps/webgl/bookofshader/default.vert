attribute vec3 pos;
uniform vec3 col;
void main() {
    gl_Position = vec4(pos, 1.0);
}
