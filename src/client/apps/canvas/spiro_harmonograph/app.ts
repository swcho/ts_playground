
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

//

import './style.scss';

import dat = require('dat-gui');
const CONFIG = {
    division: 25,
    add: 0.1,
    usePrev: false,
    noFade: false,
};

let gui = new dat.GUI();
gui.add(CONFIG, 'division', 0.01, 50).step(0.01);
gui.add(CONFIG, 'add', -1, 1).step(0.1);
gui.add(CONFIG, 'usePrev');
gui.add(CONFIG, 'noFade');


//  Some variables, and the step() function, based on Andy Giger's virtual harmonograph:
//  andygiger.com/science/harmonograph/index.html
//  Although I didn't use Mr. Giger's equations, I learned a lot by studying them,
//  and am eternally grateful to him for posting his work

//  The equations I used are from the Wikipedia entry on Harmongraphs:
//  https://en.wikipedia.org/wiki/Harmonograph#Computer-generated_harmonograph_figure

//  BASIC VARIABLES  //

let theta = 0;
// frequency   HOW FAR APART THE DOTS ARE, SMALLER NUMBERS = CLOSER
let fd;
let f1;
let f2;
let f3;
let f4;
let f5;
let f6;

//  micro tuning
let mt1;
let mt2;
let mt3;

// phase
let p1;
let p2;
let p3;
let p4;
let p5;
let p6;

let ad;
let a1; // Amplitude   //   CONTROLS THE OVERALL SIZE, LARGER NUMBERS = BIGGER
let a2;
let a3;
let a4;
let a5;
let a6;

let d1; // dampening; 0 = pendulum won't naturally stop swinging due to gravity
let d2;
let d3;
let d4;
let d5;
let d6;

// Canvas
let canvas;

// 2d Drawing Context.
let ctx;

let centerX, centerY;
let rot_increment;
let revo_increment_multiplier;
let s = 256;
let t = 0.0;
let dt = 0.001;
let intId;
let ns, setns = 100000;
let revolutions;

let userInputForm;

let full_pattern = 314000;
let half_pattern = 157000;
let third_pattern = 104666;

let pattern_color;
let requestID;
let animation_is_running;

//  END BASIC VARIABLES  //

//  LETS GET THIS PARTY STARTED

declare global {
    interface HTMLElement {
        value;
    }
}

let willbe_d1;
let willbe_d3;
let willbe_d5;
let pattern_amount;

function btnGetFormClick(e?) {

    revolutions = 0;

    console.log('from inside btnGetFormClick function = ');

    document.getElementById('animInput').setAttribute('class', 'center fadeaway');
    document.getElementById('main').removeEventListener('keyup', checkSubmit);
    document.getElementById('pauseBtn').addEventListener('click', pause);
    setPatternAmount();
    setColor();
    console.log('from inside btnGetFormClick function, pattern amount = ' + pattern_amount);

    init();
}

window['btnGetFormClick'] = btnGetFormClick;

function init() {
    window.clearInterval(intId);
    intId = null;
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'source-over';
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.rotate(0);
    ctx.translate(0, 0);

    ctx.moveTo(0, 0);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.rotate(theta);

    ctx.fillStyle = pattern_color;
    ctx.translate(centerX, centerY);

    // userInputForm = document.anim_input;
    userInputForm = document.getElementById('animInput');
    document.getElementsByName('sbmtBtn')[0].addEventListener('click', () => btnGetFormClick());



    fd = 0.001;

    mt1 = parseFloat(document.getElementById('microtn1').value);
    mt2 = parseFloat(document.getElementById('microtn2').value);
    mt3 = parseFloat(document.getElementById('microtn3').value);

    f1 = (parseFloat(document.getElementById('freq1').value) + mt1) * fd;
    f2 = f1;
    f3 = (parseFloat(document.getElementById('freq2').value) + mt2) * fd;
    f4 = f3;
    f5 = (parseFloat(document.getElementById('freq3').value) + mt3) * fd;
    f6 = f5;

    p1 = parseInt(document.getElementById('phase_x1').value) / 180 * Math.PI;
    p2 = parseInt(document.getElementById('phase_y1').value) / 180 * Math.PI;
    p3 = parseInt(document.getElementById('phase_x2').value) / 180 * Math.PI;
    p4 = parseInt(document.getElementById('phase_y2').value) / 180 * Math.PI;
    p5 = parseInt(document.getElementById('phase_x3').value) / 180 * Math.PI;
    p6 = parseInt(document.getElementById('phase_y3').value) / 180 * Math.PI;

    ad = 2;
    a1 = document.getElementById('amp_x1').value * ad;
    a2 = document.getElementById('amp_y1').value * ad;
    a3 = document.getElementById('amp_x2').value * ad;
    a4 = document.getElementById('amp_y2').value * ad;
    a5 = document.getElementById('amp_x3').value * ad;
    a6 = document.getElementById('amp_y3').value * ad;

    willbe_d1 = document.getElementById('damp1').value;
    willbe_d3 = document.getElementById('damp2').value;
    willbe_d5 = document.getElementById('damp3').value;

    t = 0.0;
    ns = setns;
    revolutions = 0;
    rot_increment = 6;  //  I DON'T THINK I EVEN USE THIS
    revo_increment_multiplier = 1.0; //  OR THIS EITHER

    intId = window.setInterval(step, 1000 * dt);
}

