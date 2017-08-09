#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertextColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform vec4 uMaterialDiffuse;
uniform vec3 uLightPosition[${lenLights}];

varying vec3 vNormal;
varying vec3 vLightRay[${lenLights}];

void main(void) {
    vec4 vertext = uMVMatrix * vec4(aVertexPosition, 1.0);
    vNormal = vec3(uNMatrix * vec4(aVertexNormal, 1.0));
    for (int i = 0; i < ${lenLights}; i++) {
        vec4 lightPosition = uMVMatrix * vec4(uLightPosition[i], 1.0);
        vLightRay[i] = vertext.xyz - lightPosition.xyz;
    }

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}