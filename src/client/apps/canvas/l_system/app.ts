
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

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const cx = canvas.getContext('2d');

canvas.height =
  document.body.offsetHeight -
  document.getElementById('download').offsetHeight -
  document.getElementById('stats').offsetHeight;
canvas.style.width = '900px';

if (document.body.offsetWidth < 768) {
  canvas.height = 500;
  canvas.width = 760;
  canvas.style.height = '500px';
  canvas.style.width = '760px';
}
// constants

const cHeight = cx.canvas.height;
const cWidth = cx.canvas.width;

const SHAPES = {
  'Koch Line': {
    id: 1,
    axiom: 'F',
    rules: {
      F: 'F-F++F-F'
    },
    angle: Math.PI / 3,
    stepLength: 3,
    center: {
      x: 0,
      y: 10
    },
    iterations: 5,
    closePath: false
  },
  'Quadratic Snowflake': {
    id: 2,
    axiom: 'F',
    rules: {
      F: 'F-F+F+F-F'
    },
    angle: Math.PI / 2,
    stepLength: 3,
    center: {
      x: 0,
      y: 10
    },
    iterations: 5,
    closePath: false
  },
  'Box fractal': {
    id: 3,
    axiom: 'F-F-F-F',
    rules: {
      F: 'F-F+F+F-F'
    },
    angle: Math.PI / 2,
    stepLength: 11,
    center: {
      x: 3,
      y: 3
    },
    iterations: 4
  },
  'Koch snowflake': {
    id: 4,
    axiom: 'F++F++F',
    rules: {
      F: 'F-F++F-F'
    },
    angle: Math.PI / 3,
    stepLength: 2,
    center: {
      x: cWidth / 4,
      y: cHeight / 1.6
    },
    iterations: 5
  },
  'Bourke Triangle': {
    id: 5,
    axiom: 'F+F+F',
    rules: {
      F: 'F-F+F'
    },
    angle: 2 * Math.PI / 3,
    stepLength: 15,
    center: {
      x: cWidth - 65,
      y: cHeight / 1.85
    },
    iterations: 7
  },
  Weed: {
    id: 6,
    axiom: 'F',
    rules: {
      F: 'F[+F]F[-F]F'
    },
    angle: Math.PI / 7,
    stepLength: 1,
    center: {
      x: cWidth / 2,
      y: cHeight
    },
    iterations: 6,
    initialAngle: -Math.PI / 2
  },
  Stick: {
    id: 7,
    axiom: 'X',
    rules: {
      F: 'FF',
      X: 'F[+X]F[-X]+X'
    },
    angle: Math.PI / 9,
    stepLength: 3,
    center: {
      x: cWidth / 2,
      y: cHeight
    },
    iterations: 7,
    initialAngle: -Math.PI / 2,
    closePath: false
  },
  Crystal: {
    id: 8,
    axiom: 'F+F+F+F',
    rules: {
      F: 'FF+F++F+F'
    },
    angle: Math.PI / 2,
    stepLength: 10,
    center: {
      x: 50,
      y: cHeight - 50
    },
    iterations: 4
  },
  'Dragon Curve': {
    id: 9,
    axiom: 'FX',
    rules: {
      X: 'X+YF+',
      Y: '-FX-Y'
    },
    angle: Math.PI / 2,
    stepLength: 6,
    center: {
      x: cWidth / 2,
      y: cHeight / 2
    },
    iterations: 12,
    closePath: false
  },
  'Hexagonal Gosper': {
    id: 10,
    axiom: 'A',
    rules: {
      A: 'A+BF++BF-FA--FAFA-BF+',
      B: '-FA+BFBF++BF+FA--FA-B'
    },
    angle: Math.PI / 3,
    stepLength: 25,
    center: {
      x: cWidth / 2,
      y: cHeight / 2 + 230
    },
    iterations: 3,
    closePath: false
  },
  'Square Serpinsky': {
    id: 11,
    axiom: 'F+XF+F+XF',
    rules: {
      X: 'XF-F+F-XF+F+XF-F+F-X'
    },
    angle: Math.PI / 2,
    stepLength: 7,
    center: {
      x: cWidth / 2,
      y: cHeight
    },
    iterations: 5,
    closePath: false
  },
  'Hilbert Curve': {
    id: 12,
    axiom: 'X',
    rules: {
      X: '-YF+XFX+FY-',
      Y: '+XF-YFY-FX+'
    },
    angle: Math.PI / 2,
    stepLength: 14,
    center: {
      x: 10,
      y: 10
    },
    iterations: 6,
    closePath: false
  },
  Board: {
    id: 13,
    axiom: 'F+F+F+F',
    rules: {
      F: 'FF+F+F+F+FF'
    },
    angle: Math.PI / 2,
    stepLength: 10,
    center: {
      x: 50,
      y: cHeight - 50
    },
    iterations: 4,
    closePath: false
  },
  'Koch Curve': {
    id: 14,
    axiom: 'F+F+F+F',
    rules: {
      F: 'F+F-F-FF+F+F-F'
    },
    angle: Math.PI / 2,
    stepLength: 5,
    center: {
      x: cWidth / 2 - 150,
      y: cHeight / 2 + 150
    },
    iterations: 3,
    closePath: false
  },
  'Quadratic Koch Island': {
    id: 15,
    axiom: 'F+F+F+F',
    rules: {
      F: 'F+F-F-FFF+F+F-F'
    },
    angle: Math.PI / 2,
    stepLength: 5,
    center: {
      x: cWidth / 2 - 250,
      y: cHeight / 2
    },
    iterations: 3,
    closePath: false
  },
  'Quadratic Koch Island - 2': {
    id: 16,
    axiom: 'F+F+F+F',
    rules: {
      F: 'F-FF+FF+F+F-F-FF+F+F-F-FF-FF+F'
    },
    angle: Math.PI / 2,
    stepLength: 13,
    center: {
      x: 200,
      y: cHeight / 2 + 250
    },
    iterations: 2,
    closePath: false
  },
  'Serpinsky ArrowHead': {
    id: 17,
    axiom: 'YF',
    rules: {
      X: 'YF+XF+Y',
      Y: 'XF-YF-X'
    },
    angle: Math.PI / 3,
    stepLength: 7,
    center: {
      x: cWidth - 10,
      y: cHeight - 30
    },
    iterations: 7,
    initialAngle: Math.PI,
    closePath: false
  },
  Cross: {
    id: 18,
    axiom: 'F+F+F+F',
    rules: {
      F: 'F+F-F+F+F'
    },
    angle: Math.PI / 2,
    stepLength: 10,
    center: {
      x: 70,
      y: cHeight / 2 + 120
    },
    iterations: 5,
    closePath: false
  },
  Rings: {
    id: 19,
    axiom: 'F+F+F+F',
    rules: {
      F: 'FF+F+F+F+F+F-F'
    },
    angle: Math.PI / 2,
    stepLength: 6,
    center: {
      x: cWidth / 2 + 180,
      y: cHeight - 100
    },
    iterations: 4,
    closePath: false
  },
  'Another Bush': {
    id: 20,
    axiom: 'Y',
    rules: {
      X: 'X[-FFF][+FFF]FX',
      Y: 'YFX[+Y][-Y]'
    },
    angle: Math.PI / 7,
    stepLength: 6,
    center: {
      x: cWidth / 2,
      y: cHeight
    },
    iterations: 6,
    initialAngle: -Math.PI / 2,
    closePath: false
  },
  'Another Bush - 2': {
    id: 21,
    axiom: 'F',
    rules: {
      F: 'FF+[+F-F-F]-[-F+F+F]'
    },
    angle: Math.PI / 8,
    stepLength: 8,
    center: {
      x: cWidth / 2,
      y: cHeight
    },
    iterations: 5,
    initialAngle: -Math.PI / 2,
    closePath: false
  },
  'Another Bush - 3': {
    id: 22,
    axiom: 'F',
    rules: {
      F: 'F[+FF][-FF]F[-F][+F]F'
    },
    angle: Math.PI / 5,
    stepLength: 8,
    center: {
      x: cWidth / 2,
      y: cHeight
    },
    iterations: 4,
    initialAngle: -Math.PI / 2,
    closePath: false
  },
  Hexagonal: {
    id: 23,
    axiom: 'FXF',
    rules: {
      F: 'FXF',
      X: '[-F+F+F]+F-F-F+'
    },
    angle: Math.PI / 3,
    stepLength: 3,
    center: {
      x: 0,
      y: cHeight / 2
    },
    iterations: 5,
    closePath: false
  },
  'Serpinsky Triangle': {
    id: 24,
    axiom: 'FXF--FF--FF',
    rules: {
      F: 'FF',
      X: '--FXF++FXF++FXF--'
    },
    angle: Math.PI / 3,
    stepLength: 4,
    center: {
      x: 0,
      y: 0
    },
    iterations: 7,
    closePath: false
  },
  'Serpinsky Carpet': {
    id: 25,
    axiom: 'F',
    rules: {
      F: 'FFF[+FFF+FFF+FFF]'
    },
    angle: Math.PI / 2,
    stepLength: 3,
    center: {
      x: 50,
      y: cHeight - 50
    },
    iterations: 5,
    closePath: false
  },
  Mosaic: {
    id: 26,
    axiom: 'F-F-F-F',
    rules: {
      F: 'F-b+FF-F-FF-Fb-FF+b-FF+F+FF+Fb+FFF',
      b: 'bbbbbb'
    },
    angle: Math.PI / 2,
    stepLength: 3,
    center: {
      x: 300,
      y: 0
    },
    iterations: 3,
    closePath: false
  },
  'Levy C Curve': {
    id: 27,
    axiom: 'F++F++F++F',
    rules: {
      F: '-F++F-'
    },
    angle: Math.PI / 4,
    stepLength: 5,
    center: {
      x: cWidth / 2 - 130,
      y: cHeight / 2 + 150
    },
    iterations: 11,
    closePath: false
  },
  Pentaplexity: {
    id: 28,
    axiom: 'F++F++F++F++F',
    rules: {
      F: 'F++F++F+++++F-F++F'
    },
    angle: Math.PI / 5,
    stepLength: 4,
    center: {
      x: 200,
      y: cHeight - 100
    },
    iterations: 5,
    closePath: false
  },
  'William McWorter Terdragon': {
    id: 29,
    axiom: 'F',
    rules: {
      F: 'F+F-F'
    },
    angle: 2 * Math.PI / 3,
    stepLength: 6,
    center: {
      x: cWidth / 2 + 100,
      y: cHeight / 2
    },
    iterations: 8,
    initialAngle: Math.PI / 2,
    closePath: false
  },
  'William McWorter  Sierpinski Carpet': {
    id: 30,
    axiom: 'F',
    rules: {
      F: 'F+F-F-F-b+F+F+F-F',
      b: 'bbb'
    },
    angle: Math.PI / 2,
    stepLength: 7,
    center: {
      x: cWidth / 2,
      y: cHeight / 2 - 250
    },
    iterations: 4,
    initialAngle: Math.PI / 2,
    closePath: false
  },
  'William McWorter Pentigree': {
    id: 31,
    axiom: 'F-F-F-F-F',
    rules: {
      F: 'F-F++F+F-F-F'
    },
    angle: 2 * Math.PI / 5,
    stepLength: 7,
    center: {
      x: cWidth / 2,
      y: cHeight - 200
    },
    iterations: 4,
    closePath: false
  },
  'Gary Teachout Hex-7-b': {
    id: 32,
    axiom: 'X',
    rules: {
      X: '-F++F-X-F--F+Y---F--F+Y+F++F-X+++F++F-X-F++F-X+++F--F+Y--',
      Y: '+F++F-X-F--F+Y+F--F+Y---F--F+Y---F++F-X+++F++F-X+++F--F+Y'
    },
    angle: Math.PI / 6,
    stepLength: 2,
    center: {
      x: cWidth / 2 + 150,
      y: 100
    },
    iterations: 5,
    closePath: false
  },
  'Gary Teachout Peano-c': {
    id: 33,
    axiom: 'FX',
    rules: {
      X: 'FX-FY-FX+FY+FX+FY+FX+FY+FX-FY-FX-FY-FX-FY-FX+FY+FX',
      Y: 'FY'
    },
    angle: Math.PI / 4,
    stepLength: 3,
    center: {
      x: 0,
      y: cHeight / 2
    },
    iterations: 4,
    closePath: false
  },
  'William McWorter Border1': {
    id: 34,
    axiom: 'XYXYXYX+​XYXYXYX+​XYXYXYX+​XYXYXYX',
    rules: {
      X: 'FX+FX+FXFY-FY-',
      Y: '+FX+FXFY-FY-FY'
    },
    angle: Math.PI / 2,
    stepLength: 10,
    center: {
      x: 50,
      y: cHeight / 2 + 100
    },
    iterations: 3,
    closePath: false
  },
  'Adrian Mariano Doily': {
    id: 35,
    axiom: 'F--F--F--F--F--F',
    rules: {
      F: '-F[--F--F]++F--F+'
    },
    angle: Math.PI / 6,
    stepLength: 8,
    center: {
      x: cWidth / 2 + 50,
      y: 100
    },
    iterations: 4
  },
  'William McWorter Maze01': {
    id: 36,
    axiom: 'F+F+F',
    rules: {
      F: 'F+FF-F'
    },
    angle: 2 * Math.PI / 3,
    stepLength: 8,
    center: {
      x: 200,
      y: cHeight / 2 + 150
    },
    iterations: 6
  },
  'William McWorter Maze&Fractal1': {
    id: 37,
    axiom: 'X',
    rules: {
      X: 'FY+FYFY-FY',
      Y: 'FX-FXFX+FX'
    },
    angle: 2 * Math.PI / 3,
    stepLength: 2,
    center: {
      x: 200,
      y: cHeight / 2 + 150
    },
    iterations: 7
  },
  'William McWorter Moore': {
    id: 38,
    axiom: 'X',
    rules: {
      X: 'FX+FX+FXFYFX+FXFY-FY-FY-',
      Y: '+FX+FX+FXFY-FYFXFY-FY-FY'
    },
    angle: Math.PI / 2,
    stepLength: 2,
    center: {
      x: cWidth / 2,
      y: cHeight / 2 + 150
    },
    iterations: 5
  },
  'William McWorter Pentan': {
    id: 39,
    axiom: 'X-X-X-X-X',
    rules: {
      X: 'FX-FX-FX+FY+FY+FX-FX',
      Y: 'FY+FY-FX-FX-FY+FY+FY'
    },
    angle: 2 * Math.PI / 5,
    stepLength: 2,
    center: {
      x: cWidth / 2 + 200,
      y: cHeight / 2 - 100
    },
    iterations: 4
  },
  'William McWorter Pentl': {
    id: 40,
    axiom: 'F-F-F-F-F',
    rules: {
      F: 'F-F-F++F+F-F'
    },
    angle: 2 * Math.PI / 5,
    stepLength: 2,
    center: {
      x: cWidth / 2,
      y: cHeight / 2 - 300
    },
    iterations: 5
  },
  'William McWorter Sierpinsk': {
    id: 41,
    axiom: 'L--F--L--F',
    rules: {
      L: '+R-F-R+',
      R: '-L+F+L-'
    },
    angle: Math.PI / 4,
    stepLength: 6,
    center: {
      x: 0,
      y: cHeight / 2
    },
    iterations: 12
  },
  'Anthony Hanmer ADH231a ': {
    id: 42,
    axiom: 'F++++F',
    rules: {
      F: 'F+F+F++++F+F+F'
    },
    angle: Math.PI / 4,
    stepLength: 6,
    center: {
      x: 0,
      y: cHeight / 2
    },
    iterations: 4
  },
  'Anthony Hanmer ADH256a': {
    id: 43,
    axiom: 'F+F+F+F++F-F-F-F',
    rules: {
      F: 'F+F++F+FF'
    },
    angle: Math.PI / 2,
    stepLength: 6,
    center: {
      x: cWidth / 2 - 300,
      y: cHeight / 2 + 200
    },
    iterations: 4
  },
  'Anthony Hanmer ADH258a': {
    id: 44,
    axiom: 'F++F++F+++F--F--F',
    rules: {
      F: 'FF++F++F++FFF'
    },
    angle: Math.PI / 3,
    stepLength: 10,
    center: {
      x: cWidth / 2 - 300,
      y: cHeight / 2 + 200
    },
    iterations: 3
  },
  SaWeed: {
    id: 45,
    axiom: 'F',
    rules: {
      F: 'F[+FF-F]F[-FF]F'
    },
    angle: Math.PI / 7,
    stepLength: 3,
    center: {
      x: cWidth / 2,
      y: cHeight
    },
    iterations: 5,
    initialAngle: -Math.PI / 2
  }
};

