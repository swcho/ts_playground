
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import { TweenMax, TimelineLite, SteppedEase, Back, Elastic, Linear, Bounce, CSSRulePlugin } from 'gsap';

declare module 'gsap' {
    interface TweenConfig {
        backgroundColor?;
        fill?;
        scale?;
        rotation?;
        x?;
        stroke?;
    }
    namespace SteppedEase {
        export function config(steps: number): SteppedEase;
    }
}

(function () {
    let fullSVG = document.getElementById('svgout'),
        sun = document.getElementById('sun'),
        bg = document.getElementById('background'),
        bottomShadow = document.getElementById('bottomShadow'),
        shadow = document.getElementById('shadow'),
        earth = document.getElementById('earth'),
        toggleButton = document.getElementById('toggleButton');

    TweenMax.set(bg, { backgroundColor: '#469CCE' });

    const speed = 1;
    const introTimeline = new TimelineLite();
    introTimeline
        .from(fullSVG, 1 * speed, { scale: 0, rotation: '120', ease: SteppedEase.config(12), y: -500 })
        .staggerFrom('.element', 0.5, { scale: 0, rotation: '120', ease: Back.easeOut.config(1.7), y: -500 }, 0.1)
        .from(sun, 0.51 * speed, { scale: 0, rotation: '100', ease: Elastic.easeOut })
        .fromTo(shadow, 0.2 * speed, { opacity: 0, ease: Linear.easeNone }, { opacity: 0, ease: Linear.easeNone })
        .to(earth, 0.2 * speed, { y: '0%', ease: Linear.easeNone, onComplete: floating })
        .from(toggleButton, 0.5 * speed, { scale: 0 });
    window['introTimeline'] = introTimeline;

    function floating() {
        TweenMax.fromTo(shadow, 3, { opacity: 0, ease: Linear.easeNone }, { opacity: 0.1, ease: Linear.easeNone, yoyo: true, repeat: -1 });
        TweenMax.fromTo(earth, 3, { y: '0%', ease: Linear.easeNone }, {
            y: '3%', ease: Linear.easeNone, yoyo: true, repeat: -1
        });
    }



    function toggleBox() {
        let checkbox = document.getElementById('toggleCheckbox') as HTMLInputElement;
        checkbox.onchange = function () {
            if (this.checked) {
                console.log('night');
                TweenMax.to(bg, 0.5, { backgroundColor: '#2c3e50', ease: Linear.easeOut });
                TweenMax.to(sun, 1, { fill: '#ffffff', scale: 2, rotation: '120', x: '-20%' });
                TweenMax.to('.windows', 1, { fill: '#e3be00', ease: Elastic.easeOut });
                TweenMax.to('.vegetation', 1, { fill: '#955ca2', ease: Linear.easeOut });
                TweenMax.to('.topGrass', 1, { fill: '#a679d1', ease: Linear.easeOut });
                TweenMax.to('.greyRoad', 1, { fill: '#c8b1c0', ease: Linear.easeOut });
                TweenMax.to('.treeWood', 1, { fill: '#5a749b', ease: Linear.easeOut });
                TweenMax.to('.leftWall', 1, { fill: '#5a749b', ease: Linear.easeOut });
                TweenMax.to('.windowRims', 1, { stroke: '#334e97', ease: Linear.easeOut });
                TweenMax.to('.leftRoof', 1, { fill: '#72bad8', ease: Linear.easeOut });
                TweenMax.to('.rightRoof', 1, { fill: '#5199b7', ease: Linear.easeOut });
                TweenMax.to('.frontWall', 1, { fill: '#4d6992', ease: Linear.easeOut });
                TweenMax.to('.frontFascia', 1, { fill: '#8ba2df', ease: Linear.easeOut });
                TweenMax.to('.door', 1, { fill: '#334e97', ease: Linear.easeOut });
                TweenMax.to('.leftSideGrass', 1, { fill: '#8f5897', ease: Linear.easeOut });
                TweenMax.to('.rightGrassTop', 1, { fill: '#8f5897', ease: Linear.easeOut });
                TweenMax.to('.crustLeftTop', 1, { fill: '#607489', ease: Linear.easeOut });
                TweenMax.to('.middleLeftCrust', 1, { fill: '#899cbe', ease: Linear.easeOut });
                TweenMax.to('.topRightCrust', 1, { fill: '#5a6498', ease: Linear.easeOut });
                TweenMax.to('.middleRightCrust', 1, { fill: '#7c83c0', ease: Linear.easeOut });

            } else {
                TweenMax.to(bg, 0.51, { backgroundColor: '#469CCE', ease: Bounce.easeOut });
                TweenMax.to(sun, 0.51, { fill: '#e3be00', scale: 1, rotation: '0', x: '0%' });
                TweenMax.to('.windows', 1, { fill: '#975A42', ease: Elastic.easeOut });
                TweenMax.to('.vegetation', 1, { fill: '#77a951', ease: Linear.easeOut });
                TweenMax.to('.topGrass', 1, { fill: '#b9d668', ease: Linear.easeOut });
                TweenMax.to('.greyRoad', 1, { fill: '#b2b2b1', ease: Linear.easeOut });
                TweenMax.to('.treeWood', 1, { fill: '#ae663d', ease: Linear.easeOut });
                TweenMax.to('.leftWall', 1, { fill: '#C57F42', ease: Linear.easeOut });
                TweenMax.to('.windowRims', 1, { stroke: '#AE663D', ease: Linear.easeOut });
                TweenMax.to('.leftRoof', 1, { fill: '#F2563B', ease: Linear.easeOut });
                TweenMax.to('.rightRoof', 1, { fill: '#F2563B', ease: Linear.easeOut });
                TweenMax.to('.frontWall', 1, { fill: '#EFA258', ease: Linear.easeOut });
                TweenMax.to('.frontFascia', 1, { fill: '#ECB27B', ease: Linear.easeOut });
                TweenMax.to('.door', 1, { fill: '#B65041', ease: Linear.easeOut });
                TweenMax.to('.leftSideGrass', 1, { fill: '#6e9e4f', ease: Linear.easeOut });
                TweenMax.to('.rightGrassTop', 1, { fill: '#8cb154', ease: Linear.easeOut });
                TweenMax.to('.crustLeftTop', 1, { fill: '#96563d', ease: Linear.easeOut });
                TweenMax.to('.middleLeftCrust', 1, { fill: '#c67e5c', ease: Linear.easeOut });
                TweenMax.to('.topRightCrust', 1, { fill: '#a5732a', ease: Linear.easeOut });
                TweenMax.to('.middleRightCrust', 1, { fill: '#5a6498', ease: Linear.easeOut });
                TweenMax.to('.middleRightCrust', 1, { fill: '#c89451', ease: Linear.easeOut });
            }
        };
    }

    document.getElementById('toggleCheckbox').addEventListener('click', toggleBox);
})();

// import '../GSDevTools.min.js';
// declare const GSDevTools;
// GSDevTools.create();
