
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

let plus = document.getElementById('plus');

function plusToggle() {
   plus.classList.toggle('plus--active');
}

plus.addEventListener('click', plusToggle);