const imageContainer = document.getElementsByClassName('imageList')[0];
const stats = document.getElementById('stats');
const name = document.getElementById('name');
const download = document.getElementById('download');

// controls

const axiom = document.getElementById('axiom') as HTMLInputElement;
const angle = document.getElementById('angle') as HTMLInputElement;
const rules = document.getElementById('rules') as HTMLInputElement;
const centerX = document.getElementById('X') as HTMLInputElement;
const centerY = document.getElementById('Y') as HTMLInputElement;
const iterations = document.getElementById('iterations') as HTMLInputElement;
const stepLength = document.getElementById('stepLength') as HTMLInputElement;
const initialAngle = document.getElementById('initialAngle') as HTMLInputElement;
const canvasColor = document.getElementById('canvasColor') as HTMLInputElement;
const colorize = document.getElementById('colorizeShape') as HTMLInputElement;
const toDeg = document.getElementById('toDeg');
const warning = document.getElementById('warning');
const openControls = document.getElementById('openControls');

canvasColor.value = '#ffffff';
colorize.checked = false;

const controls = [
  axiom,
  angle,
  rules,
  centerX,
  centerY,
  iterations,
  stepLength,
  initialAngle,
  canvasColor,
  colorize
];

const shapesNamesList = Object.keys(SHAPES);
shapesNamesList.forEach((element, i) => {
  const image = document.createElement('img');
  const id = SHAPES[element].id;
  image.setAttribute('src', `https://igorkonovalov.github.io/assets/FULL/L-systems/src/img/${id}.png`);
  image.setAttribute('class', 'shapePreview');
  image.setAttribute('data-id', id);
  imageContainer.appendChild(image);
});

