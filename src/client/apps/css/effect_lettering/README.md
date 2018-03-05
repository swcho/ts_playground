Button Hover Effect With `lettering.js` and `gsap`
===

[출처](https://codepen.io/hexagoncircle/pen/vJNMrB)

Using [lettering.js](https://github.com/davatron5000/Lettering.js) which seperate text content into seperated tags by letters, workds, lines.

![1](2018-03-05-11-41-46.png)

Basically, all buttons has `::before` element which draws gradients.

And the `::before` element is hidden with `<button>`'s `overflow: hidden`.

![2](2018-03-05-11-46-36.png)

Same way, inner text is hidden.

![3](2018-03-05-11-47-11.png)

On hovering button, it displays lower text with animation.

Using [staggerTo](https://greensock.com/docs/TimelineMax/staggerTo), add character wise staggering animation effect.
