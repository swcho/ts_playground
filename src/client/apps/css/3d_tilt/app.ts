
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/petebarr/pen/GvKgvQ

import './style.scss';
import * as $ from 'jquery';
import {TweenMax, Expo} from 'gsap';

declare module 'gsap' {
    export interface TweenConfig {
        rotationY: number;
        rotationX: number;
        transformPerspective: number;
        transformOrigin: string;
    }
}

    interface TweenConfig {
        rotationY;
    }

let $body = $('body'),
    $panel = $('.panel'),
    $pContent = $('.panel__content'),
    $img = $('.panel__img-col');

function initTilt() {
    TweenMax.set([$pContent, $img], { transformStyle: 'preserve-3d' });

    $body.mousemove(function (e) {
        let sxPos = e.pageX / $panel.width() * 100 - 100;
        let syPos = e.pageY / $panel.height() * 100 - 100;
        TweenMax.to($pContent, 2, {
            rotationY: 0.03 * sxPos,
            rotationX: -0.03 * syPos,
            transformPerspective: 500,
            transformOrigin: 'center center -400',
            ease: Expo.easeOut
        });
        TweenMax.to($img, 2, {
            rotationY: 0.03 * sxPos,
            rotationX: -0.03 * syPos,
            transformPerspective: 500,
            transformOrigin: 'center center -200',
            ease: Expo.easeOut
        });
    });
    $body.mouseleave(function(e) {
        TweenMax.to($pContent, 2, {
            rotationY: 0,
            rotationX: 0,
            transformPerspective: 500,
            transformOrigin: 'center center -400',
            ease: Expo.easeOut
        });
        TweenMax.to($img, 2, {
            rotationY: 0,
            rotationX: 0,
            transformPerspective: 500,
            transformOrigin: 'center center -200',
            ease: Expo.easeOut
        });
    });
};

initTilt();

console.clear();