const previews = document.getElementsByClassName('shapePreview');
const previewsArr = Array.from(previews);

previewsArr.forEach(preview => {
  preview.addEventListener('click', e => {
    previewsArr.forEach(el => el.classList.remove('active'));
    preview.classList.toggle('active');
    drawFromPreview(preview);
  });
});

controls.forEach((control: HTMLInputElement) =>
  control.addEventListener(control === colorize ? 'click' : 'input', e => {
    previewsArr.forEach(el => el.classList.remove('active'));
    const newRules = htmlToJson(rules.value);
    if (
      control !== colorize &&
      control !== canvasColor &&
      control !== rules &&
      control !== axiom &&
      isNaN(parseInt(control.value))
    ) {
      warning.innerHTML = 'provided value must be a number';
      return;
    }
    if (parseInt(iterations.value) > 10) {
      warning.innerHTML = 'too many iterations, please use < 10';
      return;
    } else if (stepLength.value === '') {
      warning.innerHTML = 'pleace provide step value';
      return;
    }
    warning.innerHTML = '';
    const newShapeObject = {
      id: Infinity,
      axiom: axiom.value,
      rules: newRules,
      angle: angle.value,
      stepLength: stepLength.value,
      center: {
        x: centerX.value,
        y: centerY.value
      },
      initialAngle: initialAngle.value || 0,
      iterations: iterations.value
    };
    Object.assign(state, {
      canvasColor: canvasColor.value,
      shapeColor: colorize.checked
    });
    drawFromControls(newShapeObject);
  })
);

