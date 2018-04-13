
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import * as Rx from 'rxjs';
import * as Hammer from 'hammerjs';

/**
 * For a more detailed explanation see:
 *  http://varun.ca/drag-with-rxjs/
 */

// Dom Nodes
const moveEl: HTMLDivElement = document.querySelector('#js-move');
const VIEWBOX_SIZE = { W: 600, H: 600 };

const animationFrame$ = Rx.Observable.interval(0, Rx.Scheduler.animationFrame);

/**
 * Create an observable stream to handle drag gesture
 */
const drag = (element: Element, pan$: Rx.Observable<HammerInput>, onStart, onEnd ) => {
    const panStart$ = pan$.filter(e => e.type === 'panstart');
    const panMove$ = pan$.filter(e => e.type === 'panmove');
    const panEnd$ = pan$.filter(e => e.type === 'panend');

    return panStart$.switchMap(() => {
        // Get the starting point on panstart
        const { start, w, h } = getStartInfo(element);
        onStart();

        // Create observable to handle pan-move
        // and stop on pan-end
        const move$ = panMove$
            .map(scaleToCanvas({ start, w, h }))
            .takeUntil(panEnd$);

        // We can subscribe to move$ and
        // handle cleanup in the onComplete callback
        move$.subscribe(null, null, onEnd);

        return move$;
    });
};

/**
 * Generate the drag handler for a DOM element
 */
function handleDrag(element: HTMLElement) {
    // Create a new Hammer Manager
    const hammerPan = new Hammer(element, {
        // direction: Hammer.DIRECTION_ALL
    });

    hammerPan.get('pan').set({ direction: Hammer.DIRECTION_ALL });

    // Convert hammer events to an observable
    const pan$ = Rx.Observable.fromEvent<HammerInput>(hammerPan, 'panstart panmove panend');
    // alternatively you can use fromEventPattern:
    // const pan$ = Rx.Observable.fromEventPattern(h =>
    //   hammerPan.on('panstart panmove panend', h),
    // );

    const drag$ = drag(
        element,
        pan$,
        () => element.setAttribute('r', 12 * 2),
        () => element.setAttribute('r', 12)
    );

    // Smooth the drag location using lerp
    return animationFrame$
        .withLatestFrom(drag$, (_, p) => p)
        .scan(lerp(0.05))
        .map(p => [p.x, p.y] as [number, number]);
}

/**
 * Utils
 */
function getStartInfo(element) {
    const start = {
        x: +element.getAttribute('cx'),
        y: +element.getAttribute('cy')
    };
    const w = document.body.clientWidth;
    const h = document.body.clientHeight;
    return { start, w, h };
}

function scaleToCanvas({ start: { x, y }, w, h }) {
    // Scale to account for SVG canvas with preserveAspectRatio="xMidYMid slice"
    const svgW = w > h ? VIEWBOX_SIZE.W : VIEWBOX_SIZE.W * w / h;
    const svgH = w > h ? VIEWBOX_SIZE.H * h / w : VIEWBOX_SIZE.H;

    return e => ({
        x: x + mapFromToRange(e.deltaX, 0, w, 0, svgW),
        y: y + mapFromToRange(e.deltaY, 0, h, 0, svgH)
    });
}

function mapFromToRange(x, x1, x2, y1, y2) {
    return (x - x1) * ((y2 - y1) / (x2 - x1)) + y1;
}

/**
 * Lerp
 * based on @davidkpiano's RXCSS
 * https://github.com/davidkpiano/RxCSS/blob/7817e419c98b1564195479f8b5e9c5dffb989f84/src/lerp.js
 */
function lerp(rate) {
    return ({ x, y }, targetValue) => {
        const mapValue = (value, tValue) => {
            const delta = (tValue - value) * rate;
            return value + delta;
        };

        return {
            x: mapValue(x, targetValue.x),
            y: mapValue(y, targetValue.y)
        };
    };
}

/**
 * Make a DOM element move
 */
const location$ = handleDrag(moveEl).startWith([200, 300]);

location$
    .map(([x, y]) => ({
        moveElLocation: [x, y] as [any, any]
    }))
    .subscribe(({ moveElLocation }) => {
        moveTo(moveElLocation, moveEl);
    });

function moveTo([x, y], element) {
    element.setAttribute('cx', x);
    element.setAttribute('cy', y);
}
