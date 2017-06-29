

import './css3d.less';

const width = 200;
const height = 200;
const angleMaxX = 30;
const angleMaxY = 10;

// $('.rect').mousemove(function(evt) {
//     console.log('move2i', evt.offsetX, evt.offsetY);
//     const rotateX = (evt.offsetX - 100)/100 * angleMaxX;
//     const rotateY = (evt.offsetY - 100)/100 * angleMaxY;
//     $(this).css({
//         rotateX,
//         rotateY
//     })
// })
// $('.rect').mouseleave(function() {
//     $(this).css({
//         rotateX: 0,
//         rotateY: 0
//     })
// })
declare const module;
if(module.hot) {
    console.log('hooooot')
	module.hot.accept(function(err) {

        console.log('hooooot~~')
		if(err) {
			console.error("Cannot apply hot update", err);
		}
	});
}