let draggin = false;
const mouseCoord: { x?: number; y?: number; } = {};
canvas.addEventListener('mousedown', e => {
  draggin = true;
  canvas.style.cursor = 'move';
  Object.assign(mouseCoord, {
    x: e.offsetX,
    y: e.offsetY
  });
});
canvas.addEventListener('mouseup', e => {
  draggin = false;
  canvas.style.cursor = 'grab';
  tempObject.center = {
    x: Number(tempObject.center.x - (mouseCoord.x - e.offsetX)),
    y: Number(tempObject.center.y - (mouseCoord.y - e.offsetY))
  };
  Object.assign(mouseCoord, {
    x: 0,
    y: 0
  });
});

canvas.addEventListener('wheel', e => {
  if (e.deltaY > 0) {
    tempObject.stepLength = Number(tempObject.stepLength) + 0.1;
    draw(tempObject, state);
  } else {
    tempObject.stepLength = Number(tempObject.stepLength) - 0.1;
    draw(tempObject, state);
  }
});

canvas.addEventListener('mousemove', e => {
  if (draggin) {
    draw(tempObject, state, {
      x: mouseCoord.x - e.offsetX,
      y: mouseCoord.y - e.offsetY
    });
    centerX.value = '' + (tempObject.center.x - (mouseCoord.x - e.offsetX));
    centerY.value = '' + (tempObject.center.y - (mouseCoord.y - e.offsetY));
  }
});

