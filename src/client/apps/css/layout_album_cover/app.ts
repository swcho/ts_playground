
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
import * as $ from 'jquery';
console.log(__filename);

import './style.scss';
const html = require<string>('./markup.pug');
$('body').html(html);
