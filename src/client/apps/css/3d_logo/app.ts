
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

// ref: https://codepen.io/FUGU22/pen/jwxZzx
import * as $ from 'jquery';
import './style.sass';
const html = require<string>('./content.pug');
$('body').html(html);
