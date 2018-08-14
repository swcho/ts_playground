
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

import * as Tone from 'tone';

declare const tracery;
declare const dynamics;
declare const StartAudioContext;

const c3 = new Tone.Buffer('https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/xylo-c3.mp3');
const g3 = new Tone.Buffer('https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/xylo-g3.mp3');
const c4 = new Tone.Buffer('https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/street-bell-c4.mp3');
const sounds = {
    c3: {
        h: { buffer: c3, duration: 1, offset: 0 },
        l: { buffer: c3, duration: 1, offset: 1 },
        m: { buffer: c3, duration: 1, offset: 2 }
    },
    g3: {
        h: { buffer: g3, duration: 1, offset: 0 },
        l: { buffer: g3, duration: 1, offset: 1 },
        m: { buffer: g3, duration: 1, offset: 2 }
    },
    c4: {
        h: { buffer: c4, duration: 1, offset: 0 },
        l: { buffer: c4, duration: 1, offset: 1 },
        m: { buffer: c4, duration: 1, offset: 2 }
    }
};

const grammar = tracery.createGrammar({
    pattern: ['#cell# #pattern#', '#cell#'],
    cell: ['#two#', '#three#'],
    two: ['#eighth# #eighth#', '#quarter#'],
    three: [
        '#eighth# #eighth# #eighth#',
        '#quarter# #eighth#',
        '#eighth# #quarter#'
    ],
    quarter: ['h-4n', 'l-4n', 'm-4n', 'r-4n'],
    eighth: ['h-8n', 'l-8n', 'm-8n', 'r-8n']
});

const loops = [
    {
        pan: -0.25,
        pitch: 'c4',
        gain: 0.7,
        pattern: generatePattern(grammar),
        vis: initVis(0)
    },
    {
        pan: 0,
        pitch: 'g3',
        gain: 0.6,
        pattern: generatePattern(grammar),
        vis: initVis(1)
    },
    {
        pan: 0.25,
        pitch: 'c3',
        gain: 0.9,
        pattern: generatePattern(grammar),
        vis: initVis(2)
    }
];

function generatePattern(grammar) {
    const pattern = grammar.expand('#pattern#');

    const notes = [];
    let totalDuration = '0';
    pattern.children.forEach(function visit(node) {
        if (node.children) {
            node.children.forEach(visit);
        } else if (node.raw.trim().length) {
            const [velocity, duration] = node.raw.split('-');
            notes.push({ velocity, duration, node });
            totalDuration += '+' + duration;
        }
    });
    return { pattern, notes, totalDuration };
}

Tone.Buffer.on('load', () => {
    const masterGain = new Tone.Gain(0).toMaster();
    const compressor = new Tone.Compressor().connect(masterGain);
    const delay = new Tone.Delay(0.2).connect(compressor);
    masterGain.gain.setValueAtTime(0, Tone.now());
    masterGain.gain.linearRampToValueAtTime(1, Tone.now() + 1.5);

    loops.forEach(({ pattern, pitch, pan, gain, vis }, loopIndex) => {
        const muteGain = new Tone.Gain(1).connect(delay);
        const panner = new Tone.Panner(pan).connect(muteGain);
        const player = new Tone.MultiPlayer().connect(panner);

        renderPattern(pattern, vis, loopIndex);

        const regenButton = document.querySelector(`#regen-${loopIndex}`);
        const muteButton = document.querySelector(`#mute-${loopIndex}`) as HTMLElement;
        const unmuteButton = document.querySelector(`#unmute-${loopIndex}`) as HTMLElement;

        regenButton.addEventListener('click', () => {
            pattern = generatePattern(grammar);
            renderPattern(pattern, vis, loopIndex);
        });
        unmuteButton.style.display = 'none';
        muteButton.addEventListener('click', () => {
            muteGain.gain.setValueAtTime(1, Tone.now());
            muteGain.gain.linearRampToValueAtTime(0, Tone.now() + 0.3);
            muteButton.style.display = 'none';
            unmuteButton.style.display = 'block';
            vis.container.style.opacity = '0.3';
        });
        unmuteButton.addEventListener('click', () => {
            muteGain.gain.setValueAtTime(0, Tone.now());
            muteGain.gain.linearRampToValueAtTime(1, Tone.now() + 0.3);
            muteButton.style.display = 'block';
            unmuteButton.style.display = 'none';
            vis.container.style.opacity = '1';
        });

        function playPattern(baseTime = Tone.now()) {
            // Play each note in pattern once
            let time = baseTime;
            pattern.notes.forEach((note, soundIdx) => {
                const humanize = Math.random() * 0.02 - 0.01;
                if (sounds[pitch].hasOwnProperty(note.velocity)) {
                    const { buffer, offset, duration: sampleDur } = sounds[pitch][
                        note.velocity
                    ];
                    player.start(buffer, time + humanize, offset, sampleDur, 0, gain);
                }
                Tone.Draw.schedule(() => renderPlay(note, vis), time + humanize);
                time += '+' + note.duration;
            }, baseTime);
            // Schedule next iteration
            Tone.Transport.schedule(playPattern, '+' + pattern.totalDuration);
        }
        Tone.Transport.schedule(playPattern);
    });

    Tone.Transport.bpm.value = 120;
    Tone.Transport.start();
});

