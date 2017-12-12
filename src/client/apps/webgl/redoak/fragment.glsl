#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float random (in vec2 st) { 
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233))) 
                * 43758.5453123);
}

// Value noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/lsf3WH
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f*f*(3.0-2.0*f);
    return mix( mix( random( i + vec2(0.0,0.0) ), 
                     random( i + vec2(1.0,0.0) ), u.x),
                mix( random( i + vec2(0.0,1.0) ), 
                     random( i + vec2(1.0,1.0) ), u.x), u.y);
}

mat2 rotate2d(float angle){
    return mat2(cos(angle),-sin(angle),
                sin(angle),cos(angle));
}

float lines(in vec2 pos, float b){
    // float scale = 15.0;
    // pos *= scale;
    return smoothstep(0.0,
                    .5 + b * .5,
                    // pos.x);
                    // abs(sin(pos.y * 15.0 * 6.5)) * .5
                    abs(sin(pos.x * 15.0 * 6.5)) * .5
                    // abs((sin(pos.x * 6.5) + b * 2.0)) * .5
                    );
}

float plot(vec2 st, float pct) {
    return smoothstep(pct - 0.02, pct, st.y) - smoothstep(pct, pct + 0.02, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    // st.y *= u_resolution.y/u_resolution.x;

    // vec2 pos = st.yx * vec2(2.25, 3.75);
    vec2 pos = st.xy * vec2(2.25, 3.75);
    // vec2 pos = st; // gl_FragCoord.xy;

    // pos.x = pos.x + u_time;
    // pos.y = pos.y + (u_time * 0.75);

    // Add noise
    pos = rotate2d( noise(pos + (u_time / 10.0)) ) * pos + (u_time / 2.0);
    // pos = rotate2d( noise(pos) ) * pos;
    // pos = noise(pos) * pos;
    // pos = rotate2d( u_time / 2.0 );
    
    float pattern = pos.x;

    // Draw lines
    pattern = lines(pos,.5);
    // pattern = lines(pos, 1.0);

    // Draw line
    // float y = pos.x;
    // pattern = plot(pos, y);

    // Clamp
    // if(pattern >= 0.5){
    // 	pattern = pattern + 0.5;
    // }

    gl_FragColor = vec4(
    (248.0/255.0) - pattern,
    (4.0/255.0) - pattern,
    (64.0/255.0) - pattern,
    1.0);
}