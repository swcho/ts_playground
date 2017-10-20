import * as Tone from 'tone';

function noteToMidi(note) {
    return new Tone.Frequency(note).toMidi();
}

function midiToNote(midi) {
    return new Tone.Frequency(midi, 'midi').toNote().replace('#', 's');
}

function midiToFrequencyRatio(midi) {
    let mod = midi % 3;
    if (mod === 1) {
        return [midi - 1, Tone.prototype.intervalToFrequencyRatio(1)];
    } else if (mod === 2) {
        return [midi + 1, Tone.prototype.intervalToFrequencyRatio(-1)];
    } else {
        return [midi, 1];
    }
}

function createSource(buffer) {
    return new Tone.BufferSource(buffer);
}

export { midiToNote, noteToMidi, createSource, midiToFrequencyRatio }
