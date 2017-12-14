Canvas: Audio Visualizer
===

[Origin](https://codepen.io/enxaneta/pen/jLLNbZ)

Use `AudioContext` and its analyzer.

Rather than create `AudioAnalyzer` from `audio` tag, uses `XMLHttpRequest` to get audio content(mp3) and play it through `AudioBuffer` and `AudioBufferSourceNode`.

`AudioBufferSourceNode` => `AnalyzerNode` => `AudioDestinationNode`.

`da` is delta angle, create right side half circled bar and that of left side.

Draw small & large frequency bar.
