
import util from './utils';

function randomMinMax(min: number, max: number): number {
    return Math.round(Math.random() * (max - min) + min);
}

function getCSSValueAsNumber(el: HTMLElement, props: keyof CSSStyleDeclaration) {
    return parseInt(getComputedStyle(el)[props]);
}

/**
 * Control animations of an element's children
 */
export class Animator {

    private container: HTMLElement;
    private _removeClassTimer;

    /**
     * The available animation effects and their settings
     * @type {Object}
     */
    static effects = {
        roll: {
            delays: { shift: 100 }
        },
        slide: {
            delays: { shift: 100 }
        },
        swivel: {
            delays: { shift: 100, random: true }
        },
        peel: {
            delays: { shift: 70 }
        },
        wave: {
            delays: { shift: 30 }
        },
        wave2: {
            delays: { shift: 120 }
        },
        hop: {
            delays: { shift: 140 }
        },
        converge: {
            delays: { shift: false }
        },
        fade: {
            delays: { shift: 80, random: true }
        },
        snow: {
            delays: { shift: 600, random: true }
        },
        spiral: {
            delays: { shift: 100 }
        },
        meteorite: {
            delays: { shift: 50, random: true }
        },
        bounce: {
            delays: { shift: 200, random: true }
        },
        float: {
            delays: { shift: 400, random: true }
        },
        bubble: {
            delays: { shift: { min: 200, max: 500 }, random: true }
        },
    };

	/**
	 * Constructor
	 * @param  {Element|string} el the container element whose children are being animated
	 */
    constructor(el) {
        this.container = el;
        this._removeClassTimer = null;

        // this.container.addEventListener('animationend', () => {
        // 	clearTimeout(this._removeClassTimer);
        // 	this._removeClassTimer = setTimeout(() => {
        // 		this.container.classList.remove('anim');
        // 	}, 900);
        // });
    }


	/**
	 * Run animation using the effect
	 * @param  {string} effect effect name
	 */
    animate(effect) {
        console.log('animate', effect);
        const cont = this.container;
        if (cont.classList.contains('anim')) {
            cont.classList.remove('anim');
            setTimeout(() => {
                this.animate(effect);
            }, 50);
            return;
        }
        clearTimeout(this._removeClassTimer);
        cont.classList.add('anim');
        if (cont.dataset.effect === effect && !('changed' in cont.dataset)) return;
        cont.dataset.effect = effect;
        delete cont.dataset.changed;
        // if(effect !== 'converge'/* && effect !== 'spiral'*/ && effect !== 'meteorite') {
        // 	Array.prototype.forEach.call(cont.children, function(el) {
        // 		el.style.transform = '';
        // 	});
        // }
        if (!Animator.effects[effect]) {
            throw new Error(`Animator: effect ${effect} is not defined`);
        }
        if (Animator.effects[effect].delays) {
            this.distributeDelays(Animator.effects[effect].delays);
        } else {
            this.distributeDelays({ shift: false });
        }
    }


	/**
	 * Distribute animation delays
	 * @param  {Object} opts           options
	 * @param  {Object} opts.shift     shift each next item this much milliseconds
	 * @param  {Object} [opts.random]  distribute delays randomly: without regard to document order
	 * @param  {Object} [opts.reverse] distribute delays in reverse document order starting with the last element
	 */

    distributeDelays(opts) {
        console.log('distributeDelays', opts);
        let shift = opts.shift || 100,
            curShift = 0,
            els = Array.from(this.container.children);

        if (opts.random) {
            let newEls = [];
            for (let j = 0, l = els.length; j < l; j++) {
                let i = Math.floor(Math.random() * els.length);
                newEls.push(els.splice(i, 1)[0]);
            }
            els = newEls;
        }

        if (opts.reverse) {
            els = els.reverse();
        }

        els.forEach((el: HTMLElement) => {
            curShift += typeof shift === 'number' ? shift : randomMinMax(shift.min, shift.max);
            const elInnerLetter = el.querySelector('.letter-inner') as HTMLElement;
            el.style.animationDelay = elInnerLetter.style.animationDelay = '';
            if (shift === false) return;
            const letterAnimationDelay = getCSSValueAsNumber(el, 'animationDelay');
            el.style.animationDelay = (letterAnimationDelay + curShift / 1000) + 's';
            const innerAnimationDelay = getCSSValueAsNumber(elInnerLetter, 'animationDelay');
            elInnerLetter.style.animationDelay = (innerAnimationDelay + curShift / 1000) + 's';
        });
    }


	/**
	 * Distribute children's offset positions
	 * We are currently doing this in Sass
	 * @param  {Object} opts options
	 */
    distributeOffsets(opts) {
        console.log('distributeOffsets', opts);
        let coords,
            alpha = opts.minAngle || 0,
            x = 100,
            y = 100,
            els = this.container.children;

        for (let i = 0; i < els.length; i++) {
            if (opts.dx || opts.dy) {
                x -= opts.dx || 0;
                y -= opts.dy || 0;
            } else {
                if (opts.random) {
                    alpha = Math.random() * (opts.maxAngle || 360 - opts.minAngle || 0) + opts.minAngle || 0;
                    coords = util.math.polarToDecart(alpha, 100);
                } else {
                    coords = util.math.polarToDecart(alpha, 100);
                    alpha += opts.dAlpha;
                }
                x = coords.x;
                y = coords.y;
            }
            (els[i] as HTMLElement).style.transform = 'translate(' + x.toFixed(3) + 'vmax,' + y.toFixed(3) + 'vmax)';
        }
    }
}
