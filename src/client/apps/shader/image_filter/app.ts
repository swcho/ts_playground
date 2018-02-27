
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import './style.scss';

declare const GlslEditor;
const elEditor = document.createElement('div');
document.body.appendChild(elEditor);
const glslEditor = new GlslEditor(elEditor, {
    canvas_size: 500,
    canvas_draggable: true,
    theme: 'monokai',
    multipleBuffers: true,
    watchHash: true,
    fileDrops: true,
    menu: true,
});

glslEditor.setContent(require('./shader.glsl'));
