Text Color Gradient Animation
===

[출처](https://codepen.io/erictreacy/pen/YpjVaY)

``` css
    background-image: -webkit-linear-gradient(92deg, #cc5500, #ccbb00);
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
```

Draw background image with gradient.

Set text fill color as transparent.

Background clip with `text`.

Equvalent style

``` css
    background-image: -webkit-linear-gradient(92deg, #cc5500, #ccbb00);
    -webkit-background-clip: text;
    color: transparent;
```