
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/mican/pen/dRWxZe

import './style.sass';
import * as $ from 'jquery';

declare namespace window {
    let magicFocus: any;
}

declare global {

    interface Array<T> {
        includes();
    }

    interface JQuery<TElement extends Node = HTMLElement> {
        customSelect();
    }

}


(function () {
    let magicFocus,
        bind = function (fn, me) { return function () { return fn.apply(me, arguments); }; };

    (function () {
        let logo, logo_css;
        logo = '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><title>codepen-logo</title><path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zM7.139 21.651l1.35-1.35a.387.387 0 0 0 0-.54l-3.49-3.49a.387.387 0 0 0-.54 0l-1.35 1.35a.39.39 0 0 0 0 .54l3.49 3.49a.38.38 0 0 0 .54 0zm6.922.153l2.544-2.543a.722.722 0 0 0 0-1.018l-6.582-6.58a.722.722 0 0 0-1.018 0l-2.543 2.544a.719.719 0 0 0 0 1.018l6.58 6.579c.281.28.737.28 1.019 0zm14.779-5.85l-7.786-7.79a.554.554 0 0 0-.788 0l-5.235 5.23a.558.558 0 0 0 0 .789l7.79 7.789c.216.216.568.216.785 0l5.236-5.236a.566.566 0 0 0 0-.786l-.002.003zm-3.89 2.806a.813.813 0 1 1 0-1.626.813.813 0 0 1 0 1.626z" fill="#FFF" fill-rule="evenodd"/></svg>';
        logo_css = '.mM{display:block;border-radius:50%;box-shadow:0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);position:fixed;bottom:1em;right:1em;-webkit-transform-origin:50% 50%;transform-origin:50% 50%;-webkit-transition:all 240ms ease-in-out;transition:all 240ms ease-in-out;z-index:9999;opacity:0.75}.mM svg{display:block}.mM:hover{opacity:1;-webkit-transform:scale(1.125);transform:scale(1.125)}';
        document.head.insertAdjacentHTML('beforeend', '<style>' + logo_css + '</style>');
        document.body.insertAdjacentHTML('beforeend', '<a href="https://codepen.io/mican/" target="_blank" class="mM">' + logo + '</a>');
    })();

    magicFocus = (function () {
        function magicFocus(parent: HTMLElement) {
            let i, input, len, ref;
            this.parent = parent;
            this.hide = bind(this.hide, this);
            this.show = bind(this.show, this);
            if (!this.parent) {
                return;
            }
            this.focus = document.createElement('div');
            this.focus.classList.add('magic-focus');
            this.parent.classList.add('has-magic-focus');
            this.parent.appendChild(this.focus);
            ref = this.parent.querySelectorAll('input, textarea, select');
            for (i = 0, len = ref.length; i < len; i++) {
                input = ref[i];
                input.addEventListener('focus', function () {
                    return window.magicFocus.show();
                });
                input.addEventListener('blur', function () {
                    return window.magicFocus.hide();
                });
            }
        }

        magicFocus.prototype.show = function () {
            let base, base1, el;
            if (!(typeof (base = ['INPUT', 'SELECT', 'TEXTAREA']).includes === 'function' ? base.includes((el = document.activeElement).nodeName) : void 0)) {
                return;
            }
            clearTimeout(this.reset);
            if (typeof (base1 = ['checkbox', 'radio']).includes === 'function' ? base1.includes(el.type) : void 0) {
                el = document.querySelector('[for=' + el.id + ']');
            }
            this.focus.style.top = (el.offsetTop || 0) + 'px';
            this.focus.style.left = (el.offsetLeft || 0) + 'px';
            this.focus.style.width = (el.offsetWidth || 0) + 'px';
            return this.focus.style.height = (el.offsetHeight || 0) + 'px';
        };

        magicFocus.prototype.hide = function () {
            let base, el;
            if (!(typeof (base = ['INPUT', 'SELECT', 'TEXTAREA', 'LABEL']).includes === 'function' ? base.includes((el = document.activeElement).nodeName) : void 0)) {
                this.focus.style.width = 0;
            }
            return this.reset = setTimeout(function () {
                return window.magicFocus.focus.removeAttribute('style');
            }, 200);
        };

        return magicFocus;

    })();

    window.magicFocus = new magicFocus(document.querySelector('.form'));

    $(function () {
        return $('.select').customSelect();
    });

}).call(this);
