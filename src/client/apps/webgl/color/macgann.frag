precision mediump float;
uniform float time;
uniform vec2 mouse;

void main( ) {
    vec2 pos = gl_FragCoord.xy;
    float dx = (pos.x - mouse.x) / 100.0;
    float dy = (pos.y - mouse.y) / 100.0;
    float d = (dx * dx + dy * dy) / 10.0;
    float p = 
        atan(pos.y - mouse.y, pos.x - mouse.x) * 3.0 + 
        sin(d - time / 25.0) * 4.0
        ;
    float r = 0.5 + sin(d + p) / 2.0;
    float g = 0.5 + cos(d + p) / 2.0;
    float b = 0.5 - sin(d + p) / 2.0;
    gl_FragColor = vec4( r, g, b, 1.0 );
}