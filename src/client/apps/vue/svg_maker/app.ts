
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

import './style.scss';
import * as $ from 'jquery';
import Vue from 'vue';
import {TimelineMax, TimelineLite, Sine} from 'gsap';

new Vue({
    el: '#app',
    data() {
        return {
            type: 'hi there',
            size: 800,
            numLines: 100,
            textFill: '#131562',
            textStroke: '#D7EfEC',
            textSize: 70,
            gradients: ['url(#rad-gradient1)', 'url(#rad-gradient3)', 'url(#rad-gradient2)'],
            gradients2: ['url(#lin-gradient1)', 'url(#lin-gradient2)']
        };
    },
    methods: {
        downloadSVG() {
            const svgData = this.$refs.figure.outerHTML;
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);

            this.$refs.dl.href = svgUrl;
            this.$refs.dl.download = 'funtimes.svg';
        },
        createRandLines() {
            const svgNS = this.$refs.figure.namespaceURI;
            this.$refs.patterngroup.innerHTML = '';

            for (let i = 0; i < this.numLines; i++) {
                let line = document.createElementNS(svgNS, 'line');
                this.append(this.$refs.patterngroup, line);
                this.setAttributes(line, {
                    'x1': this.totesRando(this.size, 0),
                    'x2': this.totesRando(this.size, 0),
                    'y1': this.totesRando(this.size, 0),
                    'y2': this.totesRando(this.size, 0),
                    'stroke': this.gradients2[this.totesRando(1, 0)],
                    'stroke-width': 3
                });
            }
        },
        createBigLines() {
            const svgNS = this.$refs.figure.namespaceURI;
            this.$refs.patterngroup.innerHTML = '';

            for (let i = 0; i < this.numLines; i++) {
                let line = document.createElementNS(svgNS, 'line');
                this.append(this.$refs.patterngroup, line);
                this.setAttributes(line, {
                    'x1': this.size / 2,
                    'x2': this.totesRando(this.size, 0),
                    'y1': this.size / 2,
                    'y2': this.totesRando(this.size, 0),
                    'stroke': this.gradients[this.totesRando(2, 0)],
                    'stroke-width': 3
                });
            }
        },
        createBigCircles() {
            const svgNS = this.$refs.figure.namespaceURI;
            this.$refs.patterngroup.innerHTML = '';

            for (let i = 0; i < this.numLines / 2; i++) {
                let circ = document.createElementNS(svgNS, 'circle');
                this.append(this.$refs.patterngroup, circ);
                this.setAttributes(circ, {
                    'cx': this.size / 2,
                    'cy': this.size / 2,
                    'r': this.totesRando(this.size / 2, 0),
                    'fill': 'none',
                    'stroke': this.gradients2[this.totesRando(1, 0)],
                    'stroke-width': 1
                });
            }
        },
        createSmCircles() {
            const svgNS = this.$refs.figure.namespaceURI;
            this.$refs.patterngroup.innerHTML = '';

            for (let i = 0; i < this.numLines; i++) {
                let circ = document.createElementNS(svgNS, 'circle');
                this.append(this.$refs.patterngroup, circ);
                this.setAttributes(circ, {
                    'cx': this.totesRando(this.size, 0),
                    'cy': this.totesRando(this.size, 0),
                    'r': this.totesRando(10, 3),
                    'fill': 'none',
                    'stroke': this.gradients[this.totesRando(2, 0)],
                    'stroke-width': 1
                });
            }
        },
        animation() {
            let tl = new TimelineMax();

            tl.add('begin');
            tl.to('line', 2, {
                rotation: 360,
                repeat: -1,
                transformOrigin: '50% 50%',
                ease: Sine.easeOut
            }, 'begin');
            tl.staggerTo('circle', 1.6, {
                cycle: {
                    y: [10, -10, -5, 5, -20, 3],
                    x: [-5, 5, -20, 3, 10, -10],
                },
                repeat: -1,
                yoyo: true,
                ease: Sine.easeOut
            }, 0.01, 'begin');

            return tl;
        },
        pauseAnim() {
            let tl = TimelineLite.exportRoot();
            tl.pause(0);
        },
        setAttributes(el, attrs) {
            for (let key in attrs) {
                el.setAttribute(key, attrs[key]);
            }
        },
        append(el, addition) {
            el.appendChild(addition);
        },
        totesRando(max, min) {
            return Math.floor(Math.random() * (1 + max - min) + min);
        }
    },
    mounted() {
        const elFigure = this.$refs.figure;
        const svgNS = this.$refs.figure.namespaceURI,
            vbx = document.createElementNS(svgNS, 'viewBox');

        console.log(elFigure);
        this.setAttributes(elFigure, {
            'viewBox': `0 0 ${this.size} ${this.size}`,
        });

        this.createBigLines();
    }
});
