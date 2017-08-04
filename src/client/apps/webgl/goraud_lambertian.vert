
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform vec3 uLightPosition;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;

uniform vec4 uMaterialDiffuse;

uniform bool uWireframe;
uniform bool uPerVertexColor;
uniform bool uUpdateLight;

varying vec3 vNormal;
varying vec3 vLightRay;
varying vec3 vEyeVec;
varying vec4 vFinalColor;

void main(void) {

    if (uWireframe) {
        if (uPerVertexColor) {
            vFinalColor = aVertexColor;
        } else {
            vFinalColor = uMaterialDiffuse;
        }
    } else {
        // vec3 N = normalize(vec3(uNMatrix * vec4(aVertexNormal, 1.0)));
        vec3 N = vec3(uNMatrix * vec4(aVertexNormal, 0.0));

        vec3 L = normalize(-uLightPosition);

        L = vec3(uNMatrix * vec4(L, 0.0));

        float lambertTerm = max(dot(N, -L), 0.20);
        vFinalColor = uMaterialDiffuse * uLightDiffuse * lambertTerm;
        vFinalColor.a = 1.0;
    }
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}