
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

//Uniforms that define lighting model
uniform vec3 uLightDirection;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec4 uMaterialDiffuse;

varying vec4 vFinalColor;

void main(void) {
    
    //Transformed normal position
    vec3 N = vec3(uNMatrix * vec4(aVertexNormal, 1.0));
    
    //Normalize light to calculate lambertTerm
    vec3 L = normalize(uLightDirection);
    
    //Lambert's cosine law
    float lambertTerm = dot(N,-L);
    
    //Ambient Term
    vec4 Ia = uLightAmbient;
    
    //Diffuse Term
    vec4 Id = uMaterialDiffuse * uLightDiffuse * lambertTerm;
    
    //Final color
    vFinalColor = Ia + Id;
    vFinalColor.a = 1.0;
    
    //Transformed vertex position
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}