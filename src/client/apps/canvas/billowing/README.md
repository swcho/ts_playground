Show Mesh & Billowing Effect
===

[Origin](https://codepen.io/tmrDevelops/pen/yoemmz)

![](2017-11-20-14-40-51.png)

Billowing with sloshing effect on mouse over.

Trigger, impulse to the net.
``` js
                if (this.ms != null) {
                    const FORCE_TO_AWAY = 0.06;
                    let d2 = (this.ms.x - p.x) *
                        (this.ms.x - p.x) +
                        (this.ms.y - p.y) *
                        (this.ms.y - p.y);
                    if (d2 * bubbleXL < 1.0) {
                        let t = 1.0 - (d2 * bubbleXL);
                        p.vx -= (this.ms.x - p.x) * t * FORCE_TO_AWAY;
                        p.vy -= (this.ms.y - p.y) * t * FORCE_TO_AWAY;
                        p.mouse = true;
                    }
                    // this.ms = null;
                }
```

Caculate stable postion from neighbors previous postion.
It makes ellastic movement.
Neighbors positions effect each other contiually.

``` js
                let cnt = 1;
                let msX = x * CELLS_COUNT;
                let msY = y * CELLS_COUNT;
                for (let i = 0; i < diam.length; i++) {
                    let dp = diam[i];
                    let cp = pts[pindx(x + dp.x, y + dp.y)];
                    if (cp != null) {
                        msX += cp.x - dp.x * CELLS_COUNT;
                        msY += cp.y - dp.y * CELLS_COUNT;
                        cnt++;
                    }
                }
                const FORCE_TO_RETURN = 0.6;
                p.vx += (msX / cnt - p.x) * FORCE_TO_RETURN;
                p.vy += (msY / cnt - p.y) * FORCE_TO_RETURN;
```

Without, gradual reduction of velocity it moves endlessly.

``` js
    anim() {
        const DAMPER = 0.98;
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= DAMPER;
        this.vy *= DAMPER;
    }
```
