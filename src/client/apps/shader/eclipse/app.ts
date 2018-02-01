
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import './style.scss';

declare const ShaderPen;

new ShaderPen(`

const float PI = ${Math.PI};
const vec3 light_color = vec3(0.95, 0.75, 0.6);

void main() {

    // vec2 uv = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.xy;
	vec2 uv = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;
    vec2 offset = vec2(
        cos(mod(iTime, PI * 2.0) / 2.0) * 2.0,
        abs(sin(iTime / 2.0) * 2.0) - 2.0
    );

    float light_intensity = pow(distance(vec2(0.0, uv.y + 2.0), uv / 0.5), -12.0);
    light_intensity *= 0.1 / distance(normalize(uv - offset), uv - offset);

    gl_FragColor = vec4(light_intensity * light_color, 1.0);

}

`);

// new ShaderPen(`
// const float PI = ${Math.PI};
// const vec3 light_color = vec3(0.95, 0.75, 0.6);

// void main() {
// 	vec2 uv = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;
// 	vec2 offset = vec2(
//         cos(mod(iTime, PI * 2.0) / 2.0) * 2.0,
//         abs(sin(iTime / 2.0) * 2.0) - 2.0
//     );

//     float light_intensity = pow(distance(vec2(0.0, uv.y + 2.0), uv / 0.5), -12.0);
//     light_intensity *= 0.1 / distance(normalize(uv - offset), uv - offset);

// 	gl_FragColor = vec4(light_intensity * light_color, 1.0);
// }
// `);

declare const GlslEditor;
console.log(require('./shader.glsl'));
const glslEditor = new GlslEditor('#glsl_editor', {
    canvas_size: 500,
    canvas_draggable: true,
    theme: 'monokai',
    multipleBuffers: true,
    watchHash: true,
    fileDrops: true,
    menu: true,
});

glslEditor.setContent(require('./shader.glsl'));
