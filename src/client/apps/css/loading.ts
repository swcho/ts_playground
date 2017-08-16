
// https://codepen.io/swcho/pen/wqPZrO

import './loading.scss';
const html = require<string>('./loading.pug');
console.log(html)
$('body').append($('<div>').html(html));
