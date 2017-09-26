/*
const tileSize = 16;
const tileColors = [
    '#00c', // ocean
    '#007dc3', // deep water
    '#7b9bba', // shallows
    '#bdbd58', // sandy shore
    '#009e00', // light grass
    '#080', // dark grass
];
const tilemap = new GeoGenTilemap(tileSize, tileColors);
document.body.appendChild(tilemap.spritesheetEl);
*/

import {Chunk} from './geogenpattern';

interface DrawFunc {
    (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, backgroundColor: string, foregroundColor: string): void;
}

export interface TileFinder {
    (x: number, y: number): [number, number];
}

type DrawName = 'drawNW' | 'drawNE' | 'drawN' | 'drawSW' | 'drawW' | 'drawSWNE' | 'drawNNWW' | 'drawSE' | 'drawNWSE' | 'drawE' | 'drawNNEE' | 'drawS' | 'drawSSWW' | 'drawSSEE';

export class GeoGenTilemap {

    private ring: DrawFunc[][];
    private spritesheetEl: HTMLCanvasElement;
    tileLibrary;

    constructor(tileSize: number, tileColors: string[]) {
        const { drawNW, drawNE, drawN, drawSW, drawW, drawSWNE, drawNNWW, drawSE, drawNWSE, drawE, drawNNEE, drawS, drawSSWW, drawSSEE } = this.tiles;
        this.ring = [
            [drawNW, drawNE, drawN, drawSW, drawW, drawSWNE, drawNNWW, drawSE, drawNWSE, drawE, drawNNEE, drawS, drawSSWW, drawSSEE],
            [drawNW, drawNE, drawN, drawSW, drawW, drawSWNE, drawNNWW, drawSE, drawNWSE, drawE, drawNNEE, drawS, drawSSWW, drawSSEE]
        ];
        this.spritesheetEl = document.createElement('canvas');
        this.spritesheetEl.width = 15 * tileSize;
        this.spritesheetEl.height = (tileColors.length * 2 + 2) * tileSize;
        const spritesheetCtx = this.spritesheetEl.getContext('2d');
        const { width, height } = this.spritesheetEl;
        this.drawSpriteSheet(spritesheetCtx, tileSize, tileColors, width, height);
        this.tileLibrary = this.buildTileLibrary(this.spritesheetEl, tileSize);
    }

    buildTileLibrary(spritesheetEl: HTMLCanvasElement, tileSize: number) {
        const cols = spritesheetEl.width / tileSize;
        const rows = spritesheetEl.height / tileSize;
        const library = [];
        for (let yIndex = 0, xIndex; yIndex < rows; yIndex++) {
            library[yIndex] = [];
            for (xIndex = 0; xIndex < cols; xIndex++) {
                const tileEl = document.createElement('canvas');
                tileEl.width = tileSize;
                tileEl.height = tileSize;
                const tileCtx = tileEl.getContext('2d');
                tileCtx.drawImage(spritesheetEl, xIndex * tileSize, yIndex * tileSize, tileSize, tileSize, 0, 0, tileSize, tileSize);
                library[yIndex][xIndex] = tileEl;
            }
        }
        return library;
    }

    drawSpriteSheet(ctx: CanvasRenderingContext2D, tileSize: number, tileColors: string[], width: number, height: number) {
        const lastColor = tileColors[tileColors.length - 1];
        ctx.fillStyle = lastColor;
        ctx.fillRect(0, 0, width, height);
        tileColors.forEach((backgroundColor, index) => {
            const nextIndex = Math.min(index + 1, tileColors.length - 1);
            const foregroundColor = tileColors[nextIndex];
            const isOdd = index % 2 === 0;
            let bgColor = backgroundColor;
            let fgColor = foregroundColor;
            if (!isOdd) {
                bgColor = foregroundColor;
                fgColor = backgroundColor;
            }
            this.drawRing(ctx, this.ring, isOdd, index * (tileSize * 2), tileSize, bgColor, fgColor);
        });
    }

