
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import {Doormat} from './doormat';

document.addEventListener('DOMContentLoaded', function () {
    let controls = document.querySelector('.controls');
    let indicators = [].slice.call(document.querySelectorAll('.slide-indicator'), 0);
    const newDoormat = new Doormat();
    window.addEventListener('doormat:update', function (e) {
        if (newDoormat.activeIndex > 1) {
            document.body.classList.add('show-controls');
        } else {
            document.body.classList.remove('show-controls');
        }
        indicators.forEach(function (i) {
            return i.classList.remove('slide-indicator--active');
        });
        indicators[newDoormat.activeIndex - 1].classList.add('slide-indicator--active');
    });
    let handleNav = function handleNav(e) {
        if (e.target.tagName === 'BUTTON') {
            newDoormat.scrollToPanel(e.target.getAttribute('data-panel'));
        }
    };
    controls.addEventListener('click', handleNav);
});

