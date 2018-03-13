
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

const B_SHOW_FLUID = false
const DENS_SCALE = 0.03;
const representation = [
    " ", "💀", "😱", "😀", "😍", '😇'
]
// const representation = [
//   " ", "👦🏿", "👦🏾", "👦🏽", "👦🏼", "👦🏻",
// ]
const N_ = 30; // sim complexity

/** FDS **/

let dens_ = [];
let dens_prev_ = [];
// later
// var dens_R_    = [];
// var dens_G_    = [];
// var dens_B_    = [];
// var dens_R_prev_ = [];
// var dens_G_prev_ = [];
// var dens_B_prev_ = [];
let u_ = [];
let u_prev_ = [];
let v_ = [];
let v_prev_ = [];
let visc_ = 0.001;
let diff_ = 0.0001;
let dt_ = 1;

const multiplicator = 30;

let help =
    {
        x0: [],
        x1: [],
        x2: [],
        x3: []
    };

let FluidDynamicsSolver = function (n) {
    // PRIVATE:
    let FADESPEED = 0.01;

    // PUBLBIC:
    this.initFDS = function () {
        let i;
        let size;

        size = (N_ + 2) * (N_ + 2);

        for (i = 0; i < size; i++) {
            dens_[i] = 0;
            dens_prev_[i] = 0;
            // later
            //      dens_R_[i]    = 0;
            //      dens_G_[i]    = 0;
            //      dens_B_[i]    = 0;
            //      dens_R_prev_[i] = 0;
            //      dens_G_prev_[i] = 0;
            //      dens_B_prev_[i] = 0;
            u_[i] = 0;
            u_prev_[i] = 0;
            v_[i] = 0;
            v_prev_[i] = 0;
        }
    };

    this.update = function () {
        velocityStep();
        densityStep();
        fadeOut();
    };

    // PRIVATE:
    let fadeOut = function () {
        let i;
        let size = (N_ + 2) * (N_ + 2);

        for (i = 0; i < size; i++) {
            u_prev_[i] = v_prev_[i] = dens_prev_[i] = 0;
            dens_[i] = dens_[i] * (1 - FADESPEED);
            u_[i] = u_[i] * (1 - FADESPEED);
            v_[i] = v_[i] * (1 - FADESPEED);
        }
    };

    let velocityStep = function () {
        let tmp: any = 0;
        // 1.---------------------------------------------------------------------------
        addSource(u_, u_prev_);
        u_ = help.x0;
        u_prev_ = help.x1;

        // 2.---------------------------------------------------------------------------
        addSource(v_, v_prev_);
        v_ = help.x0;
        v_prev_ = help.x1;

        // SWAP u---------
        tmp = u_prev_;
        u_prev_ = u_;
        u_ = tmp;
        // END-SWAP-------

        // 3.---------------------------------------------------------------------------
        viscosity(1, u_, u_prev_);
        u_ = help.x0;
        u_prev_ = help.x1;

        // SWAP v---------
        tmp = v_prev_;
        v_prev_ = v_;
        v_ = tmp;
        // END-SWAP-------

        // 4.---------------------------------------------------------------------------
        viscosity(2, v_, v_prev_);
        v_ = help.x0;
        v_prev_ = help.x1;

        // 5.---------------------------------------------------------------------------
        projection(u_, v_, u_prev_, v_prev_);
        u_ = help.x0;
        u_prev_ = help.x1;
        v_ = help.x2;
        v_prev_ = help.x3;

        // SWAP u---------
        tmp = u_prev_;
        u_prev_ = u_;
        u_ = tmp;
        // END-SWAP-------

        // SWAP v---------
        tmp = v_prev_;
        v_prev_ = v_;
        v_ = tmp;
        // END-SWAP-------

        // 6.---------------------------------------------------------------------------
        advection(1, u_, u_prev_, u_prev_, v_prev_);
        u_ = help.x0;
        u_prev_ = help.x1;

        // 7.---------------------------------------------------------------------------
        advection(2, v_, v_prev_, u_prev_, v_prev_);
        v_ = help.x0;
        v_prev_ = help.x1;

        projection(u_, v_, u_prev_, v_prev_);
        u_ = help.x0;
        u_prev_ = help.x1;
        v_ = help.x2;
        v_prev_ = help.x3;
    };

    let densityStep = function () {
        let tmp: any = 0;
        // 8.---------------------------------------------------------------------------
        addSource(dens_, dens_prev_);
        dens_ = help.x0;
        dens_prev_ = help.x1;

        // SWAP dens------------
        tmp = dens_prev_;
        dens_prev_ = dens_;
        dens_ = tmp;
        // END-SWAP-------------

        // 9.---------------------------------------------------------------------------
        diffusion(0, dens_, dens_prev_);
        dens_ = help.x0;
        dens_prev_ = help.x1;

        // SWAP dens------------
        tmp = dens_prev_;
        dens_prev_ = dens_;
        dens_ = tmp;
        // END-SWAP-------------

        // 10.--------------------------------------------------------------------------
        advection(0, dens_, dens_prev_, u_, v_);
        dens_ = help.x0;
        dens_prev_ = help.x1;
    };

    let addSource = function (x, s) {
        let i;
        let grid_size;

        grid_size = (N_ + 2) * (N_ + 2);

        for (i = 0; i < grid_size; i++) {
            x[i] += dt_ * s[i];
        }

        help.x0 = x;
        help.x1 = s;
    };

    // later
    //  var addSourceRGB = function()
    //  {
    //    // do stuff here
    //  };

    let gaussSeidel = function (b, x, x_prev, a, c) {
        let i;
        let j;
        let k;
        let brace;

        // Iterating Gauss-Seidel 20 times to get a good approximation
        for (k = 0; k < 20; k++) {
            for (i = 1; i <= N_; i++) {
                for (j = 1; j <= N_; j++) {
                    brace = x[IX(i - 1, j)] + x[IX(i + 1, j)] +
                        x[IX(i, j - 1)] + x[IX(i, j + 1)];

                    x[IX(i, j)] = (x_prev[IX(i, j)] + a * brace) / c;
                }
            }

            setBoundary(b, x);
            x = help.x0;
        }

        help.x0 = x;
        help.x1 = x_prev;
    };

    let setBoundary = function (b, x) {
        let i;

        for (i = 1; i <= N_; i++) {
            x[IX(0, i)] = (b == 1) ? -x[IX(1, i)] : x[IX(1, i)];
            x[IX(N_ + 1, i)] = (b == 1) ? -x[IX(N_, i)] : x[IX(N_, i)];
            x[IX(i, 0)] = (b == 2) ? -x[IX(i, 1)] : x[IX(i, 1)];
            x[IX(i, N_ + 1)] = (b == 2) ? -x[IX(i, N_)] : x[IX(i, N_)];
        }

        x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
        x[IX(0, N_ + 1)] = 0.5 * (x[IX(1, N_ + 1)] + x[IX(0, N_)]);
        x[IX(N_ + 1, 0)] = 0.5 * (x[IX(N_, 0)] + x[IX(N_ + 1, 1)]);
        x[IX(N_ + 1, N_ + 1)] = 0.5 * (x[IX(N_, N_ + 1)] + x[IX(N_ + 1, N_)]);

        help.x0 = x;
    };

    let diffusion = function (b, x, x_prev) {
        let a;
        let c;

        a = dt_ * diff_ * N_ * N_;
        c = (1 + 4 * a);

        gaussSeidel(b, x, x_prev, a, c);
    };

    let viscosity = function (b, x, x_prev) {
        let a;
        let c;

        a = dt_ * visc_ * N_ * N_;
        c = (1 + 4 * a);

        gaussSeidel(b, x, x_prev, a, c);
    };

    let advection = function (b, d, d_prev, u, v) {
        let i, j;
        let i0, j0;
        let i1, j1;
        let x, y;
        let s0, t0;
        let s1, t1;
        let dt_prev;

        dt_prev = dt_ * N_;

        // Linear Backtracing here
        for (i = 1; i <= N_; i++) {
            for (j = 1; j <= N_; j++) {
                // Checking position where the the quantity has been one timestep bevore
                x = i - dt_prev * u[IX(i, j)];
                y = j - dt_prev * v[IX(i, j)];

                if (x < 0.5) {
                    x = 0.5;
                }

                if (x > N_ + 0.5) {
                    x = N_ + 0.5;
                }

                i0 = Math.floor(x);
                i1 = i0 + 1;

                if (y < 0.5) {
                    y = 0.5;
                }

                if (y > N_ + 0.5) {
                    y = N_ + 0.5;
                }

                j0 = Math.floor(y);
                j1 = j0 + 1;

                s1 = x - i0;
                s0 = 1 - s1;
                t1 = y - j0;
                t0 = 1 - t1;

                d[IX(i, j)] = s0 * (t0 * d_prev[IX(i0, j0)] + t1 * d_prev[IX(i0, j1)]) +
                    s1 * (t0 * d_prev[IX(i1, j0)] + t1 * d_prev[IX(i1, j1)]);
            }
        }

        setBoundary(b, d);

        help.x1 = d_prev;
    };

    let projection = function (u, v, p, div) {
        let i;
        let j;
        let brace;

        for (i = 1; i <= N_; i++) {
            for (j = 1; j <= N_; j++) {
                brace = u[IX(i + 1, j)] - u[IX(i - 1, j)] +
                    v[IX(i, j + 1)] - v[IX(i, j - 1)];

                div[IX(i, j)] = -0.5 * brace / N_;
                p[IX(i, j)] = 0;
            }
        }

        setBoundary(0, div);
        div = help.x0;

        setBoundary(0, p);
        p = help.x0;

        gaussSeidel(0, p, div, 1, 4);
        p = help.x0;
        div = help.x1;

        for (i = 1; i <= N_; i++) {
            for (j = 1; j <= N_; j++) {
                u[IX(i, j)] -= 0.5 * N_ * (p[IX(i + 1, j)] - p[IX(i - 1, j)]);
                v[IX(i, j)] -= 0.5 * N_ * (p[IX(i, j + 1)] - p[IX(i, j - 1)]);
            }
        }

        setBoundary(1, u);
        u = help.x0;

        setBoundary(2, v);
        v = help.x0;

        help.x0 = u;
        help.x1 = p;
        help.x2 = v;
        help.x3 = div;
    };

    // ----------------------------------------------------------------------------
    // Little helpers: private and public
    // ----------------------------------------------------------------------------
    function IX(i, j) {
        return parseInt((i) + (N_ + 2) * (j));
    }

    this.REG_IX = function (i, j) {
        if (i < 1) {
            i = 1;
        }
        else if (i > N_) {
            i = N_;
        }

        if (j < 1) {
            j = 1;
        }
        else if (j > N_) {
            j = N_;
        }

        return IX(i, j);
    };

    this.NORM_IX = function (x, y) {
        let i = Math.floor(x * (N_ + 2));
        let j = Math.floor(y * (N_ + 2));

        return this.REG_IX(i, j);
    };
    this.record = function (x, y, dx, dy) {
        const index = this.NORM_IX(x, y);
        dens_prev_[index] = 1000;
        u_prev_[index] = dx * multiplicator;
        v_prev_[index] = dy * multiplicator;
    };
    this.getDens = function (index) {
        return dens_[index];
    };
    // ----------------------------------------------------------------------------
};


