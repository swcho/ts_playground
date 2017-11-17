
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/giuliacardieri/pen/OgGxeQ

import './style.scss';
import * as $ from 'jquery';

$(function () {
    for (let i = 0; i < 199; i++) {
        $('body').append('<div class=\'snow s' + (i + 1) + '\'></div>');
    }
});
