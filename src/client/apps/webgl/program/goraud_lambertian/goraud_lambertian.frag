#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;
uniform bool uRenderTexture;

varying vec4 vFinalColor;
varying vec2 vTextureCoords;

void main(void) {
    if (uRenderTexture) {
        gl_FragColor = vFinalColor * texture2D(uSampler, vTextureCoords);
    } else {
        gl_FragColor = vFinalColor;
    }
}