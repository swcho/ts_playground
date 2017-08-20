
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

    // float y = step(0.5, st.x);
    float y = smoothstep(0.4, 0.6, st.x);

    float pct = plot(st, y);
    color = (1.0 - pct) * color + pct * vec3(0., 1., 0.);

    gl_FragColor = vec4(color, 1.);
}