download.addEventListener('click', () => {
  const image = canvas
    .toDataURL('image/png')
    .replace('image/png', 'image/octet-stream');
  download.setAttribute('href', image);
});

openControls.addEventListener('click', () => {
  document
    .getElementsByClassName('controls')[0]
    .classList.toggle('showControls');
});

document.addEventListener('keypress', e => {
  if (e.keyCode === 38) {
    previewsArr.forEach(preview => {
      if (preview.classList.contains('active') && preview.previousSibling) {
        preview.classList.remove('active');
        const previousSibling = preview.previousSibling as HTMLElement;
        previousSibling.scrollIntoView();
        previousSibling.classList.add('active');
        drawFromPreview(previousSibling);
      }
    });
  } else if (e.keyCode === 40) {
    previewsArr.some(preview => {
      if (preview.classList.contains('active')) {
        preview.classList.remove('active');
        const nextSibling = preview.nextSibling as HTMLElement;
        nextSibling.scrollIntoView();
        nextSibling.classList.add('active');
        drawFromPreview(nextSibling);
        return true;
      }
    });
  }
});

// initial settings

cx.strokeStyle = 'blue';
cx.globalAlpha = 1;

const state = {
  canvasColor: 'white',
  shapeColor: false
};

let tempObject; // store object

// helper functions