/** index.js **/
const solver = new FluidDynamicsSolver(N_);
solver.initFDS();

const container = document.querySelector('.container');

const canvas = document.createElement('canvas') as HTMLCanvasElement;
const RESOLUTION = 512;
// canvas.style.width = '100vw'
// canvas.style.height = '100vh'
canvas.setAttribute('width', RESOLUTION);
canvas.setAttribute('height', RESOLUTION);
// canvas.style.margin = '10px'
canvas.style.background = 'yellow';
if (!B_SHOW_FLUID) {
    canvas.style.opacity = '0';
}
canvas.style.border = '1px solid white';
container.appendChild(canvas);
const canvasContext = canvas.getContext('2d');

// NOTE copy the canvas element and it's context
// used for double buffering
const canvasCopy = document.createElement('canvas');
canvasCopy.width = N_;
canvasCopy.height = N_;
const canvasCopyContext = canvasCopy.getContext('2d');
const canvasCopyImageData = canvasCopyContext.createImageData(N_, N_);

// our own renderer
const renderGrid = document.createElement('div');
renderGrid.classList.add('renderGrid');
container.appendChild(renderGrid);
const arrCells = [];
// j: y, i: x
for (let j = 0; j < N_; j++) {
    const row = document.createElement('div');
    for (let i = 0; i < N_; i++) {
        const cell = document.createElement('div');
        cell.innerText = '1';
        cell.classList.add('cell');
        cell.style.display = 'inline-block';
        row.appendChild(cell);
        arrCells.push(cell);
    }
    renderGrid.appendChild(row);
}

