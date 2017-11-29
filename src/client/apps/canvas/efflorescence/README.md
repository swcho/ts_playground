efflorescence
===

[Origin](https://codepen.io/tmrDevelops/pen/prbdOY)

![](2017-11-29-10-49-24.png)

Draw a circle with dots.
Apply wave by magnifying sin function.

``` typescript
let _x = Math.cos(a) * (circle.radius - circle.variation * Math.sin(i * Math.PI / 18));
let _y = Math.sin(a) * (circle.radius - circle.variation * Math.sin(i * Math.PI / 18));
```