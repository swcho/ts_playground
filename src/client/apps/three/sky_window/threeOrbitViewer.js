(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
    addEventListener.removeEventListener = removeEventListener
    addEventListener.addEventListener = addEventListener

    module.exports = addEventListener

    var Events = null

    function addEventListener(el, eventName, listener, useCapture) {
      Events = Events || (
        document.addEventListener ?
        {add: stdAttach, rm: stdDetach} :
        {add: oldIEAttach, rm: oldIEDetach}
      )

      return Events.add(el, eventName, listener, useCapture)
    }

    function removeEventListener(el, eventName, listener, useCapture) {
      Events = Events || (
        document.addEventListener ?
        {add: stdAttach, rm: stdDetach} :
        {add: oldIEAttach, rm: oldIEDetach}
      )

      return Events.rm(el, eventName, listener, useCapture)
    }

    function stdAttach(el, eventName, listener, useCapture) {
      el.addEventListener(eventName, listener, useCapture)
    }

    function stdDetach(el, eventName, listener, useCapture) {
      el.removeEventListener(eventName, listener, useCapture)
    }

    function oldIEAttach(el, eventName, listener, useCapture) {
      if(useCapture) {
        throw new Error('cannot useCapture in oldIE')
      }

      el.attachEvent('on' + eventName, listener)
    }

    function oldIEDetach(el, eventName, listener, useCapture) {
      el.detachEvent('on' + eventName, listener)
    }

    },{}],2:[function(require,module,exports){
    module.exports = function numtype(num, def) {
        return typeof num === 'number'
            ? num
            : (typeof def === 'number' ? def : 0)
    }
    },{}],3:[function(require,module,exports){
    var isGL = require('is-webgl-context');
    var getGL = require('webgl-context');
    var debounce = require('debounce');
    var addEvent = require('add-event-listener');

    function isCanvasContext(obj) {
        var ctx2d = typeof CanvasRenderingContext2D !== 'undefined' && obj instanceof CanvasRenderingContext2D;
        return obj && (ctx2d || isGL(obj));
    }

    function CanvasApp(render, options) {
        if (!(this instanceof CanvasApp))
            return new CanvasApp(render, options);

        //allow options to be passed as first argument
        if (typeof render === 'object' && render) {
            options = render;
            render = null;
        }

        render = typeof render === 'function' ? render : options.onRender;

        options = options||{};
        options.retina = typeof options.retina === "boolean" ? options.retina : true;

        var hasWidth = typeof options.width === "number",
            hasHeight = typeof options.height === "number";

        //if either width or height is specified, don't auto-resize to the window...
        if (hasWidth || hasHeight)
            options.ignoreResize = true;

        options.width = hasWidth ? options.width : window.innerWidth;
        options.height = hasHeight ? options.height : window.innerHeight;

        var DPR = options.retina ? (window.devicePixelRatio||1) : 1;

        //setup the canvas
        var canvas,
            context,
            attribs = options.contextAttributes||{};

        this.isWebGL = false;

        //if user provided a context object
        if (isCanvasContext(options.context)) {
            context = options.context;
            canvas = context.canvas;
        }

        //otherwise allow for a string to set one up
        if (!canvas)
            canvas = options.canvas || document.createElement("canvas");

        canvas.width = options.width * DPR;
        canvas.height = options.height * DPR;

        if (!context) {
            if (options.context === "webgl" || options.context === "experimental-webgl") {
                context = getGL({ canvas: canvas, attributes: attribs });
                if (!context) {
                    throw "WebGL Context Not Supported -- try enabling it or using a different browser";
                }
            } else {
                context = canvas.getContext(options.context||"2d", attribs);
            }
        }

        this.isWebGL = isGL(context);

        if (options.retina) {
            canvas.style.width = options.width + 'px';
            canvas.style.height = options.height + 'px';
        }

        this.running = false;
        this.width = options.width;
        this.height = options.height;
        this.canvas = canvas;
        this.context = context;
        this.onResize = options.onResize;
        this._DPR = DPR;
        this._retina = options.retina;
        this._once = options.once;
        this._ignoreResize = options.ignoreResize;
        this._lastFrame = null;
        this._then = Date.now();
        this.maxDeltaTime = typeof options.maxDeltaTime === 'number' ? options.maxDeltaTime : 1000/24;

        //FPS counter
        this.fps = 60;
        this._frames = 0;
        this._prevTime = this._then;

        if (!this._ignoreResize) {
            options.resizeDebounce = typeof options.resizeDebounce === 'number'
                        ? options.resizeDebounce : 50;
            addEvent(window, "resize", debounce(function() {
                this.resize(window.innerWidth, window.innerHeight);
            }.bind(this), options.resizeDebounce, false));

            addEvent(window, "orientationchange", function() {
                this.resize(window.innerWidth, window.innerHeight);
            }.bind(this));
        }

        if (typeof render === "function") {
            this.onRender = render.bind(this);
        } else {
            //dummy render function
            this.onRender = function (context, width, height, dt) { };
        }

        this.renderOnce = function() {
            var now = Date.now();
            var dt = Math.min(this.maxDeltaTime, (now-this._then));

            this._frames++;
            if (now > this._prevTime + 1000) {
                this.fps = Math.round((this._frames * 1000) / (now - this._prevTime));

                this._prevTime = now;
                this._frames = 0;
            }

            if (!this.isWebGL) {
                this.context.save();
                this.context.scale(this._DPR, this._DPR);
            } else {
                this.context.viewport(0, 0, this.width * this._DPR, this.height * this._DPR);
            }

            this.onRender(this.context, this.width, this.height, dt);

            if (!this.isWebGL)
                this.context.restore();

            this._then = now;
        };

        this._renderHandler = function() {
            if (!this.running)
                return;

            if (!this._once) {
                this._lastFrame = requestAnimationFrame(this._renderHandler);
            }

            this.renderOnce();
        }.bind(this);

        if (typeof options.onReady === "function") {
            options.onReady.call(this, context, this.width, this.height);
        }
    }

    Object.defineProperty(CanvasApp.prototype, 'retinaEnabled', {

        set: function(v) {
            this._retina = v;
            this._DPR = this._retina ? (window.devicePixelRatio||1) : 1;
            this.resize(this.width, this.height);
        },

        get: function() {
            return this._retina;
        }
    });

    Object.defineProperty(CanvasApp.prototype, 'deviceWidth', {

        get: function() {
            return this.width * this._DPR;
        }
    });

    Object.defineProperty(CanvasApp.prototype, 'deviceHeight', {

        get: function() {
            return this.height * this._DPR;
        }
    });

    CanvasApp.prototype.resetFPS = function() {
        this._frames = 0;
        this._prevTime = Date.now();
        this._then = this._prevTime;
        this.fps = 60;
    };

    CanvasApp.prototype.start = function() {
        if (this.running)
            return;

        if (this._lastFrame)
            cancelAnimationFrame(this._lastFrame);

        //reset FPS counter
        this.resetFPS();

        this.running = true;
        this._lastFrame = requestAnimationFrame(this._renderHandler);
    };

    CanvasApp.prototype.stop = function() {
        if (this._lastFrame) {
            cancelAnimationFrame(this._lastFrame);
            this._lastFrame = null;
        }
        this.running = false;
    };

    CanvasApp.prototype.resize = function(width, height) {
        var canvas = this.canvas;

        this.width = width;
        this.height = height;
        canvas.width = this.width * this._DPR;
        canvas.height = this.height * this._DPR;

        if (this._retina) {
            canvas.style.width = this.width + 'px';
            canvas.style.height = this.height + 'px';
        }

        if (this._once)
            requestAnimationFrame(this._renderHandler);
        if (typeof this.onResize === "function")
            this.onResize(this.width, this.height);
    };

    module.exports = CanvasApp;
    },{"add-event-listener":1,"debounce":4,"is-webgl-context":6,"webgl-context":9}],4:[function(require,module,exports){
    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If `immediate` is passed, trigger the function on the
     * leading edge, instead of the trailing. The function also has a property 'clear'
     * that is a function which will clear the timer to prevent previously scheduled executions.
     *
     * @source underscore.js
     * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
     * @param {Function} function to wrap
     * @param {Number} timeout in ms (`100`)
     * @param {Boolean} whether to execute at the beginning (`false`)
     * @api public
     */

    module.exports = function debounce(func, wait, immediate){
      var timeout, args, context, timestamp, result;
      if (null == wait) wait = 100;

      function later() {
        var last = Date.now() - timestamp;

        if (last < wait && last >= 0) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
            context = args = null;
          }
        }
      };

      var debounced = function(){
        context = this;
        args = arguments;
        timestamp = Date.now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
          context = args = null;
        }

        return result;
      };

      debounced.clear = function() {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
      };

      return debounced;
    };

    },{}],5:[function(require,module,exports){
    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.

    function EventEmitter() {
      this._events = this._events || {};
      this._maxListeners = this._maxListeners || undefined;
    }
    module.exports = EventEmitter;

    // Backwards-compat with node 0.10.x
    EventEmitter.EventEmitter = EventEmitter;

    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._maxListeners = undefined;

    // By default EventEmitters will print a warning if more than 10 listeners are
    // added to it. This is a useful default which helps finding memory leaks.
    EventEmitter.defaultMaxListeners = 10;

    // Obviously not all Emitters should be limited to 10. This function allows
    // that to be increased. Set to zero for unlimited.
    EventEmitter.prototype.setMaxListeners = function(n) {
      if (!isNumber(n) || n < 0 || isNaN(n))
        throw TypeError('n must be a positive number');
      this._maxListeners = n;
      return this;
    };

    EventEmitter.prototype.emit = function(type) {
      var er, handler, len, args, i, listeners;

      if (!this._events)
        this._events = {};

      // If there is no 'error' event listener then throw.
      if (type === 'error') {
        if (!this._events.error ||
            (isObject(this._events.error) && !this._events.error.length)) {
          er = arguments[1];
          if (er instanceof Error) {
            throw er; // Unhandled 'error' event
          } else {
            // At least give some kind of context to the user
            var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
            err.context = er;
            throw err;
          }
        }
      }

      handler = this._events[type];

      if (isUndefined(handler))
        return false;

      if (isFunction(handler)) {
        switch (arguments.length) {
          // fast cases
          case 1:
            handler.call(this);
            break;
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
          // slower
          default:
            args = Array.prototype.slice.call(arguments, 1);
            handler.apply(this, args);
        }
      } else if (isObject(handler)) {
        args = Array.prototype.slice.call(arguments, 1);
        listeners = handler.slice();
        len = listeners.length;
        for (i = 0; i < len; i++)
          listeners[i].apply(this, args);
      }

      return true;
    };

    EventEmitter.prototype.addListener = function(type, listener) {
      var m;

      if (!isFunction(listener))
        throw TypeError('listener must be a function');

      if (!this._events)
        this._events = {};

      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (this._events.newListener)
        this.emit('newListener', type,
                  isFunction(listener.listener) ?
                  listener.listener : listener);

      if (!this._events[type])
        // Optimize the case of one listener. Don't need the extra array object.
        this._events[type] = listener;
      else if (isObject(this._events[type]))
        // If we've already got an array, just append.
        this._events[type].push(listener);
      else
        // Adding the second element, need to change to array.
        this._events[type] = [this._events[type], listener];

      // Check for listener leak
      if (isObject(this._events[type]) && !this._events[type].warned) {
        if (!isUndefined(this._maxListeners)) {
          m = this._maxListeners;
        } else {
          m = EventEmitter.defaultMaxListeners;
        }

        if (m && m > 0 && this._events[type].length > m) {
          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' +
                        'leak detected. %d listeners added. ' +
                        'Use emitter.setMaxListeners() to increase limit.',
                        this._events[type].length);
          if (typeof console.trace === 'function') {
            // not supported in IE 10
            console.trace();
          }
        }
      }

      return this;
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.once = function(type, listener) {
      if (!isFunction(listener))
        throw TypeError('listener must be a function');

      var fired = false;

      function g() {
        this.removeListener(type, g);

        if (!fired) {
          fired = true;
          listener.apply(this, arguments);
        }
      }

      g.listener = listener;
      this.on(type, g);

      return this;
    };

    // emits a 'removeListener' event iff the listener was removed
    EventEmitter.prototype.removeListener = function(type, listener) {
      var list, position, length, i;

      if (!isFunction(listener))
        throw TypeError('listener must be a function');

      if (!this._events || !this._events[type])
        return this;

      list = this._events[type];
      length = list.length;
      position = -1;

      if (list === listener ||
          (isFunction(list.listener) && list.listener === listener)) {
        delete this._events[type];
        if (this._events.removeListener)
          this.emit('removeListener', type, listener);

      } else if (isObject(list)) {
        for (i = length; i-- > 0;) {
          if (list[i] === listener ||
              (list[i].listener && list[i].listener === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (list.length === 1) {
          list.length = 0;
          delete this._events[type];
        } else {
          list.splice(position, 1);
        }

        if (this._events.removeListener)
          this.emit('removeListener', type, listener);
      }

      return this;
    };

    EventEmitter.prototype.removeAllListeners = function(type) {
      var key, listeners;

      if (!this._events)
        return this;

      // not listening for removeListener, no need to emit
      if (!this._events.removeListener) {
        if (arguments.length === 0)
          this._events = {};
        else if (this._events[type])
          delete this._events[type];
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        for (key in this._events) {
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = {};
        return this;
      }

      listeners = this._events[type];

      if (isFunction(listeners)) {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        while (listeners.length)
          this.removeListener(type, listeners[listeners.length - 1]);
      }
      delete this._events[type];

      return this;
    };

    EventEmitter.prototype.listeners = function(type) {
      var ret;
      if (!this._events || !this._events[type])
        ret = [];
      else if (isFunction(this._events[type]))
        ret = [this._events[type]];
      else
        ret = this._events[type].slice();
      return ret;
    };

    EventEmitter.prototype.listenerCount = function(type) {
      if (this._events) {
        var evlistener = this._events[type];

        if (isFunction(evlistener))
          return 1;
        else if (evlistener)
          return evlistener.length;
      }
      return 0;
    };

    EventEmitter.listenerCount = function(emitter, type) {
      return emitter.listenerCount(type);
    };

    function isFunction(arg) {
      return typeof arg === 'function';
    }

    function isNumber(arg) {
      return typeof arg === 'number';
    }

    function isObject(arg) {
      return typeof arg === 'object' && arg !== null;
    }

    function isUndefined(arg) {
      return arg === void 0;
    }

    },{}],6:[function(require,module,exports){
    /*globals WebGL2RenderingContext,WebGLRenderingContext*/
    module.exports = function isWebGLContext (ctx) {
      if (!ctx) return false
      var gl = ctx

      // compatibility with Chrome WebGL Inspector Addon
      if (typeof ctx.rawgl !== 'undefined') {
        gl = ctx.rawgl
      }
      if ((typeof WebGLRenderingContext !== 'undefined'
          && gl instanceof WebGLRenderingContext) ||
        (typeof WebGL2RenderingContext !== 'undefined'
          && gl instanceof WebGL2RenderingContext)) {
        return true
      }
      return false
    }

    },{}],7:[function(require,module,exports){
    module.exports = function(THREE) {
        var MOUSE = THREE.MOUSE
        if (!MOUSE)
            MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2 };

        /**
         * @author qiao / https://github.com/qiao
         * @author mrdoob / http://mrdoob.com
         * @author alteredq / http://alteredqualia.com/
         * @author WestLangley / http://github.com/WestLangley
         * @author erich666 / http://erichaines.com
         */
        /*global THREE, console */

        // This set of controls performs orbiting, dollying (zooming), and panning. It maintains
        // the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
        // supported.
        //
        //    Orbit - left mouse / touch: one finger move
        //    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
        //    Pan - right mouse, or arrow keys / touch: three finter swipe
        //
        // This is a drop-in replacement for (most) TrackballControls used in examples.
        // That is, include this js file and wherever you see:
        //      controls = new THREE.TrackballControls( camera );
        //      controls.target.z = 150;
        // Simple substitute "OrbitControls" and the control should work as-is.

        function OrbitControls ( object, domElement ) {

            this.object = object;
            this.domElement = ( domElement !== undefined ) ? domElement : document;

            // API

            // Set to false to disable this control
            this.enabled = true;

            // "target" sets the location of focus, where the control orbits around
            // and where it pans with respect to.
            this.target = new THREE.Vector3();

            // center is old, deprecated; use "target" instead
            this.center = this.target;

            // This option actually enables dollying in and out; left as "zoom" for
            // backwards compatibility
            this.noZoom = false;
            this.zoomSpeed = 1.0;

            // Limits to how far you can dolly in and out
            this.minDistance = 0;
            this.maxDistance = Infinity;

            // Set to true to disable this control
            this.noRotate = false;
            this.rotateSpeed = 1.0;

            // Set to true to disable this control
            this.noPan = false;
            this.keyPanSpeed = 7.0; // pixels moved per arrow key push

            // Set to true to automatically rotate around the target
            this.autoRotate = false;
            this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

            // How far you can orbit vertically, upper and lower limits.
            // Range is 0 to Math.PI radians.
            this.minPolarAngle = 0; // radians
            this.maxPolarAngle = Math.PI; // radians

            // How far you can orbit horizontally, upper and lower limits.
            // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
            this.minAzimuthAngle = - Infinity; // radians
            this.maxAzimuthAngle = Infinity; // radians

            // Set to true to disable use of the keys
            this.noKeys = false;

            // The four arrow keys
            this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

            // Mouse buttons
            this.mouseButtons = { ORBIT: MOUSE.LEFT, ZOOM: MOUSE.MIDDLE, PAN: MOUSE.RIGHT };

            ////////////
            // internals

            var scope = this;

            var EPS = 0.000001;

            var rotateStart = new THREE.Vector2();
            var rotateEnd = new THREE.Vector2();
            var rotateDelta = new THREE.Vector2();

            var panStart = new THREE.Vector2();
            var panEnd = new THREE.Vector2();
            var panDelta = new THREE.Vector2();
            var panOffset = new THREE.Vector3();

            var offset = new THREE.Vector3();

            var dollyStart = new THREE.Vector2();
            var dollyEnd = new THREE.Vector2();
            var dollyDelta = new THREE.Vector2();

            var theta;
            var phi;
            var phiDelta = 0;
            var thetaDelta = 0;
            var scale = 1;
            var pan = new THREE.Vector3();

            var lastPosition = new THREE.Vector3();
            var lastQuaternion = new THREE.Quaternion();

            var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

            var state = STATE.NONE;

            // for reset

            this.target0 = this.target.clone();
            this.position0 = this.object.position.clone();

            // so camera.up is the orbit axis

            var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
            var quatInverse = quat.clone().inverse();

            // events

            var changeEvent = { type: 'change' };
            var startEvent = { type: 'start'};
            var endEvent = { type: 'end'};

            this.rotateLeft = function ( angle ) {

                if ( angle === undefined ) {

                    angle = getAutoRotationAngle();

                }

                thetaDelta -= angle;

            };

            this.rotateUp = function ( angle ) {

                if ( angle === undefined ) {

                    angle = getAutoRotationAngle();

                }

                phiDelta -= angle;

            };

            // pass in distance in world space to move left
            this.panLeft = function ( distance ) {

                var te = this.object.matrix.elements;

                // get X column of matrix
                panOffset.set( te[ 0 ], te[ 1 ], te[ 2 ] );
                panOffset.multiplyScalar( - distance );

                pan.add( panOffset );

            };

            // pass in distance in world space to move up
            this.panUp = function ( distance ) {

                var te = this.object.matrix.elements;

                // get Y column of matrix
                panOffset.set( te[ 4 ], te[ 5 ], te[ 6 ] );
                panOffset.multiplyScalar( distance );

                pan.add( panOffset );

            };

            // pass in x,y of change desired in pixel space,
            // right and down are positive
            this.pan = function ( deltaX, deltaY ) {

                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

                if ( scope.object.fov !== undefined ) {

                    // perspective
                    var position = scope.object.position;
                    var offset = position.clone().sub( scope.target );
                    var targetDistance = offset.length();

                    // half of the fov is center to top of screen
                    targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

                    // we actually don't use screenWidth, since perspective camera is fixed to screen height
                    scope.panLeft( 2 * deltaX * targetDistance / element.clientHeight );
                    scope.panUp( 2 * deltaY * targetDistance / element.clientHeight );

                } else if ( scope.object.top !== undefined ) {

                    // orthographic
                    scope.panLeft( deltaX * (scope.object.right - scope.object.left) / element.clientWidth );
                    scope.panUp( deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight );

                } else {

                    // camera neither orthographic or perspective
                    console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );

                }

            };

            this.dollyIn = function ( dollyScale ) {

                if ( dollyScale === undefined ) {

                    dollyScale = getZoomScale();

                }

                scale /= dollyScale;

            };

            this.dollyOut = function ( dollyScale ) {

                if ( dollyScale === undefined ) {

                    dollyScale = getZoomScale();

                }

                scale *= dollyScale;

            };

            this.update = function () {

                var position = this.object.position;

                offset.copy( position ).sub( this.target );

                // rotate offset to "y-axis-is-up" space
                offset.applyQuaternion( quat );

                // angle from z-axis around y-axis

                theta = Math.atan2( offset.x, offset.z );

                // angle from y-axis

                phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

                if ( this.autoRotate ) {

                    this.rotateLeft( getAutoRotationAngle() );

                }

                theta += thetaDelta;
                phi += phiDelta;

                // restrict theta to be between desired limits
                theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, theta ) );

                // restrict phi to be between desired limits
                phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

                // restrict phi to be betwee EPS and PI-EPS
                phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

                var radius = offset.length() * scale;

                // restrict radius to be between desired limits
                radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

                // move target to panned location
                this.target.add( pan );

                offset.x = radius * Math.sin( phi ) * Math.sin( theta );
                offset.y = radius * Math.cos( phi );
                offset.z = radius * Math.sin( phi ) * Math.cos( theta );

                // rotate offset back to "camera-up-vector-is-up" space
                offset.applyQuaternion( quatInverse );

                position.copy( this.target ).add( offset );

                this.object.lookAt( this.target );

                thetaDelta = 0;
                phiDelta = 0;
                scale = 1;
                pan.set( 0, 0, 0 );

                // update condition is:
                // min(camera displacement, camera rotation in radians)^2 > EPS
                // using small-angle approximation cos(x/2) = 1 - x^2 / 8

                if ( lastPosition.distanceToSquared( this.object.position ) > EPS
                    || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS ) {

                    this.dispatchEvent( changeEvent );

                    lastPosition.copy( this.object.position );
                    lastQuaternion.copy (this.object.quaternion );

                }

            };


            this.reset = function () {

                state = STATE.NONE;

                this.target.copy( this.target0 );
                this.object.position.copy( this.position0 );

                this.update();

            };

            this.getPolarAngle = function () {

                return phi;

            };

            this.getAzimuthalAngle = function () {

                return theta

            };

            function getAutoRotationAngle() {

                return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

            }

            function getZoomScale() {

                return Math.pow( 0.95, scope.zoomSpeed );

            }

            function onMouseDown( event ) {

                if ( scope.enabled === false ) return;
                event.preventDefault();

                if ( event.button === scope.mouseButtons.ORBIT ) {
                    if ( scope.noRotate === true ) return;

                    state = STATE.ROTATE;

                    rotateStart.set( event.clientX, event.clientY );

                } else if ( event.button === scope.mouseButtons.ZOOM ) {
                    if ( scope.noZoom === true ) return;

                    state = STATE.DOLLY;

                    dollyStart.set( event.clientX, event.clientY );

                } else if ( event.button === scope.mouseButtons.PAN ) {
                    if ( scope.noPan === true ) return;

                    state = STATE.PAN;

                    panStart.set( event.clientX, event.clientY );

                }

                if ( state !== STATE.NONE ) {
                    document.addEventListener( 'mousemove', onMouseMove, false );
                    document.addEventListener( 'mouseup', onMouseUp, false );
                    scope.dispatchEvent( startEvent );
                }

            }

            function onMouseMove( event ) {

                if ( scope.enabled === false ) return;

                event.preventDefault();

                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

                if ( state === STATE.ROTATE ) {

                    if ( scope.noRotate === true ) return;

                    rotateEnd.set( event.clientX, event.clientY );
                    rotateDelta.subVectors( rotateEnd, rotateStart );

                    // rotating across whole screen goes 360 degrees around
                    scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

                    // rotating up and down along whole screen attempts to go 360, but limited to 180
                    scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

                    rotateStart.copy( rotateEnd );

                } else if ( state === STATE.DOLLY ) {

                    if ( scope.noZoom === true ) return;

                    dollyEnd.set( event.clientX, event.clientY );
                    dollyDelta.subVectors( dollyEnd, dollyStart );

                    if ( dollyDelta.y > 0 ) {

                        scope.dollyIn();

                    } else {

                        scope.dollyOut();

                    }

                    dollyStart.copy( dollyEnd );

                } else if ( state === STATE.PAN ) {

                    if ( scope.noPan === true ) return;

                    panEnd.set( event.clientX, event.clientY );
                    panDelta.subVectors( panEnd, panStart );

                    scope.pan( panDelta.x, panDelta.y );

                    panStart.copy( panEnd );

                }

                if ( state !== STATE.NONE ) scope.update();

            }

            function onMouseUp( /* event */ ) {

                if ( scope.enabled === false ) return;

                document.removeEventListener( 'mousemove', onMouseMove, false );
                document.removeEventListener( 'mouseup', onMouseUp, false );
                scope.dispatchEvent( endEvent );
                state = STATE.NONE;

            }

            function onMouseWheel( event ) {

                if ( scope.enabled === false || scope.noZoom === true || state !== STATE.NONE ) return;

                event.preventDefault();
                event.stopPropagation();

                var delta = 0;

                if ( event.wheelDelta !== undefined ) { // WebKit / Opera / Explorer 9

                    delta = event.wheelDelta;

                } else if ( event.detail !== undefined ) { // Firefox

                    delta = - event.detail;

                }

                if ( delta > 0 ) {

                    scope.dollyOut();

                } else {

                    scope.dollyIn();

                }

                scope.update();
                scope.dispatchEvent( startEvent );
                scope.dispatchEvent( endEvent );

            }

            function onKeyDown( event ) {

                if ( scope.enabled === false || scope.noKeys === true || scope.noPan === true ) return;

                switch ( event.keyCode ) {

                    case scope.keys.UP:
                        scope.pan( 0, scope.keyPanSpeed );
                        scope.update();
                        break;

                    case scope.keys.BOTTOM:
                        scope.pan( 0, - scope.keyPanSpeed );
                        scope.update();
                        break;

                    case scope.keys.LEFT:
                        scope.pan( scope.keyPanSpeed, 0 );
                        scope.update();
                        break;

                    case scope.keys.RIGHT:
                        scope.pan( - scope.keyPanSpeed, 0 );
                        scope.update();
                        break;

                }

            }

            function touchstart( event ) {

                if ( scope.enabled === false ) return;

                switch ( event.touches.length ) {

                    case 1: // one-fingered touch: rotate

                        if ( scope.noRotate === true ) return;

                        state = STATE.TOUCH_ROTATE;

                        rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                        break;

                    case 2: // two-fingered touch: dolly

                        if ( scope.noZoom === true ) return;

                        state = STATE.TOUCH_DOLLY;

                        var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                        var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                        var distance = Math.sqrt( dx * dx + dy * dy );
                        dollyStart.set( 0, distance );
                        break;

                    case 3: // three-fingered touch: pan

                        if ( scope.noPan === true ) return;

                        state = STATE.TOUCH_PAN;

                        panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                        break;

                    default:

                        state = STATE.NONE;

                }

                if ( state !== STATE.NONE ) scope.dispatchEvent( startEvent );

            }

            function touchmove( event ) {

                if ( scope.enabled === false ) return;

                event.preventDefault();
                event.stopPropagation();

                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

                switch ( event.touches.length ) {

                    case 1: // one-fingered touch: rotate

                        if ( scope.noRotate === true ) return;
                        if ( state !== STATE.TOUCH_ROTATE ) return;

                        rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                        rotateDelta.subVectors( rotateEnd, rotateStart );

                        // rotating across whole screen goes 360 degrees around
                        scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
                        // rotating up and down along whole screen attempts to go 360, but limited to 180
                        scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

                        rotateStart.copy( rotateEnd );

                        scope.update();
                        break;

                    case 2: // two-fingered touch: dolly

                        if ( scope.noZoom === true ) return;
                        if ( state !== STATE.TOUCH_DOLLY ) return;

                        var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                        var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                        var distance = Math.sqrt( dx * dx + dy * dy );

                        dollyEnd.set( 0, distance );
                        dollyDelta.subVectors( dollyEnd, dollyStart );

                        if ( dollyDelta.y > 0 ) {

                            scope.dollyOut();

                        } else {

                            scope.dollyIn();

                        }

                        dollyStart.copy( dollyEnd );

                        scope.update();
                        break;

                    case 3: // three-fingered touch: pan

                        if ( scope.noPan === true ) return;
                        if ( state !== STATE.TOUCH_PAN ) return;

                        panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                        panDelta.subVectors( panEnd, panStart );

                        scope.pan( panDelta.x, panDelta.y );

                        panStart.copy( panEnd );

                        scope.update();
                        break;

                    default:

                        state = STATE.NONE;

                }

            }

            function touchend( /* event */ ) {

                if ( scope.enabled === false ) return;

                scope.dispatchEvent( endEvent );
                state = STATE.NONE;

            }

            this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
            this.domElement.addEventListener( 'mousedown', onMouseDown, false );
            this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
            this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

            this.domElement.addEventListener( 'touchstart', touchstart, false );
            this.domElement.addEventListener( 'touchend', touchend, false );
            this.domElement.addEventListener( 'touchmove', touchmove, false );

            window.addEventListener( 'keydown', onKeyDown, false );

            // force an update at start
            this.update();
        };

        OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
        OrbitControls.prototype.constructor = OrbitControls;
        return OrbitControls;
    }
    },{}],8:[function(require,module,exports){
    var createApp = require('canvas-app')
    var createControls = require('three-orbit-controls')
    var Emitter = require('events/')
    var xtend = require('xtend')
    var number = require('as-number')

    module.exports = function(THREE) {
        var OrbitControls = createControls(THREE)
        return function(opt) {
            opt = opt||{}

            var emitter = new Emitter()


            var ctxAttrib = opt.contextAttributes || {}

            var setup = function(gl, width, height) {
                emitter.renderer = new THREE.WebGLRenderer(xtend(ctxAttrib, {
                    canvas: gl.canvas
                }))

                var clearColor = 0x000000
                if (opt.clearColor || typeof opt.clearColor === 'number')
                    clearColor = opt.clearColor

                var clearAlpha = opt.clearAlpha||0
                emitter.renderer.setClearColor(clearColor, clearAlpha)

                var fov = number(opt.fov, 50)
                var near = number(opt.near, 0.1)
                var far = number(opt.far, 1000)

                emitter.scene = new THREE.Scene()
                emitter.camera = new THREE.PerspectiveCamera(fov, width/height, near, far)

                var position = opt.position || new THREE.Vector3(1, 1, -2)
                var target = opt.target || new THREE.Vector3()

                emitter.camera.position.copy(position)
                emitter.camera.lookAt(target)

                emitter.controls = new OrbitControls(emitter.camera, emitter.engine.canvas)
                emitter.controls.target.copy(target)
            }

            var render = function(gl, width, height, dt) {
                emitter.emit('tick', dt)
                emitter.renderer.render(emitter.scene, emitter.camera)
                emitter.emit('render', dt)
            }

            var resize = function(width, height) {
                if (!emitter.renderer)
                    return

                emitter.renderer.setSize(width, height)
                emitter.camera.aspect = width/height
                emitter.camera.updateProjectionMatrix()

                emitter.emit('resize', width, height)
            }


            var engine = createApp(render, xtend(opt, {
                context: 'webgl',
                onResize: resize
            }))
            emitter.engine = engine

            document.body.appendChild(engine.canvas)
            document.body.style.margin = "0"
            document.body.style.overflow = "hidden"

            setup(engine.context, engine.width, engine.height)
            if (typeof emitter.renderer.setPixelRatio === 'function') //r70
                emitter.renderer.setPixelRatio(engine._DPR)
            else if (typeof emitter.renderer.devicePixelRatio === 'number') //r69
                emitter.renderer.devicePixelRatio = engine._DPR
            emitter.renderer.setSize(engine.width, engine.height)
            engine.start()

            return emitter
        }
    }
    },{"as-number":2,"canvas-app":3,"events/":5,"three-orbit-controls":7,"xtend":10}],9:[function(require,module,exports){
    module.exports = function(opts) {
        opts = opts||{};
        var canvas = opts.canvas || document.createElement("canvas");
        if (typeof opts.width === "number")
            canvas.width = opts.width;
        if (typeof opts.height === "number")
            canvas.height = opts.height;

        var attribs = (opts.attributes || opts.attribs || {});
        try {
            gl = (canvas.getContext('webgl', attribs) || canvas.getContext('experimental-webgl', attribs));
        } catch (e) {
            gl = null;
        }
        return gl;
    };
    },{}],10:[function(require,module,exports){
    module.exports = extend

    var hasOwnProperty = Object.prototype.hasOwnProperty;

    function extend() {
        var target = {}

        for (var i = 0; i < arguments.length; i++) {
            var source = arguments[i]

            for (var key in source) {
                if (hasOwnProperty.call(source, key)) {
                    target[key] = source[key]
                }
            }
        }

        return target
    }

    },{}],11:[function(require,module,exports){
    'use strict';

    window.threeOrbitViewer = require('three-orbit-viewer');

    },{"three-orbit-viewer":8}]},{},[11]);
