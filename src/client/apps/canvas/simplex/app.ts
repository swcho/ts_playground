
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

console.log(__filename);

//

import dat = require('dat-gui');
const CONFIG = {
    division: 25,
    add: 0.1,
    usePrev: false,
    noFade: false,
};

let gui = new dat.GUI();
gui.add(CONFIG, 'division', 0.01, 50).step(0.01);
gui.add(CONFIG, 'add', -1, 1).step(0.1);
gui.add(CONFIG, 'usePrev');
gui.add(CONFIG, 'noFade');

import { Circle, PI } from './circle';
import { Line } from './line';

// Constants
const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const
  WW = () => window.innerWidth,
  WH = () => window.innerHeight;

let CENTER = {
  x: WW() / 2,
  y: WH() / 2
};

// Settings
let
      DEBUG = true,
          N = 5,
          R = 200 * 2, // Retina fix
          r = 2   * 2, // Retina fix
         da = 180 / N,
      SPEED = 0.015,
  TimeDelta = 0,
     OFFSET = 4.525 * (N / 5),
    BGColor = '#eee',
    FGColor = '#333';



start();

// MAIN THREAD **************************************************************************
// Start animation
function start() {
  setCanvasSize();

  window.addEventListener('resize', setCanvasSize);

  window.requestAnimationFrame(draw);
}

// Redraw animation
function draw() {

  // Clear screen
  ctx.fillStyle = BGColor;
  ctx.fillRect(0, 0, WW() * 2, WH() * 2);

  // Create main circle instance
  let MainCircle = Circle.new(CENTER.x, CENTER.y, R);

  // Increase time for sine
  TimeDelta += SPEED;

  // Get paths by start points coordinates
  let lines = getLines(MainCircle);

  // Get array of recalculated points
  let drawnPoints = drawPointsAtSine(lines);

  // Draw lines between given points
  drawConnectors(drawnPoints);


  if (DEBUG) {
    ctx.globalAlpha = 0.2;
    drawCircle(MainCircle, {outline: true});
    ctx.globalAlpha = 1;
  }

  window.requestAnimationFrame(draw);
}

// Re-set context's canvas size and center's coordinate
function setCanvasSize() {
  CENTER = {
    x: WW(),
    y: WH()
  };

  ctx.canvas.width  = WW() * 2;
  ctx.canvas.height = WH() * 2;
}
// **************************************************************************************


// CALCULATIONS *************************************************************************
/**
 * Get array of lines (points paths) on main circle
 * @param {Object} CIRCLE - main circle
 * @return {Array} - array of lines
 */
function getLines(CIRCLE) {
  let lines = [];

  for (let n = 0; n < N; n++) {
    let lineAngle = -90 - da / 2 - da * n;

    let A = Circle.getPoint(CIRCLE, lineAngle);
    let B = Circle.getPoint(CIRCLE, lineAngle + 180);

    let newLine = Line.new(A.x, A.y, B.x, B.y) as any;

    if (DEBUG) {
      ctx.globalAlpha = 0.2;

      let p1 = Circle.new(A.x, A.y, r);
      drawCircle(p1, {outline: false});

      let p2 = Circle.new(B.x, B.y, r);
      drawCircle(p2, {outline: true});

      drawLine(newLine);

      ctx.globalAlpha = 1;
    }

    newLine.n = n;

    lines.push(newLine);
  }

  return lines;
}

/**
 * Draw points with sine offset on its path (attached line)
 * @param  {Array} line - array of lines
 * @return {Array} - array of calculated points. Need for drawing connectors
 */
function drawPointsAtSine(lines) {
  let points = [];

  lines.map( line => {
    let localSine = Math.sin(TimeDelta + OFFSET * line.n) / 2;


    let pointPosition = (localSine + 0.5) * 100;
    let pointCoords = Line.getPoint(line, pointPosition);

    let point = Circle.new(pointCoords.x, pointCoords.y, r) as any;

    drawCircle(point, {outline: false});

    point.n = line.n;
    points.push(point);
  });

  return points;
}

/**
 * Draw lines between points
 * @param {Array} points - array of point objects
 */
function drawConnectors(points) {
  points.forEach( p => {
    for (let n = p.n; n < points.length; n++) {
      let connector = Line.new(p.x, p.y, points[n].x, points[n].y);
      drawLine(connector);
    }
  });
}
// **************************************************************************************


// DRAWING ******************************************************************************
/**
 * Draws circle
 *
 * @param {object} circle - circle object
 * @param {object} opts - options
 */
function drawCircle(circle, opts) {
  ctx.save();

  if (opts.outline) {
    ctx.strokeStyle = FGColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
  } else {
    ctx.fillStyle = FGColor;
    ctx.beginPath();
  }

  ctx.arc(circle.x, circle.y, circle.r, 0, PI * 2);

  opts.outline ? ctx.stroke() : ctx.fill();

  ctx.restore();
}

/**
 * Draws line
 *
 * @param {object} line - line object
 * @param {object} opts - options
 */
function drawLine(line, opts?) {
  ctx.save();

  ctx.strokeStyle = FGColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(line.start.x, line.start.y);
  ctx.lineTo(line.end.x, line.end.y);
  ctx.stroke();

  ctx.restore();
}
