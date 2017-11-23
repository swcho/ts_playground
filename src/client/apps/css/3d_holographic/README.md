CSS 3D: Pseudo Holographic Image
===

[출처](https://codepen.io/MassivePenguin/pen/QMGdor)

Seperate animation for each layer item.

Try combine those with single 3D transition animation.

```css
#card.test {
    transform-style: preserve-3d;
    transform-origin: center center 0px;
    animation: rotate-card-base-test 5s infinite;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    overflow: visible;

    .layer1 {
        transform: translateZ(10px);
    }
    .layer2 {
        transform: translateZ(20px);
    }
    .layer3 {
        transform: translateZ(30px);
    }
    .layer4 {
        transform: translateZ(40px);
    }
    .layer5 {
        transform: translateZ(50px);
    }
    .layer6 {
        transform: translateZ(60px);
    }
}
```

With above css, wrapper element should have `perspective: 550px;`.

Working in FF, but hell boy hidden in Chrome.