title
===

[Origin](https://codepen.io/clindsey/pen/QMGbKb)

Make letter image using canvas.

From drawn canvas image buffer(linear buffer), get drawn pixcel index.
Thus, **letter index buffer** contains linearly drawn position index for each letters.
Thus, actual `x`, `y` postion derived by `x = index % size` and `y = Math.floor(index / size)`.

Using [TetrahedronGeometry](https://threejs.org/docs/#api/geometries/TetrahedronGeometry) as a prefab.

Make 5000 prefab with `THREE.BAS.PrefabBufferGeometry`.

Create attributes per letter. Since 10 letters applied, `aLetterData0` ~ `aLatterData9` created.

5000 prefab has 10 letters position attributes.

Each prefab's postion pre-determined by taking random position from **letter index buffer**.

From these pre-determined postion, each frame position calculated by mixing prev and next positon in proportion with `easeCubicInOut`.

``` glsl
          float progress = mod(uTime, uDuration) / uDuration;
          float easeProgress = fract(progress * 10.0);
          if (progress >= 0.9) {        transformed += mix(aLetterData9, aLetterData0, easeCubicInOut(easeProgress));
          } else if (progress >= 0.8) { transformed += mix(aLetterData8, aLetterData9, easeCubicInOut(easeProgress));
          } else if (progress >= 0.7) { transformed += mix(aLetterData7, aLetterData8, easeCubicInOut(easeProgress));
          } else if (progress >= 0.6) { transformed += mix(aLetterData6, aLetterData7, easeCubicInOut(easeProgress));
          } else if (progress >= 0.5) { transformed += mix(aLetterData5, aLetterData6, easeCubicInOut(easeProgress));
          } else if (progress >= 0.4) { transformed += mix(aLetterData4, aLetterData5, easeCubicInOut(easeProgress));
          } else if (progress >= 0.3) { transformed += mix(aLetterData3, aLetterData4, easeCubicInOut(easeProgress));
          } else if (progress >= 0.2) { transformed += mix(aLetterData2, aLetterData3, easeCubicInOut(easeProgress));
          } else if (progress >= 0.1) { transformed += mix(aLetterData1, aLetterData2, easeCubicInOut(easeProgress));
          } else {                      transformed += mix(aLetterData0, aLetterData1, easeCubicInOut(easeProgress));
          }
```

> TODO
Chnage easing function.
Apply quatanion rotation.