    drawRing(ctx: CanvasRenderingContext2D, ring: DrawFunc[][], isOdd: boolean, offsetY: number, tileSize: number, backgroundColor: string, foregroundColor: string) {
        const offsetX = isOdd ? tileSize : 0;
        ring.forEach((track, yIndex) => {
            const y = yIndex * tileSize;
            track.forEach((drawFn, xIndex) => {
                const x = xIndex * tileSize;
                drawFn(ctx, offsetX + x, offsetY + y, tileSize, backgroundColor, foregroundColor);
            });
        });
        if (isOdd) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, offsetY, tileSize, ring.length * tileSize);
        } else {
            ctx.fillStyle = foregroundColor;
            ctx.fillRect(ring[0].length * tileSize, offsetY, tileSize, ring.length * tileSize);
        }
    }

    tilePositionFinder(heightmap: Chunk): TileFinder {
        const worldTileHeight = heightmap.length;
        const worldTileWidth = heightmap[0].length;
        const clampX = (x) => (x + worldTileWidth) % worldTileWidth;
        const clampY = (y) => (y + worldTileHeight) % worldTileHeight;
        const collectNeighbors = (x, y) => {
            return [
                heightmap[clampY(y)][clampX(x)],
                heightmap[clampY(y)][clampX(x + 1)],
                heightmap[clampY(y + 1)][clampX(x)],
                heightmap[clampY(y + 1)][clampX(x + 1)],
            ];
        };
        const memo = {};
        return (xIndex: number, yIndex: number) => {
            const index = `${xIndex}_${yIndex}`;
            if (memo[index] !== undefined) {
                return memo[index];
            }
            const [sTL, sTR, sBL, sBR] = collectNeighbors(xIndex, yIndex);
            const hTL = sTL >> 1;
            const hTR = sTR >> 1;
            const hBL = sBL >> 1;
            const hBR = sBR >> 1;
            const saddle = ((sTL & 1) + (sTR & 1) + (sBL & 1) + (sBR & 1) + 1) >> 2;
            const shape = (hTL & 1) | (hTR & 1) << 1 | (hBL & 1) << 2 | (hBR & 1) << 3;
            const ring = (hTL + hTR + hBL + hBR) >> 2;
            const row = (ring << 1) | saddle;
            const col = shape - (ring & 1);
            memo[index] = [col, row];
            return memo[index];
        };
    }

    tiles: { [drawName: string]: DrawFunc } = {
        drawSSEE: (ctx, x, y, size, backgroundColor, foregroundColor) => {
            const halfSize = size / 2;
            ctx.fillStyle = foregroundColor;
            ctx.fillRect(x, y, size, size);
            ctx.beginPath();
            ctx.fillStyle = backgroundColor;
            ctx.moveTo(x + halfSize, y);
            ctx.quadraticCurveTo(x + halfSize, y + halfSize, x, y + halfSize);
            ctx.lineTo(x, y);
            ctx.fill();
            ctx.closePath();
        },

        drawSSWW: (ctx, x, y, size, backgroundColor, foregroundColor) => {
            const halfSize = size / 2;
            ctx.fillStyle = foregroundColor;
            ctx.fillRect(x, y, size, size);
            ctx.beginPath();
            ctx.fillStyle = backgroundColor;
            ctx.moveTo(x + halfSize, y);
            ctx.quadraticCurveTo(x + halfSize, y + halfSize, x + size, y + halfSize);
            ctx.lineTo(x + size, y);
            ctx.fill();
            ctx.closePath();
        },

        drawS: (ctx, x, y, size, backgroundColor, foregroundColor) => {
            const halfSize = size / 2;
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, size, size);
            ctx.fillStyle = foregroundColor;
            ctx.fillRect(x, y + halfSize, size, halfSize);
        },

        drawNNEE: (ctx, x, y, size, backgroundColor, foregroundColor) => {
            const halfSize = size / 2;
            ctx.fillStyle = foregroundColor;
            ctx.fillRect(x, y, size, size);
            ctx.beginPath();
            ctx.fillStyle = backgroundColor;
            ctx.moveTo(x, y + halfSize);
            ctx.quadraticCurveTo(x + halfSize, y + halfSize, x + halfSize, y + size);
            ctx.lineTo(x, y + size);
            ctx.fill();
            ctx.closePath();
        },

        drawE: (ctx, x, y, size, backgroundColor, foregroundColor) => {
            const halfSize = size / 2;
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, size, size);
            ctx.fillStyle = foregroundColor;
            ctx.fillRect(x + halfSize, y, halfSize, size);
        },

        drawNWSE: (ctx, x, y, size, backgroundColor, foregroundColor) => {
            const halfSize = size / 2;
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, size, size);
            ctx.beginPath();
            ctx.fillStyle = foregroundColor;
            ctx.moveTo(x + size, y + halfSize);
            ctx.quadraticCurveTo(x + halfSize, y + halfSize, x + halfSize, y + size);
            ctx.lineTo(x + size, y + size);
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.fillStyle = foregroundColor;
            ctx.moveTo(x + halfSize, y);
            ctx.quadraticCurveTo(x + halfSize, y + halfSize, x, y + halfSize);
            ctx.lineTo(x, y);
            ctx.fill();
            ctx.closePath();
        },

        drawSE: (ctx, x, y, size, backgroundColor, foregroundColor) => {
            const halfSize = size / 2;
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, size, size);
            ctx.beginPath();
            ctx.fillStyle = foregroundColor;
            ctx.moveTo(x + size, y + halfSize);
            ctx.quadraticCurveTo(x + halfSize, y + halfSize, x + halfSize, y + size);
            ctx.lineTo(x + size, y + size);
            ctx.fill();
            ctx.closePath();
        },

        drawNNWW: (ctx, x, y, size, backgroundColor, foregroundColor) => {
            const halfSize = size / 2;
            ctx.fillStyle = foregroundColor;
            ctx.fillRect(x, y, size, size);
            ctx.beginPath();
            ctx.fillStyle = backgroundColor;
            ctx.moveTo(x + size, y + halfSize);
            ctx.quadraticCurveTo(x + halfSize, y + halfSize, x + halfSize, y + size);
            ctx.lineTo(x + size, y + size);
            ctx.fill();
            ctx.closePath();
        },

        drawSWNE: (ctx, x, y, size, backgroundColor, foregroundColor) => {
            const halfSize = size / 2;
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, size, size);
            ctx.beginPath();
            ctx.fillStyle = foregroundColor;
            ctx.moveTo(x, y + halfSize);
            ctx.quadraticCurveTo(x + halfSize, y + halfSize, x + halfSize, y + size);
            ctx.lineTo(x, y + size);
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.fillStyle = foregroundColor;
            ctx.moveTo(x + halfSize, y);
            ctx.quadraticCurveTo(x + halfSize, y + halfSize, x + size, y + halfSize);
            ctx.lineTo(x + size, y);
            ctx.fill();
            ctx.closePath();
        },

        drawW: (ctx, x, y, size, backgroundColor, foregroundColor) => {
            const halfSize = size / 2;
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, size, size);
            ctx.fillStyle = foregroundColor;
            ctx.fillRect(x, y, halfSize, size);
        },

        drawSW: (ctx, x, y, size, backgroundColor, foregroundColor) => {
            const halfSize = size / 2;
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, size, size);
            ctx.beginPath();
            ctx.fillStyle = foregroundColor;
            ctx.moveTo(x, y + halfSize);
            ctx.quadraticCurveTo(x + halfSize, y + halfSize, x + halfSize, y + size);
            ctx.lineTo(x, y + size);
            ctx.fill();
            ctx.closePath();
        },

        drawN: (ctx, x, y, size, backgroundColor, foregroundColor) => {
            const halfSize = size / 2;
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, size, size);
            ctx.fillStyle = foregroundColor;
            ctx.fillRect(x, y, size, halfSize);
        },

        drawNE: (ctx, x, y, size, backgroundColor, foregroundColor) => {
            const halfSize = size / 2;
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, size, size);
            ctx.beginPath();
            ctx.fillStyle = foregroundColor;
            ctx.moveTo(x + halfSize, y);
            ctx.quadraticCurveTo(x + halfSize, y + halfSize, x + size, y + halfSize);
            ctx.lineTo(x + size, y);
            ctx.fill();
            ctx.closePath();
        },

        drawNW: (ctx, x, y, size, backgroundColor, foregroundColor) => {
            const halfSize = size / 2;
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, size, size);
            ctx.beginPath();
            ctx.fillStyle = foregroundColor;
            ctx.moveTo(x + halfSize, y);
            ctx.quadraticCurveTo(x + halfSize, y + halfSize, x, y + halfSize);
            ctx.lineTo(x, y);
            ctx.fill();
            ctx.closePath();
        }
    };
}