const jsonToHTML = rules => {
  let res = '';
  const keys = Object.keys(rules);
  keys.forEach(key => (res += `${key} => ${rules[key]}\n`));
  return res;
};

const htmlToJson = html => {
  let res = {};
  let stringsArr = html.trim().split('\n');
  stringsArr.forEach(str => {
    let rule = str.split('=>');
    res[rule[0].trim()] = rule[1].trim();
  });
  return res;
};

const degToRad = deg => Math.round(deg * Math.PI / 18) / 10;
const radToDeg = (rad = 0) => 180 * rad / Math.PI;

const setInitialState = () => cx['resetTransform']();
const clearCanvas = () => cx.clearRect(0, 0, cx.canvas.width, cx.canvas.height);

// Lshape container object

function Lshape(
  {
    axiom,
    rules,
    angle,
    stepLength,
    center,
    iterations,
    initialAngle,
    closePath
  },
  name
) {
  this.name = name;
  this.axiom = axiom;
  this.rules = rules;
  this.angle = angle;
  this.stepLength = stepLength;
  this.center = center;
  this.iterations = iterations;
  this.initialAngle = initialAngle;
  this.closePath = closePath;
  this.currentState = axiom;
}

Lshape.prototype.step = function() {
  const arrState = this.currentState.split('');
  const nextStepArr = arrState.map(el => {
    let res = el;
    if (this.rules[el]) {
      return (res = this.rules[el]);
    }
    return res;
  });
  this.currentState = nextStepArr.join('');
};

