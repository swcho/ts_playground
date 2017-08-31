
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

// https://codepen.io/tiggr/pen/owJrEa

/// <reference path='def.d.ts'/>
import './style.scss';
import {FunkyLetters} from './funkyletters';
import {Animator} from './animator';

'use strict';

const animationContainer = document.querySelector('.anim-text');

let config = localStorage['funkyLetters:config'];
try {
    config = JSON.parse(config);
} catch (e) {
    config = {
        completed: {}
    };
}

// Tips
if (config.completed.changeEffect) {
    document.querySelector('.tip-effect').classList.add('hide');
} else {
    document.querySelector('#selectEffect').addEventListener('change', () => {
        document.querySelector('.tip-effect').classList.add('hide');
        config.completed.changeEffect = true;
        localStorage['funkyLetters:config'] = JSON.stringify(config);
    }, { once: true } as any);
}

if (config.completed.type) {
    document.querySelector('.tip-type').classList.add('hide');
} else {
    animationContainer.addEventListener('keydown', () => {
        document.querySelector('.tip-type').classList.add('hide');
        config.completed.type = true;
        localStorage['funkyLetters:config'] = JSON.stringify(config);
    }, { once: true } as any);
}

if (config.completed.comeBack) {
    document.querySelector('.alert-come-back').classList.add('hide');
}


new FunkyLetters(animationContainer, { colorize: true });

const animator = new Animator(animationContainer);
animator.animate((document.querySelector('#selectEffect') as HTMLSelectElement).value);


// Listen to controls
document.querySelector('#selectEffect').addEventListener('change', function (e) {
    animator.animate(this.value);
});
document.querySelector('.animate').addEventListener('click', function (e) {
    animator.animate((document.querySelector('#selectEffect') as HTMLSelectElement).value);
});


// Animate on enter key
animationContainer.addEventListener('keydown', function (e: KeyboardEvent) {
    switch (e.keyCode) {
        case 13:
            e.preventDefault();
            (document.querySelector('.animate') as HTMLButtonElement).focus();
            (document.querySelector('.animate') as HTMLButtonElement).click();
            break;
    }
});


// Other
document.querySelector('.dismiss').addEventListener('click', function (e) {
    this.closest('.alert').classList.add('close');
    config.completed.comeBack = true;
    localStorage['funkyLetters:config'] = JSON.stringify(config);
});
