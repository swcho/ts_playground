
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';
// uses parallax.js
// pen by beatrize

declare global {
    const Parallax;
}

let scene = document.getElementById('scene');
let parallax = new Parallax(scene, {
  relativeInput: true,
  clipRelativeInput: false,
  hoverOnly: true,
  calibrateX: false,
  calibrateY: true,
  invertX: false,
  invertY: true,
  limitX: true,
  limitY: 20,
  scalarX: 5,
  scalarY: 0,
  frictionX: 0.2,
  frictionY: 0.8,
  originX: 0.0,
  originY: 0.1,
  precision: 1
});

