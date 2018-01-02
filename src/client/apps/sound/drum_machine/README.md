Drum Machine
===

[출처](https://codepen.io/teropa/pen/PKoYXM)

While porting code to TypeScript, had problem of having `Map` type to be interated.

``` typescript
    for (const [renderTime, drumRenderings] of renderings.entries()) {
```

Working work-around.

``` typescript
    for (const [renderTime, drumRenderings] of Array.from(renderings.entries())) {
```

Discussion can be found hear, <https://github.com/Microsoft/TypeScript/issues/11209>

Use [redom.js](https://redom.js.org/) for rendering HTML.

Use [lodash transform](https://lodash.com/docs/4.17.4#transform) to convert samples file to `Tone.Buffer`.

Use [lodash sample](https://lodash.com/docs/4.17.4#sample) to pick random drum sample.

Use [lodash range](https://lodash.com/docs/4.17.4#range) to make iteratable array.
