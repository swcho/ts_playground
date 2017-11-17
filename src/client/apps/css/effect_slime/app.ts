
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';
const content = require('./content.pug') as string;

document.body.innerHTML = content;
