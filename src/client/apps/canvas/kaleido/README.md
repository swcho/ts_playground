Symmetric Harmony
===

[Origin](https://codepen.io/tmrDevelops/pen/GvjMwg)

![Original Image](ksImg.jpg)

![](2017-11-22-11-03-29.png)

With original image, create kaleido style.

Load a image, draw it in single canvas.

Create `CanvasPattern` from selected image using `createPattern`.

Try to display `fillStyle` by fill rect whole screen.

``` typescript
        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
```

![](2017-11-22-11-30-39.png)

Create stock image with 6 traiangles.

![](2017-11-22-12-08-15.png)

Repeat draw stock image to fill screen.

![](2017-11-22-12-10-10.png)

Draw a triangle and adjust draw position and rotation then fill with `fillStyle`.

Draw 6 triangles and repeat it.