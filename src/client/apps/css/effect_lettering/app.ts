
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import {TimelineMax, Back} from 'gsap';

let $body = $('body');
let $btnAction = $('.btn--action');
let innerWrapClass = 'inner-wrap';
let $letter, $letterWrapper;

declare global {
    interface JQuery {
        lettering(str?: string);
    }
}

$btnAction.focus();

// Wrap words
$btnAction.lettering('words');

// Wrap letters
$('[class^="word"]').lettering();
$letter = $btnAction.find('[class^="char"]');

// Wrap inner to hide overflow on each letter
$letter.each(function () {
    $(this).wrapInner('<span>');
    $letterWrapper = $(this).find('span');

    $letterWrapper
        .addClass(innerWrapClass)
        .attr('data-letter', $(this).text());

    // Add class to text spaces
    if ($letterWrapper.data('letter') === ' ') {
        $(this).addClass('letter-space');
    }
});

// Setup animation
$btnAction.each(function (index, el) {
    const $innerWrapper = $(el).find('.' + innerWrapClass);
    const tl = new TimelineMax({ paused: true });
    const duration = $(el).attr('data-duration') ? $(el).data('duration') : 0.3;
    const stagger = $(el).attr('data-stagger') ? $(el).data('stagger') : 0.03;
    const anim = tl.staggerTo($innerWrapper, duration, {
        y: '-110%',
        ease: Back.easeOut
    }, stagger);
    el['animation'] = anim;

    // Apply animation to hover and focus states
    $(el).on('mouseenter focusin', function () {
        this['animation'].play();
    }).on('mouseleave focusout', function () {
        this['animation'].reverse();
    });
});
