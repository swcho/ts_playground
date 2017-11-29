
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

// Dirty 'orrible 'acky fix!
// Safari only - Fix for vw / vh units inside a Codepen iframe
(function () {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') != -1) {
        if (!(ua.indexOf('chrome') > -1)) {

            // Safari only
            console.log("99 browsers but Safari's just one.");
            window.addEventListener("resize", function () {
                window.location.reload(false);
            }, false);
        }
    }
}());
