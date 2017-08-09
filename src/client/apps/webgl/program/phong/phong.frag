#ifdef GL_ES
precision highp float;
#endif

uniform bool uWireframe;
uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;

uniform bool uLightSource;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse[${lenLights}];
uniform float uCutoff;

varying vec3 vNormal;
varying vec3 vLightRay[${lenLights}];

void main(void) {
    if (uWireframe || uLightSource) {
        gl_FragColor = uMaterialDiffuse;
    } else {
        vec4 Ia = uLightAmbient * uMaterialAmbient;
        vec4 finalColor = vec4(0.0, 0.0, 0.0, 0.0);

        vec3 N = normalize(vNormal);
        vec3 L = vec3(0.0);
        float lambertTerm = 0.0;

        for (int i = 0; i < ${lenLights}; i++) {
            L = normalize(vLightRay[i]);
            lambertTerm = dot(N, -L);
            if (lambertTerm > uCutoff) {
                finalColor += uLightDiffuse[i] * uMaterialDiffuse * lambertTerm;
            }
        }

        finalColor += Ia;
        finalColor.a = 1.0;
        gl_FragColor = finalColor;
    }
}