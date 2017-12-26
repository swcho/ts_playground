
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

declare global {
    interface Element {
        setAttribute(name: string, value: any): void;
    }
}

const scene = document.querySelector('a-scene');
const colors = ["tomato", "gold", "orange", "limegreen", "dodgerblue", "#663399"];
let i = 0;

function addBalls() {
    let ball = document.createElement('a-sphere');
    ball.setAttribute('radius', 0.5);
    ball.setAttribute('mass', 0.5);
    ball.setAttribute('position', (Math.random() * 14 - 7) + ' ' + (Math.random() * 5 + 2) + ' ' + (Math.random() * 14 - 7));
    ball.setAttribute('color', colors[Math.floor(Math.random() * colors.length)]);
    ball.setAttribute('dynamic-body', true);
    scene.appendChild(ball);

    // ball.addEventListner('click', function() {
    //   ball.parentNode.removeChild(ball);
    // });

    if (i < 600) {
        i++;
        window.setTimeout(addBalls, 2);
    }
}

addBalls();
