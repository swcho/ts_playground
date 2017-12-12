Wave By Vertex Shader
===

[Origin](https://codepen.io/nicoptere/pen/LjjQgG)

Use `THREE.ShaderMaterial` with next vertex shader.

``` glsl
    //compute the Z position of each vertex
    float dist = sin( pos.x + 3.14159 / 2. ) + cos( pos.y );
    pos.z = sin( dist * frequency + time ) * amplitude;
```