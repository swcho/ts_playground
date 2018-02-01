
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// ref: https://codepen.io/Alca/pen/GEwbbo

require('p5');
declare function beginPath();
declare function beginShape();
declare function endShape();

function setup() {
}


function draw() {
}

function windowResized() {
}

window['setup'] = setup;
window['draw'] = draw;
window['resize'] = windowResized;
