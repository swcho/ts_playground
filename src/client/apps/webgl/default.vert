
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

varying vec4 vFinalColor;

void main(void) {

    if (uWireframe) {
        if (uPerVertexColor) {
            vFinalColor = aVertexColor;
        }
        else {
            vFinalColor = uMaterialDiffuse;
        }
    } else {
        // Normal Vector, w = 0 for direction
        vec3 N = vec3(uNMatrix * vec4(aVertexNormal, 0.0));

        // Light direction
        vec3 L = normalize(-uLightPosition);

        // If light direction is affected by model-view transform.
        // L = vec3(uNMatrix * vec4(L, 0.0))

        // Lambert
        float lambertTerm = dot(N, -L);

        // Other side if direction
        if (lambertTerm <= 0.0) lambertTerm = 0.01;

        vec4 Ia = uLightAmbient;
        vec4 Id = uMaterialDiffuse * uLightDiffuse * lambertTerm;

        vFinalColor = Ia + Id;
        vFinalColor.a = 1.0;
    }

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}