// interaction
const E_POINTER_MOVE = ('ontouchstart' in window) ? 'touchmove' : 'mousemove';
const INV_CANVAS_W = 1 / RESOLUTION;
const INV_CANVAS_H = 1 / RESOLUTION;

let prevX = 0;
let prevY = 0;
canvas.addEventListener(E_POINTER_MOVE, (e: any) => {
    e.preventDefault();
    if (E_POINTER_MOVE === 'touchmove') {
    // if ('changedTouches' in e) {
        e = e.changedTouches[0];
        e.offsetX = e.pageX - e.target.offsetLeft;
        e.offsetY = e.pageY - e.target.offsetTop;
    }
    const _x = e.offsetX;
    const _y = e.offsetY;
    // normalize x and y
    const x = _x * INV_CANVAS_W;
    const y = _y * INV_CANVAS_H;
    // calculate dx and dy: normalized direction of mouse movement
    const dx = (_x - prevX) * INV_CANVAS_W;
    const dy = (_y - prevY) * INV_CANVAS_H;

    addSource(x, y, dx, dy);

    // record x and y for next calculation of dx and dy
    prevX = _x;
    prevY = _y;
});
function addSource(x, y, dx, dy) {
    const movement = dx * dx + dy * dy;
    if (movement === 0) return;
    const clampX = clamp(x, 0, 1);
    const clampY = clamp(y, 0, 1);
    const index = solver.NORM_IX(clampX, clampY);
    // TODO refactor fds.js, so that this part doesn't rely on global variables in there
    solver.record(clampX, clampY, dx, dy);
}
function clamp(input, min, max) {
    if (input < min) return min;
    else if (input > max) return max;
    else return input;
}

