
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import {TimelineMax, TweenLite, Linear, TweenMax} from 'gsap';

declare const Draggable;

var duration = 2.5; // initial duration of the timeline
var sp = 20; // initial segment percentage of line to be shown
var tl = new TimelineMax({ onComplete: startAgain });
var $dragger = $(".dragger");
var dragFunctions = [durationDrag, percentageDrag];
var $percentage = $("#percentageText"); // text to update with dragger
var $duration = $("#durationText"); // text to update with dragger
var $swatches = $("#swatches rect");
var colorArray = ["#ffffff", "#88ce02", "#eae047", "#b5b5b5", "#e3aa59", "#a63ba0", "#46a4cc", "#8d67b7", "#cf5b21"];

// basic centering and initial positioning of elements
TweenLite.defaultEase = Linear.easeNone; // needed for seamless loops
TweenMax.set("#demo", { xPercent: -50, yPercent: -50, autoAlpha: 1 }); // center demo
TweenMax.set('#master, #helper', { drawSVG: 0 }); // start lines at 0
TweenMax.set("#strokeControl", { transformOrigin: "center center" }); // stroke width dial center origin
TweenMax.set("#percentageDragger", { x: 74.7 }); // position dragger to represent starting percentage
TweenMax.set("#timelineDragger", { x: 68 }); // position dragger to represent starting duration
TweenMax.set($swatches, { stroke: "#eee", strokeWidth: 2, cursor: "pointer" });

// fill color swatches from colorArray
$swatches.each(function (i) {
    TweenMax.set(this, { fill: colorArray[i] });
});

// tween the color of the stroke on swatch click
$swatches.click(function () {
    let newColor = colorArray[$(this).index()];
    TweenMax.to("#theStrokes", 0.5, { stroke: newColor });
});

// main function to build the timeline
function buildTimeline() {
    tl.seek(0, true).clear();
    let turnDuration = sp / 100 * duration; // allocate the proper percentage of the duration to the overlap
    let mainDuration = duration - turnDuration; // remainder of duration for main animation
    let drawTurn = "0% " + sp + "%";

    tl.to("#master", turnDuration, { drawSVG: drawTurn });
    tl.add("startRepeat");
    tl.to("#master", mainDuration, { drawSVG: 100 - sp + "%" + " 100%" });
    tl.add("overlap");
    tl.to("#master", turnDuration, { drawSVG: "100% 100%" }, "overlap");
    tl.to("#helper", turnDuration, { drawSVG: drawTurn }, "overlap");
    tl.set("#master", { drawSVG: drawTurn });
    tl.set("#helper", { drawSVG: "0% 0%" });
}

// repeat the timeline starting at the "startRepeat" label
function startAgain() {
    tl.play("startRepeat");
}

// change the outline stroke width draggable dial
Draggable.create("#strokeControl", {
    type: "rotation",
    bounds: {
        minRotation: -136,
        maxRotation: 136
    },
    onDrag: strokeUpdate
});  // end draggable create for dial

// draggables for the 2 sliders
$dragger.each(function (i, element) {
    Draggable.create(this, {
        type: "x",
        bounds: {
            minX: 0,
            maxX: 324
        },
        onDrag: dragFunctions[i],
        onDragEnd: buildTimeline
    });  // end draggable create

});// end dragger each

// update duration text and get new duration to build timeline
function durationDrag() {
    duration = parseFloat((this.x / 34 + 0.5).toFixed(1));
    $duration.text(duration);
}

// update percentage text and get outline percentage to rebuild timeline
function percentageDrag() {
    sp = Math.floor(this.x / 4.15 + 2);
    $percentage.text(sp);
}

// adjust the stroke-width of the outline when the dial is rotated
function strokeUpdate() {
    let r = this.rotation;
    let newWidth = r < 0 ? 10 + (r / 16) : 10 + (r / 6);
    TweenMax.set('#theStrokes', { strokeWidth: newWidth });
}

buildTimeline();
