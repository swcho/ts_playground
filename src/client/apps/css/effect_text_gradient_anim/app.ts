
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';
function shizIsBlack() {
    document.body.style.backgroundColor = "#333";
}

function shizIsWhite() {
    document.body.style.backgroundColor = "#f7f7f7";
}
