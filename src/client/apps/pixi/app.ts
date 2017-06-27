
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

import * as PIXI from 'pixi.js';

const imgBunny = require('./bunny.png');

const width = 400;
const height = 200;
var app = new PIXI.Application(width, height, {backgroundColor : 0x1099bb}, true);
document.body.appendChild(app.view);

// create a new Sprite from an image path
var bunny = PIXI.Sprite.fromImage('/' + imgBunny)

var basicText = new PIXI.Text('하정아 어지러워 ~~');
basicText.x = app.renderer.width / 2;
basicText.y = app.renderer.height / 2;
basicText.anchor.set(0.5);

// center the sprite's anchor point
bunny.anchor.set(0.5);

// move the sprite to the center of the screen
bunny.x = app.renderer.width / 2;
bunny.y = app.renderer.height / 2;

app.stage.addChild(bunny);
app.stage.addChild(basicText);

let diffX = 1;
let diffY = 1;
let rotationDir = 1;
const table = ['1_1', '1_-1', '-1_-1', '-1_1'];
// Listen for animate update
app.ticker.add(function(delta) {
    // just for fun, let's rotate mr rabbit a little
    // delta is 1 if running at 100% performance
    // creates frame-independent tranformation
    let x = bunny.position.x;
    let y = bunny.position.y;
    const prevUnitX = diffX;
    const prevUnitY = diffY;
    const prevIndexOf = table.indexOf(prevUnitX + '_' + prevUnitY);
    if (x < 0 || width < x) {
        diffX = -diffX;
    }
    if (y < 0 || height < y) {
        diffY = -diffY;
    }
    const nextUnitX = diffX;
    const nextUnitY = diffY;
    const nextIndexOf = table.indexOf(nextUnitX + '_' + nextUnitY);
    if (prevIndexOf !== nextIndexOf) {
        console.log('index', prevIndexOf, nextIndexOf);
        rotationDir = nextIndexOf - prevIndexOf;
    }
    console.log('dir', rotationDir)
    bunny.rotation += rotationDir * 0.1 * delta;
    basicText.rotation += rotationDir * 0.1 * delta;
    bunny.position.x = x + diffX;
    bunny.position.y = y + diffY;
});
