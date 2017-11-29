
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

declare global {
    // https://alvarotrigo.com/fullPage/
    interface JQuery {
        fullpage;
    }
}

$(document).ready(function () {
    $('#fullpage').fullpage({
        navigation: true,
        navigationPosition: 'left',
        scrollingSpeed: 800,
        // fixedElements: '#header'
    });
});
