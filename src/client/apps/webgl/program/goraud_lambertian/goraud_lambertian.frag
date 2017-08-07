#ifdef GL_ES
precision highp float;
#endif

varying vec4 vFinalColor;

void main(void) {
    gl_FragColor = vFinalColor;
}