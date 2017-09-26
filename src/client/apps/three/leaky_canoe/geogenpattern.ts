/*
const options = {
  chunkTileHeight: 10,
  chunkTileWidth: 10,
  maxHeight: 5,
  worldChunkHeight: 4,
  worldChunkWidth: 4
};

const seed = 5625463739;

function sampleFn () {
  const lookup = [];
  return (index, x, y) => { // must return number between 0 and 1
    if (lookup[index]) {
      return lookup[index];
    }
    lookup[index] = Math.random();
    return lookup[index];
  }
}

const geoGenPattern = new GeoGenPattern(sampleFn(), seed, options);
console.log('cell', geoGenPattern.getCell(20, 20));
*/

interface SampeFunc {
    (index: number, x: number, y: number, seed: number): number;
}

interface Options {
    chunkTileHeight?: number;
    chunkTileWidth?: number;
    maxHeight?: number;
    worldChunkHeight?: number;
    worldChunkWidth?: number;
}

interface ComputedOptions extends Options {
    worldTileHeight: number;
    worldTileWidth: number;
}

export type Chunk = number[][];

interface ChunkCache {
    [worldX: number]: {
        [worldY: number]: Chunk;
    };
}

type Edge = {[i: number]: number};

export class GeoGenPattern {

    static defaultOptions: Options = {
        chunkTileHeight: 10,
        chunkTileWidth: 10,
        maxHeight: 5,
        worldChunkHeight: 4,
        worldChunkWidth: 4
    };

    options: ComputedOptions;

    // worldChunkWidth * worldChunkHeight
    chunkCache: ChunkCache = [];

    // (chunkTileWidth * worldChunkWidth) * (chunkTileWidth * worldChunkHeight)
    tileCache: Chunk = [];

    constructor(private sampleFn: SampeFunc, private seed: number, options: Options, cacheAllTiles = true) {
        console.log('seed', seed);
        this.seed = seed;
        const { defaultOptions } = GeoGenPattern;
        const combinedOptions = {...defaultOptions, ...options};
        const { chunkTileWidth, chunkTileHeight, worldChunkWidth, worldChunkHeight } = combinedOptions;
        this.options = {...combinedOptions, ...{
            worldTileHeight: chunkTileHeight * worldChunkHeight,
            worldTileWidth: chunkTileWidth * worldChunkWidth
        }};
        if (cacheAllTiles) {
            this.cacheAllTiles();
        }
    }

    cacheAllTiles() {
        const { worldChunkHeight, worldChunkWidth, chunkTileWidth, chunkTileHeight } = this.options;
        let chunk;
        let vX, vY, index;
        for (let y = 0, x, cY, cX; y < worldChunkHeight; y++) {
            for (x = 0; x < worldChunkWidth; x++) {
                chunk = this.getChunk(x, y);
                for (cY = 0; cY < chunkTileHeight; cY++) {
                    for (cX = 0; cX < chunkTileWidth; cX++) {
                        vX = x * chunkTileWidth + cX;
                        vY = y * chunkTileHeight + cY;
                        this.getCell(vX, vY);
                    }
                }
            }
        }
    }