function draw() {
    // update fluid solver
    solver.update();
    // visualize
    drawDensity();

    // loop
    window.requestAnimationFrame(draw);
}

function drawDensity() {
    let img_data_i;
    let dens_index;

    // NOTE Start here
    // the simulation gers rendered onto ImageData
    // and then that imageData gets blit onto display canvas

    // i: column, j: row
    // 30 of each
    for (let j = 0; j < N_; j++) {
        for (let i = 0; i < N_; i++) {
            // in case you need to know what that is:
            // https://developer.mozilla.org/En/HTML/Canvas/Pixel_manipulation_with_canvas
            img_data_i = (j * N_ * 4) + (i * 4);
            dens_index = solver.REG_IX(i + 1, j + 1);
            const dens = solver.getDens(dens_index);
            if (B_SHOW_FLUID) {
                // write color to canvas
                canvasCopyImageData.data[img_data_i] = dens;
                canvasCopyImageData.data[img_data_i + 1] = dens;
                canvasCopyImageData.data[img_data_i + 2] = dens;
                canvasCopyImageData.data[img_data_i + 3] = 255;
            }

            let cappedDens = Math.floor(dens * DENS_SCALE);
            if (cappedDens > representation.length - 1) cappedDens = representation.length - 1;
            arrCells[(j * N_ + i)].innerText = representation[cappedDens];
        }
    }

    if (B_SHOW_FLUID) {
        // write new data back to the copy
        canvasCopyContext.putImageData(canvasCopyImageData, 0, 0);
        // draw image on screen using the canvas copy
        canvasContext.drawImage(canvasCopy, 0, 0, RESOLUTION, RESOLUTION);
    }
}

draw();