function step() {
    for (let i = 0; i < s; ++i) {
        t += dt;
        drawFrame();
    }


    function drawFrame() {

        dt = 2;
        d1 = willbe_d1 / 1000000; // dampening
        d2 = d1;
        d3 = willbe_d3 / 1000000;
        d4 = d3;
        d5 = willbe_d5 / 1000000;
        d6 = d5;

        let x = a1 * Math.sin((t * f1) + p1) * Math.exp(-d1 * t) + a3 * Math.sin((t * f3) + p3) * Math.exp(-d3 * t) + a5 * Math.sin((t * f5) + p5) * Math.exp(-d5 * t);

        let y = a2 * Math.sin((t * f2) + p2) * Math.exp(-d2 * t) + a4 * Math.sin((t * f4) + p4) * Math.exp(-d4 * t) + a6 * Math.sin((t * f6) + p6) * Math.exp(-d6 * t);

        ctx.beginPath();
        ctx.rect(x, y, 2, 2);
        ctx.fill();
        revolutions += 1;

        if (revolutions === pattern_amount) {
            window.clearInterval(intId);
            intId = null;
        }
        //   END OF DRAWFRAME FUNCTION
    }
};

window.onload = function () {
    document.getElementById('spdBtn').addEventListener('click', function (e) {
        s = s * 2;
        if (s > 1024) {
            s = 256;
        };
        document.getElementById('spf').innerHTML = s + 'x';
        console.log('from inside the spdBtn function');

    });
    document.getElementById('resetBtn').addEventListener('click', formReset);
    document.getElementById('resetBtn').addEventListener('click', erase);
    document.getElementById('main').addEventListener('keyup', checkSubmit);

    revolutions = 0;

};

let x;

function setPatternAmount() {

    x = document.getElementById('pattern_amount').value;

    switch (x) {
        case 'full':
            pattern_amount = 314000;
            break;
        case 'half':
            pattern_amount = 157000;
            break;
        case 'third':
            pattern_amount = 104666;
            break;
        default:
            pattern_amount = 314001;
            break;
    };
}

function setColor() {

    // x = userInputForm['pattern_color'].value;
    x = document.getElementById('pattern_color').value;

    switch (x) {
        case 'red':
            pattern_color = 'rgba(255, 0, 0, 0.3)';
            break;
        case 'green':
            pattern_color = 'rgba(0, 255, 29, 0.3)';
            break;
        case 'blue':
            pattern_color = 'rgba(0, 177, 255, 0.3)';
            break;
        case 'orange':
            pattern_color = 'rgba(255, 128, 0, 0.3)';
            break;
        case 'purple':
            pattern_color = 'rgba(108, 0, 255, 0.3)';
            break;
        default:
            pattern_color = 'rgba(255, 157, 0, 0.3)';
            break;
    };

}

let checkSubmit = function (e) {
    e.preventDefault();

    console.log('checkSubmit function fired');

    if (e && e.keyCode === 13) {
        btnGetFormClick();
    }
};

let checkReset = function (e) {
    if (e && e.keyCode === 82) {
        console.log('checkReset triggered formReset function');
        formReset();
    }
};

function formReset() {
    window.clearInterval(intId);
    intId = null;
    document.getElementById('pauseBtn').removeEventListener('click', pause);
    erase();
}

function pause() {
    // intId = window.setInterval(step, 1000 * dt);

    console.log('from within the pause function');

    let stab = document.getElementById('pauseBtn');
    if (intId == null) {
        intId = window.setInterval(step, 1000 * dt);
        stab.innerHTML = 'Pause';
    } else {
        window.clearInterval(intId);
        intId = null;
        stab.innerHTML = 'Resume';
    }
}

// document.getElementById('saveBtn').addEventListener('click', function (e) {

//     canvas.toBlob(function (blob) {
//         saveAs(blob, 'pretty image.png');
//     });
// });

function erase() {

    console.log('from inside the erase function');

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.rotate(0);
    ctx.translate(0, 0);

    ctx.moveTo(0, 0);

    revolutions = 0;

    centerX = canvas.width / 2;
    centerY = canvas.height / 2;

    theta = 0;
    revolutions = 0;
    s = 256;
    t = 0.0;
    dt = 0.001;
    ns = 100000;
    setns = 100000;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.getElementById('spf').innerHTML = s + 'x';

    document.getElementById('animInput').setAttribute('class', 'center');
    document.getElementById('main').addEventListener('keyup', checkSubmit);
}
