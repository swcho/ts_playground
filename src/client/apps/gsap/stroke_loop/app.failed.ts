
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import { TimelineMax, TimelineLite, Linear, TweenMax } from 'gsap';

let duration = 2.5; // initial duration of the timeline
const $duration = $('#durationText'); // text to update wth drager
function durationDrag() {
    duration = parseFloat((this.x / 34 + 0.5).toFixed(1));
    $duration.text('' + duration);
}

let sp = 20; // initial segment percentage of line to be shown
const $percentage = $('#percentageText'); // text to update with dragger
function percentageDrag() {
    sp = Math.floor(this.x / 4.15 + 2);
    $percentage.text('' + sp);
}

const tl = new TimelineMax({
    onComplete: startAgain,
});

const $dragger = $('.dragger');
const dragFunctions = [durationDrag, percentageDrag];
const colorArray = ['#ffffff', '#88ce02', '#eae047', '#b5b5b5', '#e3aa59', '#a63ba0', '#46a4cc', '#8d67b7', '#cf5b21'];

// basic centering and initial positioning of elements

// needed for seamless loops
TimelineLite['defaultEase'] = Linear.easeNone;

// Centering
TweenMax.set('#demo', {
    xPercent: -50,
    yPercent: -50,
    autoAlpha: 1,
});

// Start lines at 0
TweenMax.set('#master, #helper', {
    drawSVG: 100,
});

const $swatches = $('#swatches rect');
TweenMax.set($swatches, {
    stroke: '#eee',
    strokeWidth: 2,
    cursor: 'pointer',
});
// fill color swatches from colorArray
$swatches.each(function (i) {
    TweenMax.set(this, {
        fill: colorArray[i],
    });
});
// tween the color of the stroke on swatch click
$swatches.click(function () {
    const newColor = colorArray[$(this).index()];
    TweenMax.to('#theStrokes', 0.5, {
        stroke: newColor,
    });
});

// stroke with dial center origin
TweenMax.set('#strokeControl', {
    transforOrigin: 'center center',
});

// position dragger to represent starting duration
TweenMax.set('#timelineDragger', {
    x: 68,
});

// position dragger to represent starting percentage
TweenMax.set('#percentageDragger', {
    x: 74.7,
});

// function buildTimeline() {
//     tl.seek(0, true).clear();
//     const turnDuration = duration * (sp / 100);
//     const mainDuration = duration - turnDuration;
//     const drawTurn = `0% ${sp}%`;

//     const elMaster = '#master'; // document.getElementById('master');
//     tl.to(elMaster, turnDuration, {
//         drawSVG: drawTurn,
//     });
//     tl.add('startRepeat');
//     tl.to(elMaster, mainDuration, {
//         drawSVG: `${100 - sp}% 100%`,
//     });
//     tl.add('overlap');

//     const elHelper = '#helper'; // document.getElementById('helper');
//     tl.to(elMaster, turnDuration, {
//         drawSVG: '100% 100%',
//     }, 'overlap');
//     tl.to(elHelper, turnDuration, {
//         drawSVG: drawTurn
//     }, 'overlap');
//     tl.set(elMaster, {
//         drawSVG: drawTurn,
//     });
//     tl.set(elHelper, {
//         drawSVG: '0% 0%',
//     });

//     tl.play('startRepeat');
// }

// main function to build the timeline
function buildTimeline() {
    tl.seek(0, false).clear();
    let turnDuration = sp / 100 * duration; // allocate the proper percentage of the duration to the overlap
    let mainDuration = duration - turnDuration; // remainder of duration for main animation
    let drawTurn = '0% ' + sp + '%';

    tl.to('#master', turnDuration, { drawSVG: drawTurn });
    tl.add('startRepeat');
    tl.to('#master', mainDuration, { drawSVG: 100 - sp + '%' + ' 100%' });
    tl.add('overlap');
    tl.to('#master', turnDuration, { drawSVG: '100% 100%' }, 'overlap');
    tl.to('#helper', turnDuration, { drawSVG: drawTurn }, 'overlap');
    tl.set('#master', { drawSVG: drawTurn });
    tl.set('#helper', { drawSVG: '0% 0%' });
}


function startAgain() {
    tl.play('startRepeat');
}

buildTimeline();
