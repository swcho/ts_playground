// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

const float PI = 3.14;
const vec3 light_color = vec3(0.95, 0.75,  0.6);

// void main() {
// 	vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;
// 	vec2 offset = vec2(
//         cos(mod(u_time, PI * 2.0) / 2.0) * 2.0,
//         abs(sin(u_time / 2.0) * 2.0) - 2.0
//     );

//     float light_intensity = pow(distance(vec2(0.0, uv.y + 2.0), uv / 0.5), -12.0);
//     light_intensity *= 0.1 / distance(normalize(uv - offset), uv - offset);

// 	gl_FragColor = vec4(light_intensity * light_color, 1.0);
// }

void main() {
    vec2 uv = (2.000 * gl_FragCoord.xy - u_resolution.xy)  / u_resolution.xy;
    vec2 offset = vec2(
        cos(mod(u_time, PI * 2.0) / 2.0) * 2.0,
        abs(sin(u_time / 2.0) * 2.0) - 2.0
    );
    
    float light_intensity = pow(distance(vec2(0.000, uv.y + 2.0), uv / 0.5),  -12.0);
    light_intensity *= 0.1 / distance(normalize(uv - offset), uv - offset);
    
    gl_FragColor = vec4(light_intensity * light_color, 1.0);
}