
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


// Content editable test
const elCETest = document.querySelector('.cetest');
// elCETest.addEventListener('keydown', function(e) {
//     const sel = document.getSelection();
//     console.log('keydown', sel);
// });

const logKeyUp = false;

elCETest.addEventListener('keyup', function(e: KeyboardEvent) {
    if (logKeyUp) {
        const sel = document.getSelection();
        console.log('keyup', sel, e);
        console.log('  type', sel.type);
        console.log('  isCollapsed', sel.isCollapsed);
        console.log('  rangeCount', sel.rangeCount);
        if (sel.rangeCount) {
            const range = sel.getRangeAt(0);
            console.log(range);
        }
        if (e.key === 'a') {
            sel.selectAllChildren(elCETest);
        }
    }
});

['compositionstart', 'compositionupdate', 'compositionend', 'keydown', 'keyup']
    .forEach(function (event) {
        elCETest.addEventListener(event, function (ev: any) {
            // log.textContent += event + ': ' + (ev.data || ev.keyCode) + '\n';
            console.log(event, ev.data || ev.keyCode);
        }, true);
    })
    ;

// window.addEventListener('selectestart', function(e) {
//     console.log('selectestart', e);
// });

// window.addEventListener('selecteend', function(e) {
//     console.log('selecteend', e);
// });

// elCETest.addEventListener('mousedown', function(e) {
//     const sel = document.getSelection();
//     console.log('mousedown', sel);
// });

