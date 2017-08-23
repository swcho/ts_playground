
// https://codepen.io/yoksel/pen/ZyqLGv

import './responsive_gallery.scss';
const html = require<string>('./responsive_gallery.pug');
$('body').append($('<div>').html(html));

let prev;
$('.pic').click(function() {
    if (!prev) {
        prev = this;
        $(this).addClass('selected');
    } else {
        const $prev = $(prev);
        const $next = $(this);
        const classPosPrev = $prev.attr('class').split(' ')[1];
        const classPosNext = $next.attr('class').split(' ')[1];
        console.log(classPosPrev, classPosNext);
        $prev.removeClass(classPosPrev).addClass(classPosNext);
        $next.removeClass(classPosNext).addClass(classPosPrev);
        $prev.removeClass('selected');
        prev = null;
    }
});
