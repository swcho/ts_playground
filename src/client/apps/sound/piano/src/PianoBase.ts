import * as Tone from 'tone';

class PianoBase extends Tone {
    constructor(vol = 0) {
        super(0, 1);
        this.volume = vol;
    }
    get volume() {
        return this.gainToDb(this.output.gain.value);
    }
    set volume(vol) {
        if (this.output) {
            this.output.gain.value = this.dbToGain(vol);
        }
    }
}

export default PianoBase;
