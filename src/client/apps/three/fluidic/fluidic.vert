varying vec3 pos;
float posY;
uniform float radius;
uniform float time;
uniform float mx;
uniform float my;
void main() {
    pos = position + normal * vec3(sin(time * 0.2) * 3.0);
    // pos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}