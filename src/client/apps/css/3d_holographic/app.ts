
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

var toggle = document.getElementById("autoToggle");
var inst = document.getElementById('instructions');
let wrapper = document.getElementById("cardWrapper");
let card = document.getElementById("card");
let images = card.getElementsByTagName('img');

function rotate(event) {
    let x = event.clientX;
    let y = event.clientY;
    let w = window.innerWidth;
    let h = window.innerHeight;
    let midpointX = w / 2;
    let midpointY = h / 2;
    let ypos = x - midpointX;
    let xpos = y - midpointY;
    let yval = ypos / midpointX * 20;
    let xval = xpos / midpointY * 20;
    let card = document.getElementById('card');
    card.style.transform =
        'perspective(550px) rotateY(' + yval + 'deg) rotateX(' + xval + 'deg)';

    for (let i = 1; i < images.length; ++i) {
        let myImg: any = images[i];
        myImg.style =
            'transform: perspective(550px) translateZ(' +
            myImg.getAttribute('data-depth') / myImg.clientHeight * 5000 +
            'px); left: ' +
            yval * myImg.getAttribute('data-depth') * -1 / 20 +
            '%; top: ' +
            xval * myImg.getAttribute('data-depth') / 20 +
            '%;';
    }
}
document.addEventListener(
    'mousemove',
    function (event) {
        if (!wrapper.classList.contains('auto')) {
            rotate(event);
        }
    },
    false
);

document.getElementById('autoToggle').addEventListener('click', function () {
    if (!wrapper.classList.contains('auto')) {
        wrapper.classList.add('auto');
        toggle.innerHTML = 'Click for pointer control';
        inst.innerHTML = 'AUTO ANIMATION';
    } else {
        wrapper.classList.remove('auto');
        toggle.innerHTML = 'Click for auto animation';
        inst.innerHTML = 'POINTER CONTROL';
    }
});
