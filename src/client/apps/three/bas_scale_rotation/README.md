Scale & Rotation With BAS
===

[Origin](https://codepen.io/zadvorsky/pen/yXdLEW)

![](2017-11-21-10-41-57.png)

Moving rectangles.
`THREE.BAS.PrefabBufferGeometry(prefab, cubeCount)` creates many geometry instances from base.

``` glsl
            // progress is calculated based on the time uniform, and the duration and startTime attributes
            float progress = clamp(time - startTime, 0.0, duration) / duration;

            // use the single argument variant of the easing function to ease the progress
            // the function names are camel cased by convention
            progress = easeCubicInOut(progress);

            // calculate the quaternion representing the desired rotation
            // we use the axis stored in the attribute and calculate rotation based on progress
            vec4 quat = quatFromAxisAngle(rotation.xyz, rotation.w * progress);

            // 'transformed' is a variable defined by THREE.js.
            // it is used throughout the vertex shader to transform the vertex position

            // rotate the vertex by applying the quaternion
            transformed = rotateVector(quat, transformed);

            // scale based on progress
            // progress 0.0 = scale 0.0
            // progress 0.5 = scale 1.0
            // progress 1.0 = scale 0.0
            float scl = progress * 2.0 - 1.0;
            scl = 1.0 - scl * scl;
            transformed *= scl;

            // 'mix' is a built-in GLSL method that performs linear interpolation
            transformed += mix(startPosition, endPosition, progress);
```
