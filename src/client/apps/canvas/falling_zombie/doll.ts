
import {CObject, Disk, Particle, Aargh} from './objects';

export interface CollideItems<O extends CObject> {
    items: O[];
    index: number;
}

export class Doll {
    s: number;
    points: Doll.Point[];
    links: Doll.Link[];
    angles: Doll.Angle[];
    constructor(size: number, structure) {
        this.s = size;
        this.points = [];
        this.links = [];
        this.angles = [];
        const len = (p0, p1) => {
            for (const link of structure.links) {
                if (
                    (link.p0 === p0 && link.p1 === p1) ||
                    (link.p0 === p1 && link.p1 === p0)
                ) {
                    return link.length;
                }
            }
            return 1;
        };
        for (const link of structure.links) {
            this.links.push(new Doll.Link(this, link, structure.shapes));
        }
        for (const constraint of structure.constraints) {
            this.angles.push(
                new Doll.Angle(
                    this.points[constraint.p1],
                    this.points[constraint.p2],
                    this.points[constraint.p3],
                    len(constraint.p1, constraint.p2) * size,
                    len(constraint.p2, constraint.p3) * size,
                    constraint.angle,
                    constraint.range,
                    0.05
                )
            );
        }
    }

    anim(drawArea: DrawArea, pointer: PointerInfo, ctx: CanvasRenderingContext2D) {
        for (const angle of this.angles) angle.solve();
        for (const point of this.points) point.anim(drawArea, pointer);
        for (const link of this.links) link.draw(drawArea, ctx, pointer);
    }

    collide(drawArea: DrawArea, disks: Disk[], particles: CollideItems<Particle>, aarghs: CollideItems<Aargh>) {
        for (const point of this.points) {
            for (const disk of disks) {
                const dx = point.x - disk.x;
                const dy = point.y - disk.y;
                const sd = dx * dx + dy * dy;
                const w = 0.5 * point.w + disk.r;
                if (sd < w * w) {
                    const d = Math.sqrt(sd);
                    point.x += 0.5 * dx / d * (w - d);
                    point.y += 0.5 * dy / d * (w - d);
                    // DON'T KEEP CALM AND RUN !
                    const i = ++particles.index % particles.items.length;
                    const p = particles.items[i];
                    p.x = point.x;
                    p.y = point.y;
                    p.r = 2 + Math.sqrt(w - d) * 3.0;
                    p.vx = dx * 0.02 + dx * 0.01 * Math.random();
                    p.vy = dy * 0.02 + dy * 0.01 * Math.random();
                    // Aargh!
                    if (w - d > 20 && disk.aargh) {
                        disk.aargh = false;
                        const j = ++aarghs.index % aarghs.items.length;
                        const q = aarghs.items[j];
                        q.x = point.x;
                        q.y = point.y;
                        q.vx = 6 * (Math.random() - 0.5);
                        q.vy = -drawArea.vy * 0.5;
                        q.a = q.vx > 0 ? Math.random() * 0.4 : -Math.random() * 0.4;
                    }
                }
            }
        }
    }
};

export namespace Doll {
    export class Point {
        x: number;
        y: number;
        xb: number;
        yb: number;
        w: number;
        mass: number;

        constructor() {
            this.x = 0;
            this.y = 0;
            this.xb = 0;
            this.yb = 0;
            this.w = 0;
            this.mass = 1;
        }
        anim(drawArea: DrawArea, pointer: PointerInfo) {
            if (pointer.draggingObj && this === pointer.draggingObj) {
                this.x = this.xb = pointer.x - drawArea.x - drawArea.width * 0.5;
                this.y = this.yb = pointer.y - drawArea.y - drawArea.height * 0.5;
            } else {
                const vx = (this.x - this.xb) * 0.99;
                const vy = (this.y - this.yb) * 0.99;
                this.xb = this.x;
                this.yb = this.y;
                this.x += vx;
                this.y += vy + 0.1 * this.mass;
            }
        }
    }

