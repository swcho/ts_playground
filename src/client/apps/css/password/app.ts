
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

import * as $ from 'jquery';
import './style.sass';

$(() => {
    $('#input-text').on('keyup', () => {
        let tempVal = $('#input-text').val();
        $('#input-pw').val(tempVal);
    });
    $('#input-pw').on('keyup', () => {
        let tempVal = $('#input-pw').val();
        $('#input-text').val(tempVal);
    });
    // rotate input fields + hide/show
    $('.input-trigger').on('click', () => {
        $('#input-text').toggleClass('active-text passive-text');
        $('#input-pw').toggleClass('passive-pw active-pw');
        $('.icon-1').toggle();
        $('.icon-2').toggle();
    });
});
