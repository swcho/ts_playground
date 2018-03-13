Pulse World
===

[Origin](https://codepen.io/jsylvanus/pen/qXLNMb)

``` glsl
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemap_texture);
```

`TEXTURE_CUBE_MAP` is for cube texture mapping.

``` glsl
    gl.uniformMatrix4fv(gl.getUniformLocation(sprog, 'u_modelview'), false, getCameraMatrix(48, 30, t2 / 10));
```

For rotation animation.

``` glsl
        // float scale = min(sin(u_tval + a_toffset * 3.14159 * 2.0) + 1.0, 1.0);
        float dist = sqrt(dot(a_offset, a_offset)) / 6.0;
        float scale = min(sin(u_tval + dist) * 0.5 + 0.5, 1.0);
        float distscale = 1.15 + sin(u_tval) * 0.15;
        gl_Position = u_projection * u_modelview * vec4(a_position * scale + a_offset * distscale, 1);
```

Using `u_tval` heart beat effect applied.
