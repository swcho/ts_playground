
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';
import * as Rx from 'rxjs';

'use strict';

/*********************
 *    Helpers Code
 ********************/
/**
 *  @function DOMReady
 *  @note Function for start script after DOM has been launched
 *
 *  @param {Function} callback - Set launcher function
 *  @param {Object} element - Set document object
 *  @param {String} listener - Set event name
 *
 *  @returns {*}
 */
const DOMReady = ((
    callback = () => { },
    element = document,
    listener = 'addEventListener'
) => {
    return (element[listener] ? element[listener]('DOMContentLoaded', callback) : window.addEventListener('onload', callback));
});

type Options = {
    callback: (position: { x: number; y: number; }, clientWidth: number, clientHeight: number) => void;
};

/*********************
 *    Application Code
 ********************/
/**
 *  @class RxAnimation
 *
 *  @type {{RxAnimation: RxAnimation.RxAnimation, launch: launch}}
 */
class RxAnimation {

	/**
	 *  @constructor
	 *
	 *  @param {Object} options - Set options: {
	 *      callback: {Function}
	 *  }
	 *
	 *  @returns {RxAnimation}
	 */
    constructor(private rxOptions: Options) {
        return this;
    }

	/**
	 *  @function launch
	 *
	 *  @returns undefined
	 */
    launch() {

        let rxCallback;

        rxCallback = this.rxOptions.callback;

        if (Rx && rxCallback) {

            const documentElement = document.documentElement;

            const { clientWidth, clientHeight } = documentElement;

            const mouseMove$ = Rx.Observable
                .fromEvent<MouseEvent>(documentElement, 'mousemove')
                .map(e => ({ x: e.clientX, y: e.clientY }));

            const touchMove$ = Rx.Observable
                .fromEvent<TouchEvent>(documentElement, 'touchmove')
                .map(e => ({ x: e.touches[0].clientX, y: e.touches[0].clientY }));

            const move$ = Rx.Observable.merge(mouseMove$, touchMove$);

            const animationFrame$ = Rx.Observable.interval(10, Rx.Scheduler.animationFrame);

            const smoothMove$ = animationFrame$
                .withLatestFrom(move$, function smoothMoveWithLatestFrom(tick, move) {

                    return move;
                })
                .scan(function smoothMoveScan(start, end) {

                    const dX = end.x - start.x;
                    const dY = end.y - start.y;

                    return {
                        x: start.x + dX * .1,
                        y: start.y + dY * .1
                    };
                });


            smoothMove$.subscribe(function smoothMoveSubscribe(position) {

                rxCallback(position, clientWidth, clientHeight);
            });
        }
    }
};

Object.freeze(RxAnimation);


type CardOptions = {
    $element: HTMLElement;
    elementHeight: number;
};

/**
 *  @class CardAnimation
 *
 *  @type {{CardAnimation: CardAnimation.CardAnimation, start: start}}
 */
class CardAnimation {

	/**
	 *  @constructor
	 *
	 *  @param {Object} options - Set options: {
	 *      $element: {DOM},
	 *      elementHeight: {Number}
	 *  }
	 *
	 *  @returns {CardAnimation}
	 */
    constructor(private cardOptions: CardOptions) {
        return this;
    }

	/**
	 *  @function start
	 *
	 *  @returns undefined
	 */
    start() {

        const $cardElement = this.cardOptions.$element;
        const cardHeight = this.cardOptions.elementHeight;

        if ($cardElement && cardHeight && RxAnimation) {
            const rxAnimation = new RxAnimation({
                callback: function cardStartCallback(position, clientWidth, clientHeight) {
                    const rotateX = (position.y / clientHeight * -cardHeight) + cardHeight / 2;
                    const rotateY = (position.x / clientWidth * cardHeight) - cardHeight / 2;
                    $cardElement.style.cssText = `transform: rotateX(${rotateX}deg) rotateY(${rotateY}deg);`;
                }
            });
            rxAnimation.launch();
        }
    }
};


/**
 *  @function readyFunction
 *
 *  @type {Function|readyFunction}
 *
 *  @returns undefined
 */
const readyFunction = (function readyFunction() {

    const ELEMENT_HEIGHT = 50;
    const cardAnimation = new CardAnimation({
        $element: document.querySelector('.js__card--animation'),
        elementHeight: ELEMENT_HEIGHT
    });

    cardAnimation.start();
});


/**
 *  Launcher
 */
DOMReady(readyFunction);
