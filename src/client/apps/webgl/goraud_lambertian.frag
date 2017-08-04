#ifdef GL_ES
precision highp float;
#endif

uniform bool uWireframe;

uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec4 uLightSpecular;

uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;
uniform vec4 uMaterialSpecular;

uniform float uShininess;

varying vec4 vFinalColor;
varying vec3 vLightRay;
varying vec3 vNormal;
varying vec3 vEyeVec;

void main(void) {
    gl_FragColor = vFinalColor;
}