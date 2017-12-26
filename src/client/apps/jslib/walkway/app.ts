
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import $ = require('jquery');
declare const Walkway;

import './style.scss';
$(".pituitary").mouseover(function () {
    $("g.pituitary").css('fill', '#333');
    $('g.pituitary').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    var svg = new Walkway({
        selector: '.pituitary',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $("g.text-group").css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $(".text-group").attr({
                stroke: "none"
            });
        }
    });

$(".lung-chest").mouseover(function () {
    $("g.lung-chest").css('fill', '#333');
    $('g.lung-chest').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    var svg = new Walkway({
        selector: '.lung-chest',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $("g.text-group").css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $(".text-group").attr({
                stroke: "none"
            });
        }
    });



$(".armpit").mouseover(function () {
    $("g.armpit").css('fill', '#333');
    $('g.armpit').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    var svg = new Walkway({
        selector: '.armpit',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $("g.text-group").css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $(".text-group").attr({
                stroke: "none"
            });
        }
    });


$(".head-brain").mouseover(function () {
    $("g.head-brain").css('fill', '#333');
    $('g.head-brain').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    var svg = new Walkway({
        selector: '.head-brain',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $("g.text-group").css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $(".text-group").attr({
                stroke: "none"
            });
        }
    });


$(".teeth-sinuses").mouseover(function () {
    $("g.teeth-sinuses").css('fill', '#333');
    $('g.teeth-sinuses').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    var svg = new Walkway({
        selector: '.teeth-sinuses',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $("g.text-group").css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $(".text-group").attr({
                stroke: "none"
            });
        }
    });



$(".eye").mouseover(function () {
    $("g.eye").css('fill', '#333');
    $('g.eye').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    var svg = new Walkway({
        selector: '.eye',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $("g.text-group").css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $(".text-group").attr({
                stroke: "none"
            });
        }
    });



$(".trapezius").mouseover(function () {
    $("g.trapezius").css('fill', '#333');
    $('g.trapezius').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    var svg = new Walkway({
        selector: '.trapezius',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $("g.text-group").css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $(".text-group").attr({
                stroke: "none"
            });
        }
    });



$(".heart").mouseover(function () {
    $("g.heart").css('fill', '#333');
    $('g.heart').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    var svg = new Walkway({
        selector: '.heart',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $(".text-group").attr({
                stroke: "none"
            });
        }
    });



$(".arm").mouseover(function () {
    $("g.arm").css('fill', '#333');
    $('g.arm').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.arm',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $("g.text-group").css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $(".text-group").attr({
                stroke: "none"
            });
        }
    });



$(".shoulder").mouseover(function () {
    $("g.shoulder").css('fill', '#333');
    $('g.shoulder').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.shoulder',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $("g.text-group").css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $(".text-group").attr({
                stroke: "none"
            });
        }
    });



$(".liver").mouseover(function () {
    $("g.liver").css('fill', '#333');
    $('g.liver').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.liver',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $("g.text-group").css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $(".text-group").attr({
                stroke: "none"
            });
        }
    });



$(".spleen").mouseover(function () {
    $("g.spleen").css('fill', '#333');
    $('g.spleen').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.spleen',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $("g.text-group").css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $(".text-group").attr({
                stroke: "none"
            });
        }
    });



$(".kidney").mouseover(function () {
    $("g.kidney").css('fill', '#333');
    $('g.kidney').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.kidney',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $("g.text-group").css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $(".text-group").attr({
                stroke: "none"
            });
        }
    });



$(".elbow").mouseover(function () {
    $("g.elbow").css('fill', '#333');
    $('g.elbow').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.elbow',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $("g.text-group").css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $(".text-group").attr({
                stroke: "none"
            });
        }
    });



$(".leg").mouseover(function () {
    $("g.leg").css('fill', '#333');
    $('g.leg').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.leg',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $("g.text-group").css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $(".text-group").attr({
                stroke: "none"
            });
        }
    });



$(".ear").mouseover(function () {
    $("g.ear").css('fill', '#333');
    $('g.ear').attr({
        stroke: "#333333"
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.ear',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });


$('.descending-colon').mouseover(function () {
    $('g.descending-colon').css('fill', '#333');
    $('g.descending-colon').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.descending-colon',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.small-intestine').mouseover(function () {
    $('g.small-intestine').css('fill', '#333');
    $('g.small-intestine').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.small-intestine',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.sciatic-nerve').mouseover(function () {
    $('g.sciatic-nerve').css('fill', '#333');
    $('g.sciatic-nerve').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.sciatic-nerve',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.throat').mouseover(function () {
    $('g.throat').css('fill', '#333');
    $('g.throat').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.throat',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.nose').mouseover(function () {
    $('g.nose').css('fill', '#333');
    $('g.nose').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.nose',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.neck').mouseover(function () {
    $('g.neck').css('fill', '#333');
    $('g.neck').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.neck',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.cervical-spine').mouseover(function () {
    $('g.cervical-spine').css('fill', '#333');
    $('g.cervical-spine').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.cervical-spine',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.thyroid').mouseover(function () {
    $('g.thyroid').css('fill', '#333');
    $('g.thyroid').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.thyroid',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.esophagus').mouseover(function () {
    $('g.esophagus').css('fill', '#333');
    $('g.esophagus').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.esophagus',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.solar-plexus').mouseover(function () {
    $('g.solar-plexus').css('fill', '#333');
    $('g.solar-plexus').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.solar-plexus',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.diaphragm').mouseover(function () {
    $('g.diaphragm').css('fill', '#333');
    $('g.diaphragm').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.diaphragm',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.stomach').mouseover(function () {
    $('g.stomach').css('fill', '#333');
    $('g.stomach').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.stomach',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.adrenals').mouseover(function () {
    $('g.adrenals').css('fill', '#333');
    $('g.adrenals').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.adrenals',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.pancreas').mouseover(function () {
    $('g.pancreas').css('fill', '#333');
    $('g.pancreas').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.pancreas',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.duodenum').mouseover(function () {
    $('g.duodenum').css('fill', '#333');
    $('g.duodenum').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.duodenum',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.ureter').mouseover(function () {
    $('g.ureter').css('fill', '#333');
    $('g.ureter').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.ureter',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.bladder').mouseover(function () {
    $('g.bladder').css('fill', '#333');
    $('g.bladder').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.bladder',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.rectum').mouseover(function () {
    $('g.rectum').css('fill', '#333');
    $('g.rectum').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.rectum',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.sacrum').mouseover(function () {
    $('g.sacrum').css('fill', '#333');
    $('g.sacrum').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.sacrum',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.lower-back').mouseover(function () {
    $('g.lower-back').css('fill', '#333');
    $('g.lower-back').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.lower-back',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.gall-bladder').mouseover(function () {
    $('g.gall-bladder').css('fill', '#333');
    $('g.gall-bladder').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.gall-bladder',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.ascending-colon').mouseover(function () {
    $('g.ascending-colon').css('fill', '#333');
    $('g.ascending-colon').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.ascending-colon',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });



$('.appendix').mouseover(function () {
    $('g.appendix').css('fill', '#333');
    $('g.appendix').attr({
        stroke: '#333333'
    });
    $(this).css('cursor', 'pointer');
    let svg = new Walkway({
        selector: '.appendix',
        duration: '300'
    });
    svg.draw();
})
    .mouseout(function () {
        $('g.text-group').css('fill', '#ccc');
        if (!$(this).data('clicked')) {
            $('.text-group').attr({
                stroke: 'none'
            });
        }
    });
