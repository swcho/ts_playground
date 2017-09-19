
import {CanvasUtil} from './canvas';
import {Doll} from './doll';

// ---- set pointer ----
export class PointerUtil {
    x: number;
    y: number;
    pointDrag: Pos;
    init(canvas: CanvasUtil, doll: Doll) {
        this.x = 0;
        this.y = 0;
        window.addEventListener('mousemove', e => this.move(e), false);
        canvas.elem.addEventListener('touchmove', e => this.move(e), false);
        window.addEventListener('mousedown', e => this.down(e, canvas, doll), false);
        window.addEventListener('touchstart', e => this.down(e, canvas, doll), false);
        window.addEventListener('mouseup', e => this.up(e), false);
        window.addEventListener('touchend', e => this.up(e), false);
    }

    private down(e, canvas: CanvasUtil, doll: Doll) {
        this.move(e);
        let msd = 1000000;
        for (const point of doll.points) {
            const dx = point.x + canvas.x - this.x + canvas.width * 0.5;
            const dy = point.y + canvas.y - this.y + canvas.height * 0.5;
            const sd = dx * dx + dy * dy;
            if (sd < canvas.width * 0.05 * canvas.width * 0.05) {
                if (sd < msd) {
                    msd = sd;
                    this.pointDrag = point;
                }
            }
        }
    }

    private up(e) {
        this.pointDrag = null;
    }

    private move(e) {
        let touchMode = e.targetTouches,
            pointer;
        if (touchMode) {
            e.preventDefault();
            pointer = touchMode[0];
        } else pointer = e;
        this.x = pointer.clientX;
        this.y = pointer.clientY;
    }
}
