
/// <reference path="../../../../../node_modules/@types/youtube/index.d.ts"/>

import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import * as $ from 'jquery';
// import 'youtube';

declare global {
    interface Window {
        onYouTubeIframeAPIReady;
    }
}

/* YOUTUBE */
let videoduration;
let intervalrunning = false;
let tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
let player;
function onYouTubeIframeAPIReady() {
    console.log('onYouTubeIframeAPIReady');
    player = new YT.Player('player', {
        width: 720,
        height: 480,
        // wmode: 'opaque',
        videoId: 'rNMSCQJpAIY',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        },
        playerVars: {
            controls: 0,
            showinfo: 0,
            modestbranding: 1,
            // wmode: "opaque"
        },
    });
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

function onPlayerReady(event) {
    videoduration = getLength();
    window.setInterval(youtubetimeupdate, 60);
    function youtubetimeupdate() {
        if (intervalrunning) {
            let time_update = player.getCurrentTime();
            let playing = player.getPlayerState();
            if (playing === 1) {
                let playedpercent = (time_update / videoduration) * 100;
                let percentofcircle = (360 / 100) * playedpercent;
                rotateWhilePlaying(percentofcircle);
            }
        }
    }
}

function onPlayerStateChange(event) {
    if (event.data === 0) {
        // alert('done');
        intervalrunning = false;
    }
}

function playVideo() {
    player.playVideo();
}

function stopVideo() {
    player.stopVideo();
}

function pauseVideo() {
    player.pauseVideo();
}

function playerSeekTo(seconds) {
    player.seekTo(seconds);
}

function getLength() {
    return (player.getDuration());
}

function ontimeupdate() {
}

function calculateVideoFrame(lastangle) {
    let percentage = (lastangle / 360) * 100; ;
    let seconds = (percentage / 100) * videoduration;
    playerSeekTo(seconds);
    playVideo();
    intervalrunning = true;
}

function rotateWhilePlaying(percentofcircle) {
    let deg = percentofcircle;
    let css = 'rotate(' + deg + 'deg)';
    document.getElementById('knob').style.transform = css;
}

function threeSixtyRoation(wrapper, xcor, ycor, knob) {

    let x = xcor - wrapper.offset().left - wrapper.width() / 2;
    let y = -1 * (ycor - wrapper.offset().top - wrapper.height() / 2);
    let theta = Math.atan2(y, x) * (180 / Math.PI);
    let deg = 180 - theta;

    let css = 'rotate(' + deg + 'deg)';
    knob.css({
        'transform': css,
        '-webkit-transform': css
    });
    $('body').on('mouseup', function (event) {
        calculateVideoFrame(deg);
        $('body').unbind('mousemove');
    });
}

$(document).ready(function () {
    $('.knob').on('mousedown', function () {
        pauseVideo();
        intervalrunning = false;
        $('body').on('mousemove', function (event) {
            threeSixtyRoation($('.videocontainer'), event.pageX, event.pageY, $('.knob'));
        });
    });
});
