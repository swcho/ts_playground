
declare module 'tone' {

    class Context {

    }

    class Decibels {

    }

    class GainNode {

    }

    interface Frequency {

    }

    interface Hertz {

    }

    interface Time {

    }

    type Seconds = number;

    interface Ticks {

    }

    interface EventSource {
        on(name: string, callback: Function);
    }

    export class Buffer extends EventSource {
        static on(name: string, callback: Function);

    }

    // https://tonejs.github.io/docs/r11/Buffers
    export class Buffers {
        constructor(urls: Object | string[], callback?: Function, baseUrl?: string);
        // MEMBERS
        baseUrl
        loaded
        // METHODS
        add
        dispose
        get
        has
    }

    // interface AudioParam {
    // }
    type NormalRange = number;

    export class Output {
        gain: {
            value: number;
        };
        start(time: number, arg1, arg2, arg3, arg4);
        stop(time: number, arg1);
        buffer;
    }

    // https://tonejs.github.io/docs/r11/Tone
    export class Tone {
        context: Context;
        output: Output;
        constructor(arg0?: number, arg1?: number);
        receive(channelName: string, channelNumber: number): this;
        send(channelName: string, amount: Decibels): GainNode;
        toFrequency(freq: Frequency): Hertz;
        toSeconds(time: Time): Seconds;
        toTicks(time: Time): Ticks;

        // ??
        gainToDb(gain: NormalRange): Decibels;
        dbToGain(db: Decibels): number;
        isString(arg): boolean;
        connect(output: Output);
        toMaster(): this;
        intervalToFrequencyRatio(interval: Interval): number;
        default(values: any[], keys: any[], constr: Function | Object): Object;

        static Offline(callback: () => void, duration: Time): Promse<Buffer>;
        static connectSeries(nodes: AudioParam | Tone | AudioNode): Tone;
        static dbToGain(db: Decibels): number;
        static defaultArg(given: any, fallback: any): any;
        static defaults(values: any[], keys: any[], constr: Function | Object): Object;
        static equalPowerScale(percent: NormalRange): NormalRange;
        static extend(child: Function, parent?: Function);
        static gainToDb(gain: NormalRange): Decibels;
        static intervalToFrequencyRatio(interval: Interval): number;
        isArray
        isBoolean
        isFunction
        isNote
        isNumber
        isObject
        static isString(arg): boolean;
        isUndef
        loaded
        static now(): number;
    }

    export default Tone;

    // https://tonejs.github.io/docs/r11/AudioNode
    export class AudioNode extends Tone {
        // MEMBERS
        context

        // METHODS
        connect
        disconnect
        dispose
        toMaster
        toMaster
    }


    type MIDI = number;

    // https://tonejs.github.io/docs/r11/Frequency
    export function Frequency(val: string | number, units?: string): {
        // constructor;
        frequencyToMidi
        harmonize
        midiToFrequency
        toFrequency
        toMidi(): MIDI;
        toNote
        toSeconds
        toTicks
        transpose
        add
        clone
        copy
        dispose
        div
        mult
        set
        sub
        valueOf
    };

    export class Gain {

    }

    // https://tonejs.github.io/docs/r11/Part
    export class Part {
        constructor(callback: Function, events: any[]);
        // MEMBERS
        length
        loop
        loopEnd
        loopStart
        playbackRate
        probability
        callback
        mute
        progress
        state
        // METHODS
        add
        at
        cancel
        dispose
        remove
        removeAll
        start
        stop
    }

    // https://tonejs.github.io/docs/r11/Transport
    export module Transport {
        PPQ
        export const bpm;
        loop
        loopEnd
        loopStart
        position
        progress
        seconds
        export const state
        swing
        swingSubdivision
        ticks
        export let timeSignature;

        cancel
        clear
        nextSubdivision
        export function pause();
        schedule
        scheduleOnce
        scheduleRepeat
        setLoopPoints
        export function start();
        stop
        syncSignal
        toggle
        unsyncSignal
        emit
        off
        on

        cancel
        clear
        nextSubdivision
        pause
        static function schedule(callback: Function, time: string);
        scheduleOnce
        scheduleRepeat
        setLoopPoints
        start;
        stop
        syncSignal
        toggle
        unsyncSignal
        emit
        off
        on
    }


    export class Master {

    }

    // https://tonejs.github.io/docs/r11/BufferSource
    export class BufferSource extends AudioNode {
        constructor(buffer);
        // MEMBERS
        buffer
        curve
        fadeIn
        fadeOut
        loop
        loopEnd
        loopStart
        onended
        playbackRate
        state
        context
        // METHODS
        dispose
        start
        stop
        connect
        disconnect
        toMaster
    }

    // https://tonejs.github.io/docs/r11/Draw
    export class Draw {
        // MEMBERS
        anticipation
        expiration

        // METHODS
        cancel
        schedule

        // STATIC METHODS
        cancel
        static schedule(callback: Function, time: Time);
    }

    // https://tonejs.github.io/docs/r11/Compressor
    export class Compressor {
        // MEMBERS
        attack
        knee
        ratio
        release
        threshold
        context

        // METHODS
        dispose
        connect
        disconnect
        toMaster(): AudioNode;
    }

    export function now(): number;
    export const context: Context;
}
