
declare module 'midiconvert' {
    export interface Note {
        time: number,
        name: string,
        midi: number,
        velocity: number,
        duration: number,
    };

    export interface Track {
        name: string,
        instrument: string,
        instrumentNumber: number,
        instrumentFamily: string,
        notes: Array<Note>,
        duration: number,
        length: number,

        // ??
        controlChanges: any[];
        noteOffs;

    };

    export interface ControlChange {
        time: number,
        name: string,
        midi: number,
        velocity: number,
        duration: number,
    };

    export interface MIDI {
        header: {
            bpm: number,
            timeSignature: [number, number],
            PPQ: number,
        },
        duration: number,

        tracks: Array<Track>,

        controlChanges: {
            [key: number]: ControlChange
        },
        bpm;
        timeSignature;
    };

    export function parse(raw: ArrayBuffer): MIDI;
    export function load(url: string, data?: any, method?: 'GET' | 'POST'): Promise<MIDI>;
    export function create(): MIDI;

    export interface StringsByID {
        [index: number]: string;
    }

    export const instrumentByPatchID: StringsByID;
    export const instrumentFamilyByID: StringsByID;


}
