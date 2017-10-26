
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/ajduke/pen/JJmZBL

import './style.scss';
import * as $ from 'jquery';

$('.grid').click(() => {
    $('.content-modal').addClass('active')
    $('.wrapper').addClass('blur')
    $('html, body').animate({ scrollTop: 0 }, 'slow');
});

$('.content-modal .icon').click(() => {
    $('.content-modal').removeClass('active')
    $('.wrapper').removeClass('blur')
});
