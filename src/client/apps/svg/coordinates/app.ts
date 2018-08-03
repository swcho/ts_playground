
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

const optimizedResize = (function () {

    let callbacks = [],
        running = false;

    // fired on resize event
    function resize() {

        if (!running) {
            running = true;

            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(runCallbacks);
            } else {
                setTimeout(runCallbacks, 66);
            }
        }

    }

    // run the actual callbacks
    function runCallbacks() {

        callbacks.forEach(function (callback) {
            callback();
        });

        running = false;
    }

    // adds callback to loop
    function addCallback(callback) {

        if (callback) {
            callbacks.push(callback);
        }

    }

    return {
        // public method to add additional callback
        add: function (callback) {
            if (!callbacks.length) {
                window.addEventListener('resize', resize);
            }
            addCallback(callback);
        }
    };
}());

let width = document.querySelector('#width'),
    height = document.querySelector('#height'),
    viewBox = document.querySelector('#viewBox'),
    svgClientX = document.querySelector('#svgClientX'),
    clientX = document.querySelector('.clientX'),
    clientY = document.querySelector('.clientY'),
    svgX = document.querySelector('.svgX'),
    svgY = document.querySelector('.svgY'),
    ctm = document.querySelector('.ctm') as HTMLInputElement,
    svg = document.querySelector('svg');

optimizedResize.add(onResize);
let point = svg.createSVGPoint();

function onResize() {
    let _width = document.body.clientWidth,
        _height = document.body.clientHeight,
        _vb = `0 0 ${_width} ${_height}`;

    // svg.viewBox = _vb;
    svg.setAttribute('viewBox', _vb);
    width.innerHTML = 'width: ' + _width + ', height: ';
    height.innerHTML = '' + _height;
    viewBox.innerHTML = 'viewBox: ' + _vb;
}

function onMouseMove(evt) {
    let _clientX = evt.clientX,
        _clientY = evt.clientY;
    clientX.innerHTML = _clientX;
    clientY.innerHTML = _clientY;

    point.x = _clientX;
    point.y = _clientY;
    if (ctm.checked) {
        point = point.matrixTransform(svg.getScreenCTM().inverse());
    }
    svgClientX.setAttribute('cx', point.x);
    svgClientX.setAttribute('cy', point.y);
    svgX.innerHTML = '' + Math.round(point.x);
    svgY.innerHTML = '' + Math.round(point.y);
}

svg.addEventListener('mousemove', onMouseMove);
onResize();
