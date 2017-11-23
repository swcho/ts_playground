Plotly.js Mapbox - Multiple Markers
===

[출처](https://codepen.io/plotly/pen/Xajjjm)

**Module**(**external module**) is a file with a top level `import` or `export`.

**Script** is a file that is not a **module**.

**ambient** is a file that does not have an implementation.

Finding way to use module definition only when the module is included in `head` globally.

plotly.js is included with `script` tag.
TypeScript definition is defined as module definition.
Using definition requires `import * as Plotly from 'plotly.js';`.
But don't have actual module installed.
Fake webpack as below.

``` typescript
    externals: {
        'plotly.js': 'Plotly',
    },
```

References
* <https://github.com/Microsoft/TypeScript-Handbook/issues/180>
* <https://github.com/Microsoft/TypeScript/issues/10178#issuecomment-263030856>
* <https://github.com/Microsoft/TypeScript/issues/10178#issuecomment-285357649>