interface Node {
    velocity;
    duration;
    node;
}

interface Vis {
    container: HTMLElement;
    noteElements: Map<Node, HTMLElement>;
}

function initVis(loopIndex) {
    return {
        container: document.querySelector(`#vis-${loopIndex}`) as HTMLElement,
        noteElements: new Map()
    };
}

function renderPattern(pattern, { container, noteElements }, loopIndex) {
    const fadeDelay = 250;
    const removals = [];
    for (const [note, el] of noteElements) {
        removals.push(
            new Promise(res => {
                el.animate([{ opacity: 1 }, { opacity: 0 }], {
                    duration: fadeDelay,
                    fill: 'forwards'
                }).onfinish = () => {
                    el.remove();
                    res();
                };
            })
        );
        noteElements.delete(note);
    }
    const addedEls = pattern.notes.map(note => {
        const noteEl = document.createElement('div');
        noteEl.classList.add('note');
        noteEl.classList.add(note.velocity);
        noteEl.classList.add(`d-${note.duration}`);
        const mainEl = document.createElement('div');
        mainEl.classList.add('main');
        const symbolEl = document.createElement('div');
        symbolEl.classList.add('symbol');
        mainEl.appendChild(symbolEl);
        noteEl.appendChild(mainEl);
        const progressEl = document.createElement('div');
        progressEl.classList.add('progress');
        noteEl.appendChild(progressEl);
        container.appendChild(noteEl);
        noteElements.set(note, noteEl);
        noteEl.style.opacity = '0';
        return noteEl;
    });
    Promise.all(removals).then(() => {
        addedEls.forEach(el =>
            el.animate([{ opacity: 0 }, { opacity: 1 }], {
                delay: fadeDelay,
                duration: fadeDelay,
                fill: 'forwards'
            })
        );
    });
}

function renderPlay(noteToPlay, { noteElements }: Vis) {
    let playedSeen = false;
    let lastPlayed = true;
    // for (const [note, el] of noteElements) {
    noteElements.forEach((el, note) => {
        if (noteToPlay === note) {
            playedSeen = true;
            bounce(el.querySelector('.symbol'));
            el
                .querySelector('.progress')
                .animate([{ width: 0, opacity: 0 }, { width: '100%', opacity: 1 }] as any, {
                    duration: 300,
                    fill: 'forwards'
                });
            lastPlayed = true;
        } else {
            lastPlayed = false;
        }
    });
    // }
    if (lastPlayed) {
        // for (const [note, el] of noteElements) {
        noteElements.forEach((el, note) => {
            el.querySelector('.progress').animate([{ opacity: 1 }, { opacity: 0 }] as any, {
                delay: 200,
                duration: 100,
                fill: 'forwards'
            });
        });
        // }
    }
}

function bounce(el) {
    dynamics.animate(
        el,
        { translateY: 15 },
        {
            type: dynamics.spring,
            duration: 1,
            friction: 200,
            frequency: 300,
            complete: () =>
                dynamics.animate(
                    el,
                    { translateY: 0 },
                    {
                        type: dynamics.spring,
                        duration: 1000,
                        friction: 200,
                        anticipationSize: -20,
                        anticipationStrength: 310,
                        frequency: 300
                    }
                )
        }
    );
}

StartAudioContext(Tone.context, document.documentElement);
