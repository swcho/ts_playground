
// ---- set canvas ----
export class CanvasUtil implements DrawArea {
    x: number;
    y: number;
    vx: number;
    vy: number;
    s: number;
    width: number;
    height: number;
    background: HTMLCanvasElement;
    filter: HTMLCanvasElement;
    elem: HTMLCanvasElement;

    init() {
        this.elem = document.createElement('canvas');
        document.body.appendChild(this.elem);
        this.resize();
        this.x = this.vx = 0;
        this.y = this.vy = 0;
        this.s = 0.01;
        window.addEventListener('resize', () => this.resize(), false);
        return this.elem.getContext('2d');
    }

    scroll(p: Pos, pointDrag: boolean) {
        if (!pointDrag) {
            this.vx = (-p.x - this.x) * this.s;
            this.vy = (-p.y - this.y) * this.s;
            this.x += this.vx;
            this.y += this.vy;
            if (this.s < 0.25) this.s += 0.001;
        } else this.s = 0.01;
    }

    // draw full moon
    private createBackground() {
        const shape = document.createElement('canvas');
        shape.width = this.width;
        shape.height = this.height;
        const ctx = shape.getContext('2d');
        ctx.fillStyle = '#123';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.beginPath();
        ctx.arc(
            this.width * 0.5,
            this.height * 0.5,
            Math.min(400, this.width, this.height) * 0.65,
            0,
            2 * Math.PI
        );
        ctx.fillStyle = '#fff';
        ctx.fill();
        return shape;
    }

    // draw 2 pixcel radius circles
    private createFilter() {
        const shape = document.createElement('canvas');
        shape.width = this.width;
        shape.height = this.height;
        const ctx = shape.getContext('2d');
        for (let i = 0; i < this.width + 5; i += 5) {
            for (let j = 0; j < this.height + 5; j += 5) {
                ctx.beginPath();
                ctx.arc(i, j, 2, 0, 2 * Math.PI);
                ctx.fillStyle = '#331';
                ctx.fill();
            }
        }
        return shape;
    }

    private resize() {
        this.width = this.elem.width = this.elem.offsetWidth;
        this.height = this.elem.height = this.elem.offsetHeight;
        this.background = this.createBackground();
        this.filter = this.createFilter();
    }

};
