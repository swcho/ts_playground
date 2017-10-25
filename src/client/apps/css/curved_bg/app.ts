
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/armantaherian/pen/ZyZWVZ

import './style.scss';

(function () {
    // Variables
    let $curve = document.getElementById('curve');
    let last_known_scroll_position = 0;
    let defaultCurveValue = 350;
    let curveRate = 3;
    let ticking = false;
    let curveValue;

    // Handle the functionality
    function scrollEvent(scrollPos) {
        if (scrollPos >= 0 && scrollPos < defaultCurveValue) {
            curveValue = defaultCurveValue - Math.floor(scrollPos / curveRate);
            $curve.setAttribute(
                'd',
                'M 800 300 Q 400 ' + curveValue + ' 0 300 L 0 0 L 800 0 L 800 300 Z'
            );
        }
    }

    // Scroll Listener
    // https://developer.mozilla.org/en-US/docs/Web/Events/scroll
    window.addEventListener('scroll', function (e) {
        last_known_scroll_position = window.scrollY;

        if (!ticking) {
            window.requestAnimationFrame(function () {
                scrollEvent(last_known_scroll_position);
                ticking = false;
            });
        }

        ticking = true;
    });
})();
