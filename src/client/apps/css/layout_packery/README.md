Drag 하고, 촘촘히 세우는 레이아웃
===

[출처](https://codepen.io/desandro/pen/qXOZdB)

[packery](https://github.com/metafizzy/packery)와 [draggabilly](https://github.com/desandro/draggabilly)를 사용한다.

[draggabilly](https://github.com/desandro/draggabilly)는 CSS `position: absolute`로 바꾸지 않고, `translate`를 사용함으로 써, 다른 레이아웃에 방해를 주지 않는다.

반면, packery는 모든 child element를 absolute로 변경 함으로, `columnWidth`, `rowHeight`와 같은 설정 값을 가진다.

[metafizzy](https://metafizzy.co/) 사이트에서는 그 밖에 재미있는 라이브러리들이 있다.
