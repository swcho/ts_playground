
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

import './style.scss';
import { ClipboardEvent } from 'react';

// random image on page load
let images = [
    require('./ksImg.jpg'),
    // require('./Colorfuleye.jpg'),
    // require('./geometric.jpg'),
    // require('./bwSpiral.jpg'),
    // require('./colorfulVertex.jpg'),
];

let rndImg = function () {
    let len = images.length;
    let rnd = Math.floor(Math.random() * len);
    return images[rnd];
};

let opts = {
    imgURL: rndImg(),
    speed: 0.002,
    segmentSize: 200,
    smoothing: 0.1,
};

class Obj {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private segmentWidth: number;
    private segmentHeight: number;

    private fillStyle: string | CanvasPattern;
    offsetX: number;
    offsetY: number;
    rotation: number;

    private stock: HTMLCanvasElement;
    private stockctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement, segmentMotion: number) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.font = 'bold 24px monospace';
        this.segmentWidth = segmentMotion;
        this.segmentHeight = segmentMotion * Math.sqrt(3) / 2;
        console.log('segment', this.segmentWidth, this.segmentHeight);

        this.fillStyle = 'hsla(0,0%,0%,1)';
        this.offsetX = 0;
        this.offsetY = 0;
        this.rotation = 0;

        this.stock = document.createElement('canvas');
        this.stock.width = segmentMotion * 9 / 2;
        this.stock.height = segmentMotion;
        this.stockctx = this.stock.getContext('2d');
    }

    draw() {
        const stockCtx = this.stockctx;
        let segmentWidth = this.segmentWidth;
        let segmentHeight = this.segmentHeight;
        stockCtx.fillStyle = this.fillStyle;
        stockCtx.strokeStyle = this.fillStyle;

        // red border for debug
        stockCtx.strokeStyle = '#ff0000';

        stockCtx.clearRect(0, 0, this.stock.width, this.stock.height);

        this.drawSegment(stockCtx, 0, 0, 0, false);
        this.drawSegment(stockCtx, segmentWidth, 0, Math.PI / 3, true);
        this.drawSegment(stockCtx, segmentWidth * 3 / 2, segmentHeight, Math.PI * 4 / 3, false);
        this.drawSegment(stockCtx, segmentWidth * 5 / 2, segmentHeight, Math.PI * 3 / 3, true);
        this.drawSegment(stockCtx, segmentWidth * 3, 0, Math.PI * 2 / 3, false);
        this.drawSegment(stockCtx, segmentWidth * 5 / 2, segmentHeight, Math.PI * 5 / 3, true);

        const ctx = this.ctx;
        let ofsX = 0;

        // start 0 for debug
        let heightstart = 0;
        // let heightstart = -1;

        let initPOV = 0;
        let heightend = Math.ceil(this.canvas.width / (segmentWidth * 3));
        let finalPOV = Math.ceil(this.canvas.height / segmentHeight);

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Display fillStyle for debug
        // ctx.fillStyle = this.fillStyle;
        // ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = initPOV; i < finalPOV; i++) {
            for (let j = heightstart; j < heightend; j++) {
                const x = j * segmentWidth * 3 + ofsX;
                const y = i * segmentHeight;
                // console.log('repeate segment', x, y);
                ctx.drawImage(this.stock, x, y);

                // Draw single image for debug
                // return;
            }
            ofsX = segmentWidth * 3 / 2 - ofsX;
        }
    }

    resize(w: number, h: number) {
        this.canvas.width = w;
        this.canvas.height = h;
    }

    setImage(img: HTMLImageElement) {
        const calibrate = Math.max(this.segmentWidth / img.naturalWidth, this.segmentHeight / img.naturalHeight);
        console.log('setImage', calibrate);

        if (calibrate < 1.0) {
            const pre = document.createElement('canvas');
            Set.partitions(pre, img, calibrate);
            this.fillStyle = this.stockctx.createPattern(pre, 'repeat');
        } else {
            this.fillStyle = this.stockctx.createPattern(img, 'repeat');
        }
    }

    drawSegment(ctx: CanvasRenderingContext2D, kx: number, ky: number, dt: number, reverse: boolean) {
        let w = this.segmentWidth;
        let h = this.segmentHeight;
        ctx.save();
        ctx.translate(kx, ky);
        ctx.rotate(dt);
        if (reverse) {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
        }
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w, 0);
        ctx.lineTo(w / 2, h);
        ctx.closePath();

        ctx.translate(this.offsetX, this.offsetY);
        ctx.rotate(this.rotation);
        ctx.fill();
        // debug positiong
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`${this.offsetX},${this.offsetY},${this.rotation}`, 20, 20, 200);

        ctx.stroke();
        ctx.restore();
    }
}

