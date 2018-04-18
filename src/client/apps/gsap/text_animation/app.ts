
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import { TimelineMax, Power4 } from 'gsap';

const g1 = document.querySelectorAll('#g1');
const g1Paths = document.querySelectorAll('#g1 path');
const g2 = document.querySelectorAll('#g2');
const g2Paths = document.querySelectorAll('#g2 path');
const filter = document.querySelector('#faFeGaussianBlur');
const shift = 25;

console.log(g1Paths.length * -shift / 2);

new TimelineMax({
    repeat: -1
})

    .from(g1, 5, {
        x: g1Paths.length * -shift / 2,
        ease: Power4.easeOut
    }, 0)
    .to(filter, 5, {
        attr: { stdDeviation: 0 },
        ease: Power4.easeOut
    }, 0)
    .from(g1Paths, 5, {
        transformOrigin: 'center',
        scale: .5,
        opacity: 0,
        x: i => ++i * shift,
        ease: Power4.easeOut
    }, 0)

    .to(g1, 1, {
        x: g1Paths.length * -shift / 2,
        ease: Power4.easeInOut
    })
    .to(filter, 1, {
        attr: { stdDeviation: 8 },
        ease: Power4.easeInOut
    }, '-=1')
    .to(g1Paths, 1, {
        transformOrigin: 'center',
        scale: 1.2,
        opacity: 0,
        x: i => ++i * shift,
        ease: Power4.easeInOut
    }, '-=1')



    .from(g2, 5, {
        x: g2Paths.length * -shift / 2,
        ease: Power4.easeOut
    })
    .to('#faFeGaussianBlur', 5, {
        attr: { stdDeviation: 0 },
        ease: Power4.easeOut
    }, '-=5')
    .from(g2Paths, 5, {
        transformOrigin: 'center',
        scale: .5,
        opacity: 0,
        x: i => ++i * shift,
        ease: Power4.easeOut
    }, '-=5')

    .to(g2, 1, {
        x: g2Paths.length * -shift / 2,
        ease: Power4.easeInOut
    })
    .to('#faFeGaussianBlur', 1, {
        attr: { stdDeviation: 8 },
        ease: Power4.easeInOut
    }, '-=1')
    .to(g2Paths, 1, {
        transformOrigin: 'center',
        scale: 1.2,
        opacity: 0,
        x: i => ++i * shift,
        ease: Power4.easeInOut
    }, '-=1')
    ;
