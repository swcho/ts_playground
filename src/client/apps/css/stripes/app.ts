
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/ericthayer/pen/xreGqv
import * as $ from 'jquery';
import './style.scss';
$(document.body).html(require('./content.pug'));
