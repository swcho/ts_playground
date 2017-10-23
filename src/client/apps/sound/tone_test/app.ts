
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import * as Tone from 'tone';

Tone.Transport.schedule(time => {
    console.log('1m');
}, '1m');

Tone.Transport.schedule(function (time) {
    // invoked when the Transport starts
    console.log('start', time);
}, 0);

Tone.Transport.scheduleRepeat(time => {
    console.log('repeate', time);
}, '8n', '1m');

const synth = new Tone.PolySynth(4, Tone.MonoSynth);

synth.set({
    'envelop': {
        'attack': 0.1,
    }
});


const dist = new Tone.Distortion().toMaster();

// const synth2  = new Tone.SimpleSynth().connect(dist);

// synth2.triggerAttackRelease('c4', '8n');


Tone.Transport.start();
