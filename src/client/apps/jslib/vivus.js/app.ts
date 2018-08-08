
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';
import $ = require('jquery');

declare const Vivus;

let v_osomatsu = new Vivus('osomatsu', { type: 'scenario-sync', start: 'autostart', duration: 15, forceRender: false });
let v_karamatsu = new Vivus('karamatsu', { type: 'scenario-sync', start: 'autostart', duration: 15, forceRender: false });
let v_choromatsu = new Vivus('choromatsu', { type: 'scenario-sync', start: 'autostart', duration: 15, forceRender: false });
let v_ichimatsu = new Vivus('ichimatsu', { type: 'scenario-sync', start: 'autostart', duration: 15, forceRender: false });
let v_jyushimatsu = new Vivus('jyushimatsu', { type: 'scenario-sync', start: 'autostart', duration: 15, forceRender: false });
let v_todomatsu = new Vivus('todomatsu', { type: 'scenario-sync', start: 'autostart', duration: 15, forceRender: false });

$('.om').click(function () {
    $('#container').addClass('c_bg_1');
    $('#container').removeClass('c_bg_2');
    $('#container').removeClass('c_bg_3');
    $('#container').removeClass('c_bg_4');
    $('#container').removeClass('c_bg_5');
    $('#container').removeClass('c_bg_6');
    document.getElementById('karamatsu').style.display = 'none';
    document.getElementById('choromatsu').style.display = 'none';
    document.getElementById('ichimatsu').style.display = 'none';
    document.getElementById('jyushimatsu').style.display = 'none';
    document.getElementById('todomatsu').style.display = 'none';
    document.getElementById('osomatsu').style.display = 'block';
    v_osomatsu.reset();
    v_osomatsu.play();
});

$('.ok').click(function () {
    $('#container').addClass('c_bg_2');
    $('#container').removeClass('c_bg_1');
    $('#container').removeClass('c_bg_3');
    $('#container').removeClass('c_bg_4');
    $('#container').removeClass('c_bg_5');
    $('#container').removeClass('c_bg_6');
    document.getElementById('osomatsu').style.display = 'none';
    document.getElementById('choromatsu').style.display = 'none';
    document.getElementById('ichimatsu').style.display = 'none';
    document.getElementById('jyushimatsu').style.display = 'none';
    document.getElementById('todomatsu').style.display = 'none';
    document.getElementById('karamatsu').style.display = 'block';
    v_karamatsu.reset();
    v_karamatsu.play();
});

$('.oc').click(function () {
    $('#container').addClass('c_bg_3');
    $('#container').removeClass('c_bg_1');
    $('#container').removeClass('c_bg_2');
    $('#container').removeClass('c_bg_4');
    $('#container').removeClass('c_bg_5');
    $('#container').removeClass('c_bg_6');
    document.getElementById('osomatsu').style.display = 'none';
    document.getElementById('karamatsu').style.display = 'none';
    document.getElementById('ichimatsu').style.display = 'none';
    document.getElementById('jyushimatsu').style.display = 'none';
    document.getElementById('todomatsu').style.display = 'none';
    document.getElementById('choromatsu').style.display = 'block';
    v_choromatsu.reset();
    v_choromatsu.play();
});

$('.oi').click(function () {
    $('#container').addClass('c_bg_4');
    $('#container').removeClass('c_bg_1');
    $('#container').removeClass('c_bg_2');
    $('#container').removeClass('c_bg_3');
    $('#container').removeClass('c_bg_5');
    $('#container').removeClass('c_bg_6');
    document.getElementById('osomatsu').style.display = 'none';
    document.getElementById('karamatsu').style.display = 'none';
    document.getElementById('choromatsu').style.display = 'none';
    document.getElementById('jyushimatsu').style.display = 'none';
    document.getElementById('todomatsu').style.display = 'none';
    document.getElementById('ichimatsu').style.display = 'block';
    v_ichimatsu.reset();
    v_ichimatsu.play();
});

$('.oj').click(function () {
    $('#container').addClass('c_bg_5');
    $('#container').removeClass('c_bg_1');
    $('#container').removeClass('c_bg_2');
    $('#container').removeClass('c_bg_3');
    $('#container').removeClass('c_bg_4');
    $('#container').removeClass('c_bg_6');
    document.getElementById('osomatsu').style.display = 'none';
    document.getElementById('karamatsu').style.display = 'none';
    document.getElementById('choromatsu').style.display = 'none';
    document.getElementById('ichimatsu').style.display = 'none';
    document.getElementById('todomatsu').style.display = 'none';
    document.getElementById('jyushimatsu').style.display = 'block';
    v_jyushimatsu.reset();
    v_jyushimatsu.play();
});

$('.ot').click(function () {
    $('#container').addClass('c_bg_6');
    $('#container').removeClass('c_bg_1');
    $('#container').removeClass('c_bg_2');
    $('#container').removeClass('c_bg_3');
    $('#container').removeClass('c_bg_4');
    $('#container').removeClass('c_bg_5');
    document.getElementById('osomatsu').style.display = 'none';
    document.getElementById('karamatsu').style.display = 'none';
    document.getElementById('choromatsu').style.display = 'none';
    document.getElementById('ichimatsu').style.display = 'none';
    document.getElementById('jyushimatsu').style.display = 'none';
    document.getElementById('todomatsu').style.display = 'block';

    v_todomatsu.reset();
    v_todomatsu.play();
});
