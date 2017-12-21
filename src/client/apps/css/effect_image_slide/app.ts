
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';
import * as $ from 'jquery';
$(document).ready(function () {

    // If the comparison slider is present on the page lets initialise it, this is good you will include this in the main js to prevent the code from running when not needed
    if ($(".comparison-slider")[0]) {
        let compSlider = $(".comparison-slider");

        //let's loop through the sliders and initialise each of them
        compSlider.each(function () {
            let compSliderWidth = $(this).width() + "px";
            $(this).find(".resize img").css({ width: compSliderWidth });
            drags($(this).find(".divider"), $(this).find(".resize"), $(this));
        });

        //if the user resizes the windows lets update our variables and resize our images
        $(window).on("resize", function () {
            let compSliderWidth = compSlider.width() + "px";
            compSlider.find(".resize img").css({ width: compSliderWidth });
        });
    }
});

// This is where all the magic happens
// This is a modified version of the pen from Ege Görgülü - https://codepen.io/bamf/pen/jEpxOX - and you should check it out too.
function drags(dragElement, resizeElement, container) {

    // This creates a variable that detects if the user is using touch input insted of the mouse.
    let touched = false;
    window.addEventListener('touchstart', function () {
        touched = true;
    });
    window.addEventListener('touchend', function () {
        touched = false;
    });

    // clicp the image and move the slider on interaction with the mouse or the touch input
    dragElement.on("mousedown touchstart", function (e) {

        //add classes to the emelents - good for css animations if you need it to
        dragElement.addClass("draggable");
        resizeElement.addClass("resizable");
        //create vars
        let startX = e.pageX ? e.pageX : e.originalEvent.touches[0].pageX;
        let dragWidth = dragElement.outerWidth();
        let posX = dragElement.offset().left + dragWidth - startX;
        let containerOffset = container.offset().left;
        let containerWidth = container.outerWidth();
        let minLeft = containerOffset + 10;
        let maxLeft = containerOffset + containerWidth - dragWidth - 10;

        //add event listner on the divider emelent
        dragElement.parents().on("mousemove touchmove", function (e) {

            // if the user is not using touch input let do preventDefault to prevent the user from slecting the images as he moves the silder arround.
            if (touched === false) {
                e.preventDefault();
            }

            let moveX = e.pageX ? e.pageX : e.originalEvent.touches[0].pageX;
            let leftValue = moveX + posX - dragWidth;

            // stop the divider from going over the limits of the container
            if (leftValue < minLeft) {
                leftValue = minLeft;
            } else if (leftValue > maxLeft) {
                leftValue = maxLeft;
            }

            let widthValue = (leftValue + dragWidth / 2 - containerOffset) * 100 / containerWidth + "%";

            $(".draggable").css("left", widthValue).on("mouseup touchend touchcancel", function () {
                $(this).removeClass("draggable");
                resizeElement.removeClass("resizable");
            });

            $(".resizable").css("width", widthValue);

        }).on("mouseup touchend touchcancel", function () {
            dragElement.removeClass("draggable");
            resizeElement.removeClass("resizable");

        });

    }).on("mouseup touchend touchcancel", function (e) {
        // stop clicping the image and move the slider
        dragElement.removeClass("draggable");
        resizeElement.removeClass("resizable");

    });

}