    export class Angle {
        p1;
        p2;
        p3;
        len1;
        len2;
        angle;
        range;
        force;
        constructor(p1, p2, p3, len1, len2, angle, range, force) {
            this.p1 = p1;
            this.p2 = p2;
            this.p3 = p3;
            this.len1 = len1;
            this.len2 = len2;
            this.angle = angle;
            this.range = range;
            this.force = force;
        }
        a12(p1, p2, p3) {
            const a = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const b = Math.atan2(p3.y - p2.y, p3.x - p2.x);
            const c = this.angle - (b - a);
            const d = c > Math.PI ? c - 2 * Math.PI : c < -Math.PI ? c + 2 * Math.PI : c;
            const e = Math.abs(d) > this.range
                ? (-Math.sign(d) * this.range + d) * this.force
                : 0;
            const m = p1.mass + p2.mass;
            const m1 = p1.mass / m;
            const m2 = p2.mass / m;
            const cos = Math.cos(a - e);
            const sin = Math.sin(a - e);
            const x1 = p1.x + (p2.x - p1.x) * m2;
            const y1 = p1.y + (p2.y - p1.y) * m2;
            p1.x = x1 - cos * this.len1 * m2;
            p1.y = y1 - sin * this.len1 * m2;
            p2.x = x1 + cos * this.len1 * m1;
            p2.y = y1 + sin * this.len1 * m1;
            return e;
        }
        a23(e, p2, p3) {
            const a = Math.atan2(p2.y - p3.y, p2.x - p3.x) + e;
            const m = p2.mass + p3.mass;
            const m2 = p2.mass / m;
            const m3 = p3.mass / m;
            const cos = Math.cos(a);
            const sin = Math.sin(a);
            const x1 = p3.x + (p2.x - p3.x) * m2;
            const y1 = p3.y + (p2.y - p3.y) * m2;
            p3.x = x1 - cos * this.len2 * m2;
            p3.y = y1 - sin * this.len2 * m2;
            p2.x = x1 + cos * this.len2 * m3;
            p2.y = y1 + sin * this.len2 * m3;
        }
        solve() {
            const e = this.a12(this.p1, this.p2, this.p3);
            this.a23(e, this.p2, this.p3);
        }
    }

    export class Link {
        length: number;
        width: number;
        offset: number;
        shape;
        p0;
        p1;
        constructor(doll: Doll, link, shapes) {
            this.length = link.length * doll.s;
            this.width = link.width * doll.s;
            this.offset = link.offset || 0.0;
            this.shape = link.img ? document.getElementById(link.img) : null;
            if (link.shape) {
                const svg = shapes[link.shape];
                if (svg) {
                    // for perf reasons, cache the svg image as a canvas image
                    this.shape = document.createElement('canvas');
                    const image = new Image();
                    image.onload = (e) => {
                        this.shape.width = (e.target as HTMLImageElement).width;
                        this.shape.height = (e.target as HTMLImageElement).height;
                        const ctx = this.shape.getContext('2d');
                        ctx.drawImage(e.target, 0, 0);
                    };
                    image.src = 'data:image/svg+xml;base64,' + window.btoa(svg);
                }
            }
            doll.points[link.p0] = this.p0 = doll.points[link.p0]
                ? doll.points[link.p0]
                : new Point();
            doll.points[link.p1] = this.p1 = doll.points[link.p1]
                ? doll.points[link.p1]
                : new Point();
            if (this.width > this.p0.w) this.p0.w = this.width;
            this.p0.mass++;
            this.p1.mass++;
        }

        draw(drawArea: DrawArea, ctx: CanvasRenderingContext2D, pointer: PointerInfo) {
            if (!this.shape) return;
            const dx = this.p1.x - this.p0.x;
            const dy = this.p1.y - this.p0.y;
            const a = Math.atan2(dy, dx);
            const d = pointer.draggingObj ? Math.sqrt(dx * dx + dy * dy) : this.length;
            const tx = this.p0.x + drawArea.x + drawArea.width * 0.5;
            const ty = this.p0.y + drawArea.y + drawArea.height * 0.5;
            ctx.translate(tx, ty);
            ctx.rotate(a);
            ctx.drawImage(
                this.shape,
                -this.width * 0.15 - this.width * this.offset,
                -this.width * 0.5,
                d + this.width * 0.3,
                this.width
            );
            ctx.rotate(-a);
            ctx.translate(-tx, -ty);
        }
    }
}
