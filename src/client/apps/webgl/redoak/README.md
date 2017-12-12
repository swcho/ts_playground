Red Oak
===

[Origin](https://codepen.io/darrylhuffman/pen/OjjPBN)

Distort position with [noise function](https://www.shadertoy.com/view/lsf3WH).

``` glsl
    pos = rotate2d( noise(pos + (u_time / 10.0)) ) * pos + (u_time / 2.0);
```

Draw lines

``` glsl
float lines(in vec2 pos, float b){
    // float scale = 15.0;
    // pos *= scale;
    return smoothstep(0.0,
                    .5 + b * .5,
                    // pos.x);
                    // abs(sin(pos.y * 15.0 * 6.5)) * .5
                    abs(sin(pos.x * 15.0 * 6.5)) * .5
                    // abs((sin(pos.x * 6.5) + b * 2.0)) * .5
                    );
}
```
