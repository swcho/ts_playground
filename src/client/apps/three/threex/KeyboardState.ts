
// https://stemkoski.github.io/Three.js/js/THREEx.KeyboardState.js

// THREEx.KeyboardState.js keep the current state of the keyboard.
// It is possible to query it at any time. No need of an event.
// This is particularly convenient in loop driven case, like in
// 3D demos or games.
//
// # Usage
//
// **Step 1**: Create the object
//
// ```var keyboard	= new THREEx.KeyboardState();```
//
// **Step 2**: Query the keyboard state
//
// This will return true if shift and A are pressed, false otherwise
//
// ```keyboard.pressed("shift+A")```
//
// **Step 3**: Stop listening to the keyboard
//
// ```keyboard.destroy()```
//
// NOTE: this library may be nice as standaline. independant from three.js
// - rename it keyboardForGame
//
// # Code
//

/** @namespace */

/**
 * - NOTE: it would be quite easy to push event-driven too
 *   - microevent.js for events handling
 *   - in this._onkeyChange, generate a string from the DOM event
 *   - use this as event name
*/
export class KeyboardState {

    static MODIFIERS = ['shift', 'ctrl', 'alt', 'meta'];
    static ALIAS = {
        'left': 37,
        'up': 38,
        'right': 39,
        'down': 40,
        'space': 32,
        'pageup': 33,
        'pagedown': 34,
        'tab': 9
    };

    private keyCodes = {};
    private modifiers = {};
    private _onKeyDown;
    private _onKeyUp;

    constructor() {
        // to store the current state
        this.keyCodes = {};
        this.modifiers = {};

        // bind keyEvents
        document.addEventListener('keydown', (evt) => {
            this._onKeyChange(evt, true);
        }, false);
        document.addEventListener('keyup', (evt) => {
            this._onKeyChange(evt, false);
        }, false);
    }

    /**
     * To stop listening of the keyboard events
    */
    destroy() {
        // unbind keyEvents
        document.removeEventListener('keydown', this._onKeyDown, false);
        document.removeEventListener('keyup', this._onKeyUp, false);
    }

    /**
     * to process the keyboard dom event
    */
    _onKeyChange(event, pressed) {
        // log to debug
        // console.log("onKeyChange", event, pressed, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)

        // update this.keyCodes
        const keyCode = event.keyCode;
        this.keyCodes[keyCode] = pressed;

        // update this.modifiers
        this.modifiers['shift'] = event.shiftKey;
        this.modifiers['ctrl'] = event.ctrlKey;
        this.modifiers['alt'] = event.altKey;
        this.modifiers['meta'] = event.metaKey;
    }

    /**
     * query keyboard state to know if a key is pressed of not
     *
     * @param {String} keyDesc the description of the key. format : modifiers+key e.g shift+A
     * @returns {Boolean} true if the key is pressed, false otherwise
    */
    pressed(keyDesc) {
        let keys = keyDesc.split('+');
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let pressed;
            if (KeyboardState.MODIFIERS.indexOf(key) !== -1) {
                pressed = this.modifiers[key];
            } else if (Object.keys(KeyboardState.ALIAS).indexOf(key) !== -1) {
                pressed = this.keyCodes[KeyboardState.ALIAS[key]];
            } else {
                pressed = this.keyCodes[key.toUpperCase().charCodeAt(0)];
            }
            if (!pressed) return false;
        };
        return true;
    };
}
