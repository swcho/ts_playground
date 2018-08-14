
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';
const container = [].slice.call(document.querySelectorAll<HTMLDivElement>('.box-cont'));

// https://gist.github.com/kritollm/bdaa485cf81bbde304b618b7b7d5e2ea
declare global {
    // UPDATE: The types is ready. npm install @types/web-animation-js
    // I leave this as an refference for the w3c specs
    // I coldn't find any definition file. This is a work in progress and it's my first d.ts file so the gist will be updated.
    // The latest spec and the latest web-animations-js polyfill isn't compatible, so I will try to make it more web-animations-js compatible.
    // interface DocumentTimelineOptions {
    //     originTime: DOMHighResTimeStamp;
    // }
    // type FillMode = 'none' | 'forwards' | 'backwards' | 'both' | 'auto';
    // type IterationCompositeOperation = 'replace' | 'accumulate';

    // type PlaybackDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    // type AnimationPlayState = 'idle' | 'pending' | 'running' | 'paused' | 'finished';
    // type CompositeOperation = 'replace' | 'add' | 'accumulate';
    // type DOMHighResTimeStamp = number;

    // interface AnimationEffectTimingProperties {
    //     delay?: number;
    //     endDelay?: number;
    //     fill?: FillMode;
    //     iterationStart?: number;
    //     iterations?: number;
    //     duration?: number;
    //     direction?: PlaybackDirection;
    //     easing?: string;
    // }

    // interface ComputedTimingProperties extends AnimationEffectTimingProperties {
    //     endTime: number;
    //     activeDuration: number;
    //     localTime: number;
    //     progress: number;
    //     currentIteration: number;
    // }

    // interface BaseComputedKeyframe {
    //     offset: number;
    //     computedOffset: number;
    //     easing: string;
    //     composite: number;
    // }

    // interface BasePropertyIndexedKeyframe {
    //     easing: string;
    //     composite: number;
    // }

    // interface BaseKeyframe {
    //     offset: number;
    //     easing: string;
    //     composite: CompositeOperation;
    // }

    // interface KeyframeEffectOptions extends AnimationEffectTimingProperties {
    //     iterationComposite?: IterationCompositeOperation;
    //     composite?: CompositeOperation;
    //     spacing?: string;
    // }

    // interface KeyframeAnimationOptions extends KeyframeEffectOptions {
    //     id: string;
    // }

    // interface AnimationPlaybackEventInit extends EventInit {
    //     currentTime: number;
    //     timelineTime: number;
    // }

    // interface AnimationTimeline {
    //     currentTime: number;
    // }

    // interface DocumentTimeline extends AnimationTimeline {
    //     $__dummyprop__DocumentTimeline: any;
    // }

    // interface Animation extends EventTarget {
    //     id: string;
    //     effect: AnimationEffectReadOnly;
    //     timeline?: AnimationTimeline;
    //     startTime: number;
    //     currentTime: number;
    //     playbackRate: number;
    //     playState: AnimationPlayState;
    //     ready: Promise<Animation>;
    //     finished: Promise<Animation>;
    //     onfinish: EventListener;
    //     oncancel: EventListener;
    //     cancel(): void;
    //     finish(): void;
    //     play(): void;
    //     pause(): void;
    //     reverse(): void;
    // }

    // interface AnimationEffectReadOnly {
    //     timing: AnimationEffectTimingReadOnly;
    //     getComputedTiming(): ComputedTimingProperties;
    // }

    // interface AnimationEffectTimingReadOnly {
    //     delay?: number;
    //     endDelay?: number;
    //     fill?: FillMode;
    //     iterationStart?: number;
    //     iterations?: number;
    //     duration?: number | 'auto';
    //     direction?: PlaybackDirection;
    //     easing?: string;
    // }

    // interface AnimationEffectTiming extends AnimationEffectTimingReadOnly {
    // }

    // interface KeyframeEffectReadOnly extends AnimationEffectReadOnly {
    //     target: Animatable;
    //     iterationComposite: IterationCompositeOperation;
    //     composite: CompositeOperation;
    //     spacing: string;
    //     getKeyframes(): any[];
    //     // Polyfill still use getFrames
    //     getFrames(): any[];
    // }

    // class KeyframeEffect {
    //     constructor(keyframes: any);
    // }

    // interface KeyframeEffect extends KeyframeEffectReadOnly {
    //     setKeyframes(keyframes: any): void;
    // }


    // interface SharedKeyframeList {
    //     $__dummyprop__SharedKeyframeList: any;
    // }


    // interface Element {
    //     animate(keyframes: any, options: number | KeyframeEffectOptions): Animation;
    //     getAnimations(): Animation[];
    // }
    // interface Animatable extends Element {

    // }

    // interface AnimationPlaybackEvent extends Event {
    //     currentTime: number;
    //     timelineTime: number;
    // }

}

container.forEach((element) => {
    element.addEventListener('mouseenter', function (event) {
        const target = event.target as HTMLDivElement;
        const element = target.querySelector('.box');
        const coords = getCoords(target.getBoundingClientRect());
        const radius = circleSize(target.getBoundingClientRect(), coords);

        circleConstraints(element, coords, radius);
        animation(element);
    });

    element.addEventListener('mouseleave', function (event) {
        const target = event.target as HTMLDivElement;
        const element = target.querySelector('.box');
        animationLeave(element);
    });
});

function animation(element: Element) {
    const transform = [
        'scale(0)',
        'scale(1)'
    ] as any;
    const options: KeyframeEffectOptions = {
        duration: 600,
        fill: 'forwards',
        easing: 'cubic-bezier(.2, 1, .2, 1)',
        iterations: 1
    };
    element.animate({ transform } as any, options);
};

function animationLeave(element) {
    const transform = [
        'scale(1)',
        'scale(0)'
    ];
    const options = {
        duration: 400,
        fill: 'forwards',
        easing: 'cubic-bezier(.2, 1, .2, 1)',
        iterations: 1
    };
    element.animate({ transform }, options);
};

function getCoords(rectangle: ClientRect) {
    return {
        x: rectangle.width * Math.random(),
        y: rectangle.height * Math.random(),
    };
};

function circleSize(rectangle: ClientRect, coords) {
    const x1 = coords.x;
    const y1 = coords.y;
    const rectCoords = [
        { x: 0, y: 0 },
        { x: 0, y: rectangle.height },
        { x: rectangle.width, y: 0 },
        { x: rectangle.width, y: rectangle.height }
    ];

    return Math.max(...rectCoords.map((el) => {
        const x2 = el.x;
        const y2 = el.y;
        return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    }));
}

function circleConstraints(element, coords, radius) {
    element.style.height = radius * 2 + 'px';
    element.style.width = radius * 2 + 'px';
    element.style.top = coords.y - radius + 'px';
    element.style.left = coords.x - radius + 'px';
}
