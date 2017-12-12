
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';
const NF = 50;

let rID = null, f = 0, dir = -1;

function stopAni() {
    cancelAnimationFrame(rID);
    rID = null;
};

function update() {
    f += dir;

    let k = f / NF;

    document.body.style.setProperty(
        '--stop',
        `${+(k * 100).toFixed(2)}%`
    );

    if (!(f % NF)) {
        stopAni();
        return;
    }

    rID = requestAnimationFrame(update)
};

addEventListener('click', e => {
    if (rID) stopAni();
    dir *= -1;
    update();
}, false);
