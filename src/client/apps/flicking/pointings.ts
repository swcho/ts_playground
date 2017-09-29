
interface Pos {
    x: number;
    y: number;
}

export interface MoveStartHandler {
    (divX: number, divY: number): void;
}

export interface MoveHandler {
    (divX: number, divY: number): void;
}

interface MoveSummary {
    xMoved: boolean;
    yMoved: boolean;
    moveCount: number;
    moveTotal: number;
}

export interface MoveFinishHandler {
    (summary: MoveSummary): void;
}

export class Pointings {

    private posPrev: Pos;
    private divPrev: Pos;
    private moveCount = 0;
    private moveTotal = 0;

    constructor(
        private moveStartHandler: MoveStartHandler,
        private moveHanlder: MoveHandler,
        private finishHandler: MoveFinishHandler) {
    }

    processStart({x, y}: Pos) {
        this.posPrev = {
            x,
            y,
        };
        this.divPrev = null;
        this.moveCount = 0;
        this.moveTotal = 0;
        this.moveStartHandler(x, y);
        console.log('start', this.posPrev);
    }

    processMove({x, y}: Pos) {
        if (this.posPrev) {
            const newPos = {x, y};
            const divX = newPos.x - this.posPrev.x;
            const divY = newPos.y - this.posPrev.y;
            this.posPrev = newPos;

            const applyX = Math.abs(divX) > Math.abs(divY);
            const div = {
                x: (applyX ? divX : 0),
                y: (applyX ? 0 : divY),
            };
            if (!this.divPrev
                || (div.x === 0 && this.divPrev.x === 0) || (div.y === 0 && this.divPrev.y === 0) // check same direction
                ) {
                this.divPrev = div;
                this.moveCount++;
                this.moveTotal += div.x === 0 ? div.y : div.x;
                this.moveHanlder(div.x, div.y);
                console.log('move', div.x, div.y);
            }
        }
    }

    processEnd() {
        if (this.divPrev) {
            this.finishHandler({
                xMoved: this.divPrev.y === 0,
                yMoved: this.divPrev.x === 0,
                moveCount: this.moveCount,
                moveTotal: this.moveTotal,
            });
        }
        this.divPrev = null;
        this.moveCount = 0;
        this.moveTotal = 0;
        this.posPrev = null;
    }
}
