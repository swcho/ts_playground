
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

import './style.scss';

// DATE DEFAULT

// var date = new Date();

// var day = date.getDate();
// var month = date.getMonth() + 1;
// var year = date.getFullYear();

// if (month < 10) month = "0" + month;
// if (day < 10) day = "0" + day;

// var today = year + "-" + month + "-" + day;


// document.getElementById('date').value = today;

// //  NUMBER STEPPER

// Array.prototype.slice.call(document.querySelectorAll('.quantity-container'))
//     .map(function (container) {
//         return {
//             input: container.querySelector('.quantity-amount'),
//             decrease: container.querySelector('.decrease'),
//             increase: container.querySelector('.increase'),
//             get value() { return parseInt(this.input.value); },
//             set value(v) { this.input.value = v; }
//         }
//     })
//     .forEach(function (item) {
//         item.decrease.addEventListener('click', function () {
//             item.value -= 1;
//         });
//         item.increase.addEventListener('click', function () {
//             item.value += 1;
//         });
//     });