    getChunk(worldChunkX: number, worldChunkY: number): Chunk {
        if (this.chunkCache[worldChunkY] && this.chunkCache[worldChunkY][worldChunkX]) {
            return this.chunkCache[worldChunkY][worldChunkX];
        }
        console.log('getChunk', worldChunkX, worldChunkY);
        const row0 = [
            this.chunkEdgeIndex(worldChunkX - 1, worldChunkY - 1),
            this.chunkEdgeIndex(worldChunkX, worldChunkY - 1),
            this.chunkEdgeIndex(worldChunkX + 1, worldChunkY - 1),
            this.chunkEdgeIndex(worldChunkX + 2, worldChunkY - 1)
        ];
        const row1 = [
            this.chunkEdgeIndex(worldChunkX - 1, worldChunkY),
            this.chunkEdgeIndex(worldChunkX, worldChunkY),
            this.chunkEdgeIndex(worldChunkX + 1, worldChunkY),
            this.chunkEdgeIndex(worldChunkX + 2, worldChunkY)
        ];
        const row2 = [
            this.chunkEdgeIndex(worldChunkX - 1, worldChunkY + 1),
            this.chunkEdgeIndex(worldChunkX, worldChunkY + 1),
            this.chunkEdgeIndex(worldChunkX + 1, worldChunkY + 1),
            this.chunkEdgeIndex(worldChunkX + 2, worldChunkY + 1),
        ];
        const row3 = [
            this.chunkEdgeIndex(worldChunkX - 1, worldChunkY + 2),
            this.chunkEdgeIndex(worldChunkX, worldChunkY + 2),
            this.chunkEdgeIndex(worldChunkX + 1, worldChunkY + 2),
            this.chunkEdgeIndex(worldChunkX + 2, worldChunkY + 2)
        ];
        const { chunkTileWidth, chunkTileHeight } = this.options;
        const chunk = this.generateChunk(chunkTileWidth, chunkTileHeight, row0, row1, row2, row3);
        this.chunkCache[worldChunkY] = this.chunkCache[worldChunkY] || [];
        this.chunkCache[worldChunkY][worldChunkX] = chunk;
        return chunk;
    }

    getCell(worldX: number, worldY: number) {
        const { worldTileWidth, worldTileHeight } = this.options;
        const x = this.clamp(worldX, worldTileWidth);
        const y = this.clamp(worldY, worldTileHeight);
        if (this.tileCache[y] && this.tileCache[y][x]) {
            return this.tileCache[y][x];
        }
        const { chunkTileWidth, chunkTileHeight } = this.options;
        const worldChunkX = Math.floor(x / chunkTileWidth);
        const worldChunkY = Math.floor(y / chunkTileHeight);
        const chunkX = x % chunkTileWidth;
        const chunkY = y % chunkTileHeight;
        const chunk = this.getChunk(worldChunkX, worldChunkY);
        const cell = chunk[chunkY][chunkX];
        this.tileCache[y] = this.tileCache[y] || [];
        this.tileCache[y][x] = cell;
        return cell;
    }

    chunkEdgeIndex(worldChunkX: number, worldChunkY: number) {
        const { seed } = this;
        const { worldChunkWidth, worldChunkHeight } = this.options;
        const x = this.clamp(worldChunkX, worldChunkWidth);
        const y = this.clamp(worldChunkY, worldChunkHeight);
        return this.sampleFn(y * worldChunkHeight + x + seed, x, y, seed);
    }

    generateChunk(width: number, height: number, row0: Edge, row1: Edge, row2: Edge, row3: Edge): Chunk {
        const cells = [];
        let yFactor, xFactor; // trying to reduce memory churn;
        let i0, i1, i2, i3;
        const { maxHeight } = this.options;
        for (let y = 0, x; y < height; y++) {
            cells[y] = [];
            yFactor = y / height;
            for (x = 0; x < width; x++) {
                xFactor = x / width;
                i0 = this.cubicInterpolation(xFactor, row0[0], row0[1], row0[2], row0[3]);
                i1 = this.cubicInterpolation(xFactor, row1[0], row1[1], row1[2], row1[3]);
                i2 = this.cubicInterpolation(xFactor, row2[0], row2[1], row2[2], row2[3]);
                i3 = this.cubicInterpolation(xFactor, row3[0], row3[1], row3[2], row3[3]);
                cells[y][x] = Math.floor(this.cubicInterpolation(yFactor, i0, i1, i2, i3) * maxHeight);
            }
        }
        return cells;
    }

    cubicInterpolation(t, a, b, c, d) {
        let val = 0.5 * (c - a + (2.0 * a - 5.0 * b + 4.0 * c - d + (3.0 * (b - c) + d - a) * t) * t) * t + b;
        val = Math.max(0, val);
        val = Math.min(1, val);
        return val;
    }

    clamp(index: number, size: number) {
        return (index + size) % size;
    }
}
