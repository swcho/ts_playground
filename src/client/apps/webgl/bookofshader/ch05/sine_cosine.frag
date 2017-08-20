
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float plot(vec2 st, float pct){
  return  smoothstep( pct-0.02, pct, st.y) - 
          smoothstep( pct, pct+0.02, st.y);
}

void main() {
    vec2 temp = u_mouse;
    float temp2 = u_time;

    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(st.x);

    // float y = sin(st.x);
    // float y = sin(st.x - u_time);
    // float y = (sin(st.x * 10.) / 2.) + 0.5;
    // float y = (sin((st.x - u_time) * 3.14) / 2.) + 0.5;
    // float y = (abs(sin((st.x - u_time) * 3.14)));
    // float y = (abs(sin((st.x - fract(u_time)) * 3.14)));
    // float y = (abs(sin((st.x - fract(u_time)) * 3.14)));
    // float y = mod(st.x, 0.5);
    float y = fract(u_time);

    float pct = plot(st, y);
    color = (1.0 - pct) * color + pct * vec3(0., 1., 0.);

    gl_FragColor = vec4(color, 1.);
}