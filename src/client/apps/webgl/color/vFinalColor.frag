#ifdef GL_ES
precision highp float;
#endif

varying vec4 vFinalColor;

void main(void) {
    // gl_FragColor = vec4( 1, 0.0, 0.0, 1.0 );
    gl_FragColor = vFinalColor;
}