let ks: Obj, kx, ky;

namespace Set {
    export function partitions(display: HTMLCanvasElement, img: HTMLImageElement, scale: number) {
        let c1 = document.createElement('canvas');
        let c2 = document.createElement('canvas');
        let w = c1.width = c2.width = img.naturalWidth || img.width;
        let h = c1.height = c2.height = img.naturalHeight || img.height;
        let $ = c1.getContext('2d');
        let $$ = c2.getContext('2d');
        $.drawImage(img, 0, 0);

        while (scale < 0.3) {
            $$.clearRect(0, 0, w / 2, h / 2);
            $$.drawImage(c1, 0, 0, w, h, 0, 0, w / 2, h / 2);
            w /= 2;
            h /= 2;
            scale *= 2;
            let hiddencanvas = c1;
            c1 = c2;
            c2 = hiddencanvas;
            let hiddencontext = $;
            $ = $$;
            $$ = hiddencontext;
        }
        display.width = w * scale;
        display.height = h * scale;
        display.getContext('2d').drawImage(c1, 0, 0, w, h, 0, 0, w * scale, h * scale);
    }
}


function ready() {
    let c = document.getElementById('canv') as HTMLCanvasElement;
    ks = new Obj(c, opts.segmentSize);
    ks.resize(window.innerWidth, window.innerHeight);
    kx = 0;
    ky = 0;

    loadImage(opts.imgURL, setImage);

    window.addEventListener('mousemove', function (e) {
        kx = (e.clientX / window.innerWidth - 0.5) * opts.segmentSize;
        ky = (e.clientY / window.innerHeight - 0.5) * opts.segmentSize;
    });

    window.addEventListener('touchmove', function (e) {
        e.preventDefault();
        kx = (e.touches[0].clientX / window.innerWidth - 0.5) * opts.segmentSize;
        ky = (e.touches[0].clientY / window.innerHeight - 0.5) * opts.segmentSize;
    });


    window.addEventListener('dragover', function (e) {
        e.preventDefault();
    });

    window.addEventListener('drop', function (e) {
        e.preventDefault();
        if (e.dataTransfer.files.length < 1) {
            return;
        }
        openFile(e.dataTransfer.files[0], setImage);
    });

    window.addEventListener('paste', function (evt) {
        const e: ClipboardEvent<HTMLElement> = evt as any;
        if (!e.clipboardData) return;
        let items = e.clipboardData.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') === -1) continue;
            let item = items[i].getAsFile();
            let URL = window.URL;
            let src = URL.createObjectURL(item);
            copyPasteImage(src, setImage);
        }
    });

    window.addEventListener('deviceorientation', function (e) {
        kx = opts.segmentSize * Math.sin(e.beta * Math.PI / 180);
        ky = opts.segmentSize * Math.sin(e.gamma * Math.PI / 90);
    });

    setTimeout(function () {
        window.addEventListener('resize', function (e) {
            ks.resize(window.innerWidth, window.innerHeight);
        });
    }, 3000);
}

function draw() {
    ks.offsetX += (kx - ks.offsetX) * opts.smoothing;
    ks.offsetY += (ky - ks.offsetY) * opts.smoothing;
    ks.rotation += opts.speed;
    ks.draw();
    window.requestAnimationFrame(draw);
}

function openFile(file, callback) {
    if (file.type.lastIndexOf('image') !== 0) {
        alert('Bad, Bad Image');
        return;
    }
    loadImage(URL.createObjectURL(file), callback);
}

function copyPasteImage(src, callback) {
    let img = new Image();
    img.onload = function (e) {
        callback(e.target);
    };
    img.src = src;
}

function loadImage(src, callback) {
    let img = new Image();
    img.onload = function (e) {
        callback(e.target);
    };
    img.src = src;
}

function setImage(img) {
    ks.setImage(img);
    draw();
}

ready();
console.log('Code With ❤ Always, @tmrDevelops');
