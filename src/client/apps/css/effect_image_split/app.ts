
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

const image = 'https://images.unsplash.com/photo-1500531279542-fc8490c8ea4d?dpr=1&auto=format&fit=crop&w=1500&h=999&q=80&cs=tinysrgb&crop=';

const el = document.querySelector('.img-container') as HTMLDivElement;
let elW = el.offsetWidth;
let elH = el.offsetHeight;
let gridX = 5, gridY = 5;

function draw() {
    el.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let x = 0; x < gridX; x++) {
        for (let y = 0; y < gridY; y++) {

            const w = elW / gridX * 101 / elW;
            const h = elH / gridY * 101 / elH;
            const l = elW / gridX * x * 100 / elW;
            const t = elH / gridY * y * 100 / elH;
            const posX = - (elW / gridX * x);
            const posY = - (elH / gridY * y);

            const item = Object.assign(document.createElement('div'), {
                className: 'img-item',
            });
            const scale = elH / elW;
            item.style.cssText = `
        top: ${t}%;
        left: ${l}%;
        width: ${w}%;
        height: ${h}%;
        background-image: url(${image});
        background-size: ${elW}px ${elW * scale}px;
        background-position: ${posX}px ${posY}px;
        transition: all .7s ease;
        transition-delay: ${x * .5}s ${y * .5}s;
      `;
            fragment.appendChild(item);
        }
    }
    el.appendChild(fragment);
}

draw();

el.addEventListener('click', () => {
    el.classList.toggle('active');
});
