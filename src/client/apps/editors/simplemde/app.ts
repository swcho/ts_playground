
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import * as SimpleMDE from 'simplemde';
import 'simplemde/dist/simplemde.min.css';

const mde = new SimpleMDE({
    element: document.getElementById('mde'),
});
