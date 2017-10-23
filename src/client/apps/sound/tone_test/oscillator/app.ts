
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import '../example.scss';
import * as Tone from 'tone';

let osc = new Tone.Oscillator(
    300,
    'triangle'
).toMaster();

Tone.Transport.schedule(() => {
    Tone.Master.volume.value = -Infinity;
    osc.start();
    Tone.Master.volume.rampTo(-10, 0);
    // Tone.Master.volume.rampTo(0, 0.05);
    // Tone.Master.volume.rampTo(0, 0.05);
    // Tone.Master.volume.rampTo(-Infinity, 0.05);
}, 0);

Tone.Transport.schedule(() => {
    osc.frequency.value = 1000;
}, 1);

Tone.Transport.schedule(() => {
    osc.stop();
}, 2);

const osc2 = new Tone.AmplitudeEnvelope({
});


Tone.Transport.start();