Lshape.prototype.iterate = function() {
  for (let i = 0; i < this.iterations; i++) {
    this.step();
  }
};

// Initial render

const shapeNames = Object.keys(SHAPES);
const randomShape = Math.ceil(Math.random() * shapeNames.length);
const shape = new Lshape(
  SHAPES[shapeNames[randomShape - 1]],
  shapeNames[randomShape - 1]
);

shape.iterate();
previewsArr.forEach(el => {
  if (el.getAttribute('data-id') === SHAPES[shapeNames[randomShape - 1]].id) {
    el.classList.add('active');
  }
});

// update controls

const updateControls = (shape, now) => {
  stats.innerHTML = `The ${shape.name} rendered in ${Date.now() - now}ms`;
  download.setAttribute('download', `${shape.name.replace(/ /g, '_')}.png`);
  name.innerHTML = shape.name;
  axiom.value = shape.axiom;
  angle.value = shape.angle;
  rules.value = jsonToHTML(shape.rules);
  centerX.value = shape.center.x;
  centerY.value = shape.center.y;
  iterations.value = shape.iterations;
  initialAngle.value = shape.initialAngle || '';
  stepLength.value = '' + (Math.round(shape.stepLength * 10) / 10);
  toDeg.innerHTML = `in deg: ${Math.round(radToDeg(shape.angle))}`;
};

//
// DRAW
//

const draw = (shape, state, dragState?) => {
  const now = Date.now();
  const center = shape.center;
  const stepLength = shape.stepLength;
  setInitialState();
  clearCanvas();
  canvas.style.backgroundColor = state.canvasColor;
  cx.translate(center.x, center.y);
  if (typeof dragState === 'undefined') {
    cx.moveTo(stepLength, 0);
  } else {
    cx.translate(stepLength - dragState.x, -dragState.y);
  }
  const angle = shape.angle;
  const stepsArr = shape.currentState.split('');

  if (shape.initialAngle) {
    cx.rotate(shape.initialAngle);
  }
  stepsArr.forEach((step, i) => {
    switch (step) {
      case '+':
        cx.rotate(-angle);
        break;
      case '-':
        cx.rotate(angle);
        break;
      case '[':
        cx.save();
        break;
      case ']':
        cx.restore();
        break;
      case 'F':
        cx.beginPath();
        state.shapeColor
          ? (cx.strokeStyle = `hsl(${i / 30}, 100%, 50%)`)
          : (cx.strokeStyle = 'blue');
        cx.moveTo(0, 0);
        cx.lineTo(stepLength, 0);
        cx.translate(stepLength, 0);
        cx.stroke();
        break;
      case 'f':
        cx.moveTo(stepLength, 0);
        cx.translate(stepLength, 0);
        break;
      case 'b':
        cx.moveTo(stepLength, 0);
        cx.translate(stepLength, 0);
        break;
    }
  });
  if (typeof shape.closePath === 'undefined') {
    cx.closePath();
  }
  cx.stroke();
  updateControls(shape, now);
};

// initial draw
tempObject = shape;
draw(shape, state);

const drawFromPreview = elem => {
  const id = elem.getAttribute('data-id');
  let shapeToDraw;
  for (let shape in SHAPES) {
    if (SHAPES[shape].id === id) {
      shapeToDraw = new Lshape(SHAPES[shape], shape);
    }
  }
  shapeToDraw.iterate();
  tempObject = shapeToDraw;
  draw(shapeToDraw, state);
};

const drawFromControls = obj => {
  const shapeToDraw = new Lshape(obj, 'My shape');
  shapeToDraw.iterate();
  tempObject = shapeToDraw;
  draw(shapeToDraw, state);
};
