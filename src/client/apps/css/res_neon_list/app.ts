
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/andyfitz/pen/LLJpyY
import './style.scss';
import * as $ from 'jquery';

$('li').click(function() {
    $(this).find('span').toggleClass('hide');
});
