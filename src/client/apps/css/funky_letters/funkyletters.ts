
import util from './utils';

/**
 * Make a contenteditable element more controllable
 */
export class FunkyLetters {

    private container: HTMLElement;
    private options: Options;

	/**
	 * Constructor
	 * @param  {Element} el  document element with contenteditable=true or selector
	 * @param  {Object} [opts] options
	 */
    constructor(el, opts = {}) {
        if (typeof el === 'string') {
            el = document.querySelector(el);
        }
        this.container = el;
        this.options = opts;
        this._splitLetters();
        this._listenToInput();
    }


	/**
	 * Split container's text into one letter spans optionally colored
	 */
    _splitLetters() {
        this.container.innerHTML = FunkyLetters.splitTextLetters(this.container.textContent, this.options);
    }


	/**
	 * Split the text into one letter spans
	 * @param  {string} text input text
	 * @param  {Object} [opts] options
	 * @return {string}      html with text split into letters
	 */
    static splitTextLetters(text, opts = {}) {
        let letters;

        text = text.replace(/\s+/, ' ');
        letters = text.split(/(?=.)/);

        return letters.reduce((a, b) => a + FunkyLetters.makeLetterHtml(b, opts), '');
    }


	/**
	 * Generate html string for a letter
	 * @param  {string} letter single letter
	 * @param  {Object} [opts]   options
	 * @return {string}        html string
	 */
    static makeLetterHtml(letter, opts: Options = {}) {
        let style = '',
            className = 'char';

        if (/\s/.test(letter)) {
            letter = '&nbsp;';
            className += ' space';
        } else {
            className += ' letter';
        }
        if (opts.colorize) {
            style += 'color:' + util.color.random({ saturation: 100, lightness: 50 }) + ';';
        }

        return `<span class="${className}" ${style && 'style="' + style + '"'}><span class="letter-inner">${letter}</span></span>`;
    }


	/**
	 * Watch input
	 */
    _listenToInput() {
        let me = this;
        // this.container.dataset.text = this.container.textContent;
        let compositing = false;
        this.container.addEventListener('compositionstart', function (e) {
            compositing = true;
            console.log('compositionstart')
        });

        this.container.addEventListener('compositionend', function (e) {
            compositing = false;
            console.log('compositionend');
        });

        this.container.addEventListener('keydown', function (e) {
            // debugger;
        });

        this.container.addEventListener('keydown', function (e) {
            // debugger;

            if (compositing) {
                console.log('skip on compositing');
                return;
            }


            let letterEl = me.getFocusLetter();

            if (e.key.length === 1 && !e.altKey && !e.ctrlKey) {
                e.preventDefault();
                me.insertText(e.key);
                return;
            }

            // If the container is empty
            if (!letterEl) return;

            switch (e.key) {
                // Firefox focuses in two steps on inline-block elements
                case 'ArrowRight':
                    if (navigator.userAgent.indexOf('AppleWebKit') !== -1) break;
                    if (!letterEl.nextElementSibling) break;
                    e.preventDefault();
                    me.setFocus(letterEl.nextElementSibling, 1);
                    break;

                case 'ArrowLeft':
                    if (navigator.userAgent.indexOf('AppleWebKit') !== -1) break;
                    e.preventDefault();
                    if (!letterEl.previousElementSibling) {
                        me.setFocus(letterEl, 0);
                    } else {
                        me.setFocus(letterEl.previousElementSibling, 1);
                    }
                    break;

                case 'ArrowUp':
                case 'ArrowDown':
                    e.preventDefault();
                    break;

                case 'Home':
                case 'PageUp':
                    e.preventDefault();
                    me.setFocus(this.firstElementChild, 0);
                    break;

                case 'End':
                case 'PageDown':
                    e.preventDefault();
                    me.setFocus(this.lastElementChild, 1);
                    break;
            }
        });

        this.container.addEventListener('input', function (e) {
            // Firefox leaves empty containers when text is deleted. Make sure those are deleted too.
            me._cleanEmpty();
        });

        this.container.addEventListener('paste', function (e) {
            if (e.clipboardData.types.indexOf('text/plain') !== -1) {
                e.preventDefault();
                me.insertText(e.clipboardData.getData('text/plain'));
            }
        });
    }

	/**
	 * Format text and insert it into the container at the caret position
	 * @param  {string} text the text to insert
	 */
    insertText(text) {
        let sel = document.getSelection(),
            range = document.createRange(),
            node = this.getFocusLetter(),
            isBeforeNode = sel.focusOffset === 0;
        console.log('insertText', text, node, isBeforeNode);

        sel.deleteFromDocument();
        if (!node) {
            this.container.insertAdjacentHTML('afterbegin', FunkyLetters.splitTextLetters(text, this.options));
            this.setFocus(Array.from(this.container.querySelectorAll('.char')).pop(), 1);
        } else if (isBeforeNode) {
            node.insertAdjacentHTML('beforebegin', FunkyLetters.splitTextLetters(text, this.options));
            this.setFocus(node.previousElementSibling, 1);
        } else {
            node.insertAdjacentHTML('afterend', FunkyLetters.splitTextLetters(text, this.options));
            for (let i = text.length; i > 0 && node.nextElementSibling; i--) {
                node = node.nextElementSibling;
            }
            this.setFocus(node, node.textContent.length);
        }

        this.container.dataset.changed = 'true';
        this._cleanEmpty();
    }

	/**
	 * Get the character in focus (at caret position)
	 * @return {Element} the element node in focus
	 */
    getFocusLetter(): Element {
        const sel = document.getSelection() as any;
        return sel.anchorNode.closest ? sel.anchorNode.closest('.char') : sel.anchorNode.parentElement.closest('.char');
        // const ret = sel.anchorNode.parentElement.closest('.char');
        // console.log('getFocusLetter', sel, ret);
        // return ret;
    }

	/**
	 * Set cursor position
	 * @param {Element} node   letter element to focus on
	 * @param {Integer} offset offset. In our case, either 0 or 1
	 */
    setFocus(node, offset) {
        const sel = document.getSelection(),
            range = document.createRange();

        range.setStart(node, offset);
        sel.removeAllRanges();
        sel.addRange(range);
    }

	/**
	 * Delete elements other than .char the browser could have generated
	 */
    _cleanEmpty() {
        const focusLetter = this.getFocusLetter();
        Array.from(this.container.children).forEach(el => {
            if (el.classList.contains('char') && el.textContent) return;
            if (el === focusLetter) {
                if (el.previousElementSibling) {
                    this.setFocus(el, 1);
                } else if (el.nextElementSibling) {
                    this.setFocus(el.nextElementSibling, 1);
                }
            }
            el.remove();
        });
    }
}
