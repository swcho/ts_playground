#extension GL_OES_standard_derivatives : enable
varying vec3 pos;
uniform float time;
uniform sampler2D texture;
uniform float mx;
uniform float my;
float dProd;
uniform vec3 highlight;
uniform vec3 shadow;
uniform vec3 light;
float rand(float n)
{
    return fract(sin(n) * 43758.5453123);
}
void main() {
    vec3 N = normalize( cross( dFdx( pos.xyz ), dFdy( pos.xyz ) ) );
    float level = max(0.0, pow(2.71, -0.1 * distance(pos,light)) * dot(normalize(N), normalize(light)));
    vec3 col = (highlight * level + (1.0 - level) * shadow) / (level + 1.0);
    gl_FragColor = vec4(col,1.0);
}