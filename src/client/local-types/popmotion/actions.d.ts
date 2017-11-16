
import {Easing} from './easing';

class Action {

    start();
    stop();
    complete();
    // get();
    // getVelocity();
}

class Tween extends Action {

}

interface Props {
    /**
     * The amount of time for the tween to take, in milliseconds.
     *
     * @type {number}
     * @memberof Props
     */
    duration: number;

    /**
     * Easing function.
     *
     * @type {Easing}
     * @memberof Props
     */
    ease: Easing;

    /**
     * The number to tween from. (default 0)
     *
     * @type {number}
     * @memberof Props
     */
    from: number;

    /**
     * The number to tween to. (default: 1)
     *
     * @type {number}
     * @memberof Props
     */
    to: number;

    /**
     * Number of times to flip tween on tween complete. (default: 0)
     *
     * @type {number}
     * @memberof Props
     */
    flip: number;

    /**
     * Number of times to restart tween from beginning on tween complete. (default: 0)
     *
     * @type {number}
     * @memberof Props
     */
    loop: number;

    /**
     * Number of times to reverse tween on tween complete. (default: 0)
     *
     * @type {number}
     * @memberof Props
     */
    yoyo: number;

}

/**
 * https://popmotion.io/api/action/
 *
 * @interface ActionProps
 * @extends {Props}
 */
interface ActionProps extends Props {

    /**
     * Fires every frame the value is updated.
     *
     * @memberof ActionProps
     */
    onUpdate: (v: number) => void;

    /**
     * Fires when an action starts.
     *
     * @memberof ActionProps
     */
    onStart: () => void;

    /**
     * Fires when an action is stopped.
     *
     * @memberof ActionProps
     */
    onStop: () => void;

    /**
     * Fires when an action is completed.
     *
     * @memberof ActionProps
     */
    onComplete: () => void;

    // transform: () => void;
}

export function tween(props: Partial<ActionProps>): Tween;

export function delay(duration: number, onComplete?: () => void): Tween;

class Parallel extends Action {

}

export function parallel(actions: Action[], props?: Partial<ActionProps>): Parallel;

class Chain extends Action {

}

export function chain(order: Action[], onComplete?: () => void): Chain;
