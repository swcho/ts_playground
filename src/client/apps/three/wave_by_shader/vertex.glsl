uniform float amplitude;
uniform float frequency;
uniform float time;

varying vec3 color;
void main() {

    //we will transform the original position so we store it a temp variable
    vec3 pos = position;

    //compute the Z position of each vertex
    float dist = sin( pos.x + 3.14159 / 2. ) + cos( pos.y );
    pos.z = sin( dist * frequency + time ) * amplitude;

    //passes a color to the fragment shader
    color = normalize( pos + vec3(.5) );

    //projects the coordinates to screen
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1. );

}